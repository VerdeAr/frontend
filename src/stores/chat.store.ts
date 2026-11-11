import { create } from "zustand";
import { chatService } from "@/services/chat.service";
import { socketService } from "@/services/socket.service";
import type {
	Chat,
	ChatConnectionStatus,
	ChatMessagePayload,
	Message,
} from "@/types";
import { useAuthStore } from "./auth.store";

const MESSAGES_PAGE_LIMIT = 50;
// Limpa o "digitando..." caso o aviso de parada se perca na rede
const TYPING_TIMEOUT_MS = 5000;

const EMPTY_MESSAGES: Message[] = [];

const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
let isRealtimeBound = false;

interface ChatState {
	chats: Chat[];
	messagesByChat: Record<string, Message[]>;
	unreadByChat: Record<string, number>;
	typingByChat: Record<string, boolean>;
	connectionStatus: ChatConnectionStatus;
	activeChatId: string | null;
	isLoadingChats: boolean;
	isLoadingMessages: boolean;
	isSending: boolean;
	error: string | null;

	// Ações da API
	fetchChats: () => Promise<Chat[]>;
	fetchChat: (chatId: string) => Promise<Chat | null>;
	fetchMessages: (chatId: string) => Promise<void>;
	startChat: (productId: string) => Promise<Chat>;
	sendMessage: (chatId: string, content: string) => Promise<void>;
	markAsRead: (chatId: string) => Promise<void>;

	// Sala aberta na tela
	openChat: (chatId: string) => void;
	closeChat: () => void;

	// Tempo real
	bindRealtime: () => void;
	connect: () => void;
	disconnect: () => void;
	joinAllChats: () => Promise<void>;
	receiveMessage: (payload: ChatMessagePayload) => void;
	reset: () => void;
}

function getCurrentUserId(): string | null {
	return useAuthStore.getState().user?.id ?? null;
}

function toMessage(payload: ChatMessagePayload): Message {
	return {
		id: payload.id,
		chat_id: payload.chat_id,
		sender_id: payload.sender_id,
		content: payload.content,
		is_read: payload.is_read,
		created_at: payload.created_at,
	};
}

// Adiciona sem duplicar: o remetente recebe a própria mensagem no ack e no `new_message`
function appendMessage(list: Message[], message: Message): Message[] {
	if (list.some((m) => m.id === message.id)) {
		return list;
	}
	return [...list, message];
}

function sortByLastMessage(chats: Chat[]): Chat[] {
	return [...chats].sort((a, b) => {
		const aTime = a.last_message_at ? Date.parse(a.last_message_at) : 0;
		const bTime = b.last_message_at ? Date.parse(b.last_message_at) : 0;
		return bTime - aTime;
	});
}

function touchChat(chats: Chat[], chatId: string, createdAt: string): Chat[] {
	return sortByLastMessage(
		chats.map((chat) =>
			chat.id === chatId ? { ...chat, last_message_at: createdAt } : chat,
		),
	);
}

const initialState = {
	chats: [],
	messagesByChat: {},
	unreadByChat: {},
	typingByChat: {},
	connectionStatus: "desconectado" as ChatConnectionStatus,
	activeChatId: null,
	isLoadingChats: false,
	isLoadingMessages: false,
	isSending: false,
	error: null,
};

