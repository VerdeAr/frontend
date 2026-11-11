import { api } from "@/lib/api";
import type {
	Chat,
	ChatMessagesPage,
	ListMessagesParams,
	MarkAsReadResponse,
	Message,
	StartChatPayload,
	UnreadCountResponse,
} from "@/types";

export const chatService = {
	// Cria ou reaproveita a conversa ativa com o vendedor (RN-48)
	async startChat(data: StartChatPayload): Promise<Chat> {
		const response = await api.post<Chat>("/chats", data);
		return response.data;
	},

	async listChats(): Promise<Chat[]> {
		const response = await api.get<Chat[]>("/chats");
		return response.data;
	},

	async getChat(chatId: string): Promise<Chat> {
		const response = await api.get<Chat>(`/chats/${chatId}`);
		return response.data;
	},

	async getMessages(
		chatId: string,
		params?: ListMessagesParams,
	): Promise<ChatMessagesPage> {
		const response = await api.get<ChatMessagesPage>(
			`/chats/${chatId}/messages`,
			{ params },
		);
		return response.data;
	},

	// Alternativa REST ao evento `send_message`, usada quando o socket está fora do ar
	async sendMessage(chatId: string, content: string): Promise<Message> {
		const response = await api.post<Message>(`/chats/${chatId}/messages`, {
			content,
		});
		return response.data;
	},

	// Sem `chatId`, retorna o total de não lidas em todas as conversas do usuário
	async getUnreadCount(chatId?: string): Promise<number> {
		const response = await api.get<UnreadCountResponse>(
			"/chats/nao-lidas/count",
			{ params: chatId ? { chat_id: chatId } : undefined },
		);
		return response.data.count;
	},

	async markAsRead(chatId: string): Promise<MarkAsReadResponse> {
		const response = await api.patch<MarkAsReadResponse>(
			`/chats/${chatId}/read`,
		);
		return response.data;
	},
};
