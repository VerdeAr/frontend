import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { chatService } from "@/services/chat.service";
import { type ChatSocket, socketService } from "@/services/socket.service";
import { criarUsuario } from "@/test/fixtures";
import type { Chat, Message } from "@/types";
import { useAuthStore } from "./auth.store";
import { mergeMessages, useChatStore } from "./chat.store";

// VER-112: mensagens recebidas durante a queda de conexão aparecem após a reconexão

vi.mock("@/services/chat.service", () => ({
	chatService: {
		listChats: vi.fn(),
		getChat: vi.fn(),
		getMessages: vi.fn(),
		getUnreadCount: vi.fn(),
		startChat: vi.fn(),
		sendMessage: vi.fn(),
		markAsRead: vi.fn(),
	},
}));

// Handlers registrados pelo store no socket simulado, para disparar os eventos à mão
const handlers = vi.hoisted(
	() => new Map<string, (...args: unknown[]) => void>(),
);

vi.mock("@/services/socket.service", () => {
	const fakeSocket = {
		active: true,
		on: (event: string, handler: (...args: unknown[]) => void) => {
			handlers.set(event, handler);
		},
	};
	return {
		socketService: {
			getSocket: vi.fn(() => fakeSocket as unknown as ChatSocket),
			isConnected: vi.fn(() => true),
			connect: vi.fn(),
			disconnect: vi.fn(),
			joinChat: vi.fn(),
			leaveChat: vi.fn(),
			sendMessage: vi.fn(),
			emitTyping: vi.fn(),
			markRead: vi.fn(),
		},
	};
});

const chats = vi.mocked(chatService);
const socket = vi.mocked(socketService);

const CHAT_ID = "conversa-ana-beto";
const OTHER_CHAT_ID = "conversa-ana-carla";

function criarConversa(id: string): Chat {
	return {
		id,
		customer_id: "ana",
		seller_id: "vendedor-beto",
		status: "ATIVO",
		last_message_at: "2026-11-25T10:00:00.000Z",
	};
}

function criarMensagem(
	id: string,
	createdAt: string,
	sobrescrever: Partial<Message> = {},
): Message {
	return {
		id,
		chat_id: CHAT_ID,
		sender_id: "beto",
		content: `Mensagem ${id}`,
		is_read: false,
		created_at: createdAt,
		...sobrescrever,
	};
}

function pagina(messages: Message[]) {
	return { messages, total: messages.length, page: 1, limit: 50 };
}

// Simula o socket voltando a se conectar e espera a sincronização terminar
async function reconectar(): Promise<void> {
	handlers.get("connect")?.();
	await vi.waitFor(() => {
		expect(chats.listChats).toHaveBeenCalled();
	});
	// O encadeamento fetchChats → joinAllChats → resync roda em microtarefas
	await new Promise((resolve) => setTimeout(resolve, 0));
}

beforeAll(() => {
	useChatStore.getState().bindRealtime();
});

beforeEach(() => {
	vi.clearAllMocks();
	socket.isConnected.mockReturnValue(true);
	useChatStore.getState().reset();
	useAuthStore.setState({ user: criarUsuario({ id: "ana" }) });
	vi.spyOn(console, "error").mockImplementation(() => {});

	chats.listChats.mockResolvedValue([
		criarConversa(CHAT_ID),
		criarConversa(OTHER_CHAT_ID),
	]);
	chats.getUnreadCount.mockResolvedValue(0);
	socket.joinChat.mockResolvedValue(undefined);
	socket.markRead.mockResolvedValue(1);
});

describe("chat.store: mergeMessages", () => {
	it("une sem duplicar, prefere a versão do servidor e ordena por data", () => {
		const antiga = criarMensagem("m1", "2026-11-25T10:00:00.000Z");
		const lidaNoServidor = { ...antiga, is_read: true };
		const nova = criarMensagem("m2", "2026-11-25T10:05:00.000Z");

		const resultado = mergeMessages([antiga], [nova, lidaNoServidor]);

		expect(resultado).toEqual([lidaNoServidor, nova]);
	});
});

