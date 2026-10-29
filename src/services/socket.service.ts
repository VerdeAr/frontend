import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api";
import type {
	ChatMessagePayload,
	ClientToServerEvents,
	ServerToClientEvents,
} from "@/types";

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const ACK_TIMEOUT_MS = 8000;

let socket: ChatSocket | null = null;

function createSocket(): ChatSocket {
	// Usa só a origem: um caminho na URL seria interpretado como namespace do Socket.io
	const origin = new URL(API_BASE_URL).origin;

	return io(origin, {
		// O JWT vai no cookie HTTP-Only do handshake; o token nunca é lido aqui
		withCredentials: true,
		autoConnect: false,
		reconnection: true,
		reconnectionAttempts: Number.POSITIVE_INFINITY,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 10000,
		randomizationFactor: 0.5,
	});
}

function ensureConnected(current: ChatSocket): void {
	if (!current.connected) {
		throw new Error("Sem conexão com o chat. Tente novamente em instantes.");
	}
}

export const socketService = {
	// Instância única, criada sob demanda e reaproveitada entre conexões
	getSocket(): ChatSocket {
		if (!socket) {
			socket = createSocket();
		}
		return socket;
	},

	isConnected(): boolean {
		return socket?.connected ?? false;
	},

	connect(): void {
		const current = this.getSocket();
		if (!current.connected) {
			current.connect();
		}
	},

	// Encerra a conexão (logout); a reconexão automática só vale para quedas de rede
	disconnect(): void {
		socket?.disconnect();
	},

	async joinChat(chatId: string): Promise<void> {
		const current = this.getSocket();
		ensureConnected(current);
		const res = await current
			.timeout(ACK_TIMEOUT_MS)
			.emitWithAck("join_chat", { chat_id: chatId });
		if (!res.success) {
			throw new Error(res.error ?? "Não foi possível entrar na conversa.");
		}
	},

	leaveChat(chatId: string): void {
		socket?.emit("leave_chat", { chat_id: chatId });
	},

	async sendMessage(
		chatId: string,
		content: string,
	): Promise<ChatMessagePayload> {
		const current = this.getSocket();
		ensureConnected(current);
		const res = await current
			.timeout(ACK_TIMEOUT_MS)
			.emitWithAck("send_message", { chat_id: chatId, content });
		if (!res.success || !res.message) {
			throw new Error(res.error ?? "Não foi possível enviar a mensagem.");
		}
		return res.message;
	},

	// Volátil: se estiver sem conexão, o aviso de digitação é descartado
	emitTyping(chatId: string, isTyping: boolean): void {
		socket?.volatile.emit("typing_indicator", {
			chat_id: chatId,
			is_typing: isTyping,
		});
	},

	async markRead(chatId: string): Promise<number> {
		const current = this.getSocket();
		ensureConnected(current);
		const res = await current
			.timeout(ACK_TIMEOUT_MS)
			.emitWithAck("message_read", { chat_id: chatId });
		if (!res.success) {
			throw new Error(
				res.error ?? "Não foi possível marcar as mensagens como lidas.",
			);
		}
		return res.count ?? 0;
	},
};