export const useChatStore = create<ChatState>((set, get) => ({
	...initialState,

	fetchChats: async () => {
		try {
			set({ isLoadingChats: true, error: null });
			const chats = await chatService.listChats();
			// Não há contagem por conversa em GET /chats; busca em paralelo
			const counts = await Promise.all(
				chats.map((chat) => chatService.getUnreadCount(chat.id)),
			);
			const unreadByChat: Record<string, number> = {};
			chats.forEach((chat, index) => {
				unreadByChat[chat.id] = counts[index] ?? 0;
			});
			set({ chats, unreadByChat, isLoadingChats: false });
			return chats;
		} catch (err) {
			console.error("Erro ao buscar conversas:", err);
			set({
				isLoadingChats: false,
				error: "Não foi possível carregar as conversas.",
			});
			return [];
		}
	},

	fetchChat: async (chatId) => {
		const cached = get().chats.find((chat) => chat.id === chatId);
		if (cached) {
			return cached;
		}
		try {
			const chat = await chatService.getChat(chatId);
			set((state) => ({ chats: sortByLastMessage([...state.chats, chat]) }));
			return chat;
		} catch (err) {
			console.error("Erro ao buscar conversa:", err);
			set({ error: "Não foi possível carregar a conversa." });
			return null;
		}
	},

	fetchMessages: async (chatId) => {
		try {
			set({ isLoadingMessages: true, error: null });
			const page = await chatService.getMessages(chatId, {
				limit: MESSAGES_PAGE_LIMIT,
				order: "DESC",
			});
			// A API devolve as mais recentes primeiro; a tela exibe em ordem cronológica
			const messages = [...page.messages].reverse();
			set((state) => ({
				messagesByChat: { ...state.messagesByChat, [chatId]: messages },
				isLoadingMessages: false,
			}));
		} catch (err) {
			console.error("Erro ao buscar mensagens:", err);
			set({
				isLoadingMessages: false,
				error: "Não foi possível carregar as mensagens.",
			});
		}
	},

	startChat: async (productId) => {
		const chat = await chatService.startChat({ product_id: productId });
		set((state) => ({
			chats: state.chats.some((c) => c.id === chat.id)
				? state.chats
				: sortByLastMessage([...state.chats, chat]),
		}));
		if (socketService.isConnected()) {
			socketService.joinChat(chat.id).catch((err: unknown) => {
				console.error("Erro ao entrar na sala da conversa:", err);
			});
		}
		return chat;
	},

	sendMessage: async (chatId, content) => {
		try {
			set({ isSending: true, error: null });
			// Sem socket, envia pelo REST; o backend replica no `new_message`
			const message = socketService.isConnected()
				? toMessage(await socketService.sendMessage(chatId, content))
				: await chatService.sendMessage(chatId, content);
			set((state) => ({
				messagesByChat: {
					...state.messagesByChat,
					[chatId]: appendMessage(
						state.messagesByChat[chatId] ?? EMPTY_MESSAGES,
						message,
					),
				},
				chats: touchChat(state.chats, chatId, message.created_at),
				isSending: false,
			}));
		} catch (err) {
			console.error("Erro ao enviar mensagem:", err);
			set({
				isSending: false,
				error:
					err instanceof Error
						? err.message
						: "Não foi possível enviar a mensagem.",
			});
			throw err;
		}
	},

	markAsRead: async (chatId) => {
		set((state) => ({
			unreadByChat: { ...state.unreadByChat, [chatId]: 0 },
		}));
		try {
			if (socketService.isConnected()) {
				await socketService.markRead(chatId);
			} else {
				await chatService.markAsRead(chatId);
			}
		} catch (err) {
			console.error("Erro ao marcar mensagens como lidas:", err);
		}
	},

	openChat: (chatId) => {
		set({ activeChatId: chatId });
		void get().markAsRead(chatId);
	},

	closeChat: () => set({ activeChatId: null }),

	joinAllChats: async () => {
		// O socket perde as salas ao cair; entra de novo em todas as conversas
		const results = await Promise.allSettled(
			get().chats.map((chat) => socketService.joinChat(chat.id)),
		);
		for (const result of results) {
			if (result.status === "rejected") {
				console.error("Erro ao entrar na sala da conversa:", result.reason);
			}
		}
	},

	receiveMessage: (payload) => {
		const message = toMessage(payload);
		const isMine = message.sender_id === getCurrentUserId();
		const isActive = get().activeChatId === message.chat_id;

		set((state) => ({
			messagesByChat: {
				...state.messagesByChat,
				[message.chat_id]: appendMessage(
					state.messagesByChat[message.chat_id] ?? EMPTY_MESSAGES,
					message,
				),
			},
			chats: touchChat(state.chats, message.chat_id, message.created_at),
			unreadByChat:
				isMine || isActive
					? state.unreadByChat
					: {
							...state.unreadByChat,
							[message.chat_id]: (state.unreadByChat[message.chat_id] ?? 0) + 1,
						},
			typingByChat: isMine
				? state.typingByChat
				: { ...state.typingByChat, [message.chat_id]: false },
		}));

		if (!isMine && isActive) {
			void get().markAsRead(message.chat_id);
		}
	},

	bindRealtime: () => {
		if (isRealtimeBound) {
			return;
		}
		isRealtimeBound = true;
		const socket = socketService.getSocket();

		socket.on("connect", () => {
			set({ connectionStatus: "conectado" });
			// Recarrega a lista (pode haver conversa nova) e reentra nas salas
			void get()
				.fetchChats()
				.then(() => get().joinAllChats());
		});

		socket.on("disconnect", (reason) => {
			set({
				connectionStatus:
					reason === "io client disconnect" ? "desconectado" : "reconectando",
			});
		});

		socket.on("connect_error", (err) => {
			console.error("Erro de conexão com o chat:", err.message);
			// `active` falso: o servidor recusou (ex.: JWT inválido) e não haverá nova tentativa
			set({
				connectionStatus: socket.active ? "reconectando" : "desconectado",
			});
		});

		socket.on("new_message", (payload) => {
			get().receiveMessage(payload);
		});

		socket.on("user_typing", ({ chat_id, userId, is_typing }) => {
			if (userId === getCurrentUserId()) {
				return;
			}
			const previous = typingTimers.get(chat_id);
			if (previous) {
				clearTimeout(previous);
				typingTimers.delete(chat_id);
			}
			if (is_typing) {
				typingTimers.set(
					chat_id,
					setTimeout(() => {
						typingTimers.delete(chat_id);
						set((state) => ({
							typingByChat: { ...state.typingByChat, [chat_id]: false },
						}));
					}, TYPING_TIMEOUT_MS),
				);
			}
			set((state) => ({
				typingByChat: { ...state.typingByChat, [chat_id]: is_typing },
			}));
		});

		// O outro participante leu: marca as minhas mensagens como lidas (✓✓)
		socket.on("messages_read", ({ chat_id, readBy }) => {
			const currentUserId = getCurrentUserId();
			if (readBy === currentUserId) {
				return;
			}
			set((state) => {
				const messages = state.messagesByChat[chat_id];
				if (!messages) {
					return state;
				}
				return {
					messagesByChat: {
						...state.messagesByChat,
						[chat_id]: messages.map((m) =>
							m.sender_id === currentUserId && !m.is_read
								? { ...m, is_read: true }
								: m,
						),
					},
				};
			});
		});
	},

	connect: () => {
		get().bindRealtime();
		if (socketService.isConnected()) {
			return;
		}
		// Evita exibir "sem conexão" enquanto o primeiro handshake está em andamento
		set({ connectionStatus: "reconectando" });
		socketService.connect();
	},

	disconnect: () => {
		socketService.disconnect();
		get().reset();
	},

	reset: () => {
		for (const timer of typingTimers.values()) {
			clearTimeout(timer);
		}
		typingTimers.clear();
		set(initialState);
	},
}));

// ==================== Seletores Atômicos Desacoplados ====================

export const selectChats = (state: ChatState) => state.chats;

export const selectChatById = (chatId: string) => (state: ChatState) =>
	state.chats.find((chat) => chat.id === chatId) ?? null;

export const selectChatMessages = (chatId: string) => (state: ChatState) =>
	state.messagesByChat[chatId] ?? EMPTY_MESSAGES;

export const selectChatUnread = (chatId: string) => (state: ChatState) =>
	state.unreadByChat[chatId] ?? 0;

export const selectUnreadTotal = (state: ChatState) =>
	Object.values(state.unreadByChat).reduce((total, count) => total + count, 0);

export const selectIsTyping = (chatId: string) => (state: ChatState) =>
	state.typingByChat[chatId] ?? false;

export const selectConnectionStatus = (state: ChatState) =>
	state.connectionStatus;