describe("chat.store: reconexão do socket (VER-112)", () => {
	it("traz para a conversa aberta a mensagem recebida durante a queda", async () => {
		const antiga = criarMensagem("m1", "2026-11-25T10:00:00.000Z", {
			sender_id: "ana",
		});
		const perdida = criarMensagem("m2", "2026-11-25T10:05:00.000Z");
		useChatStore.setState({
			messagesByChat: { [CHAT_ID]: [antiga] },
			activeChatId: CHAT_ID,
		});
		// A API devolve as mais recentes primeiro; a minha mensagem já foi lida pelo Beto
		chats.getMessages.mockResolvedValue(
			pagina([perdida, { ...antiga, is_read: true }]),
		);
		chats.getUnreadCount.mockResolvedValue(1);

		await reconectar();

		await vi.waitFor(() => {
			expect(useChatStore.getState().messagesByChat[CHAT_ID]).toEqual([
				{ ...antiga, is_read: true },
				perdida,
			]);
		});
		const estado = useChatStore.getState();
		expect(estado.connectionStatus).toBe("conectado");
		expect(estado.isLoadingMessages).toBe(false);
		// A conversa aberta é marcada como lida e o contador volta a zero
		await vi.waitFor(() => {
			expect(socket.markRead).toHaveBeenCalledWith(CHAT_ID);
		});
		expect(useChatStore.getState().unreadByChat[CHAT_ID]).toBe(0);
	});

	it("busca as mensagens só depois de entrar de novo nas salas", async () => {
		useChatStore.setState({
			messagesByChat: { [CHAT_ID]: [] },
			activeChatId: CHAT_ID,
		});
		chats.getMessages.mockResolvedValue(pagina([]));

		await reconectar();

		await vi.waitFor(() => {
			expect(chats.getMessages).toHaveBeenCalledWith(CHAT_ID, {
				limit: 50,
				order: "DESC",
			});
		});
		const ultimoJoin = Math.max(...socket.joinChat.mock.invocationCallOrder);
		const primeiraBusca = chats.getMessages.mock.invocationCallOrder[0];
		expect(primeiraBusca).toBeGreaterThan(ultimoJoin);
	});

	it("sincroniza conversa carregada mas fechada sem marcá-la como lida", async () => {
		const perdida = criarMensagem("m3", "2026-11-25T10:05:00.000Z", {
			chat_id: OTHER_CHAT_ID,
		});
		useChatStore.setState({
			messagesByChat: { [OTHER_CHAT_ID]: [] },
			activeChatId: null,
		});
		chats.getMessages.mockResolvedValue(pagina([perdida]));
		chats.getUnreadCount.mockResolvedValue(1);

		await reconectar();

		await vi.waitFor(() => {
			expect(useChatStore.getState().messagesByChat[OTHER_CHAT_ID]).toEqual([
				perdida,
			]);
		});
		expect(socket.markRead).not.toHaveBeenCalled();
		expect(useChatStore.getState().unreadByChat[OTHER_CHAT_ID]).toBe(1);
	});

	it("não busca mensagens de conversas que ainda não foram abertas", async () => {
		await reconectar();

		await vi.waitFor(() => {
			expect(socket.joinChat).toHaveBeenCalledTimes(2);
		});
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(chats.getMessages).not.toHaveBeenCalled();
	});

	it("uma falha na sincronização mantém a conversa e a conexão", async () => {
		const antiga = criarMensagem("m1", "2026-11-25T10:00:00.000Z");
		useChatStore.setState({
			messagesByChat: { [CHAT_ID]: [antiga] },
			activeChatId: CHAT_ID,
		});
		chats.getMessages.mockRejectedValue(new Error("Falha de rede"));

		await reconectar();

		await vi.waitFor(() => {
			expect(console.error).toHaveBeenCalledWith(
				"Erro ao sincronizar as mensagens da conversa:",
				expect.any(Error),
			);
		});
		const estado = useChatStore.getState();
		expect(estado.messagesByChat[CHAT_ID]).toEqual([antiga]);
		expect(estado.connectionStatus).toBe("conectado");
		expect(estado.error).toBeNull();
	});
});
