import type { Message } from "./models";

// ==================== REST (/chats) ====================

export interface StartChatPayload {
	seller_id?: string;
	product_id?: string;
	sale_id?: string;
}

export type MessageOrder = "ASC" | "DESC";

export interface ListMessagesParams {
	page?: number;
	limit?: number;
	order?: MessageOrder;
}

export interface ChatMessagesPage {
	messages: Message[];
	total: number;
	page: number;
	limit: number;
}

export interface UnreadCountResponse {
	count: number;
}

export interface MarkAsReadResponse {
	success: boolean;
	count: number;
}

// ==================== Socket.io ====================

export type ChatConnectionStatus =
	| "conectado"
	| "reconectando"
	| "desconectado";

// Payload emitido pelo servidor em `new_message` (sem a relação `sender` completa)
export interface ChatMessagePayload {
	id: string;
	chat_id: string;
	sender_id: string;
	sender_name?: string;
	content: string;
	is_read: boolean;
	created_at: string;
}

export interface UserTypingPayload {
	chat_id: string;
	userId: string;
	is_typing: boolean;
}

export interface MessagesReadPayload {
	chat_id: string;
	readBy: string;
	count: number;
}

export interface ChatIdPayload {
	chat_id: string;
}

export interface SendMessagePayload {
	chat_id: string;
	content: string;
}

export interface TypingIndicatorPayload {
	chat_id: string;
	is_typing: boolean;
}

export interface JoinChatAck {
	success: boolean;
	error?: string;
	room?: string;
}

export interface SendMessageAck {
	success: boolean;
	error?: string;
	message?: ChatMessagePayload;
}

export interface MessageReadAck {
	success: boolean;
	error?: string;
	count?: number;
}

export interface ServerToClientEvents {
	new_message: (payload: ChatMessagePayload) => void;
	user_typing: (payload: UserTypingPayload) => void;
	messages_read: (payload: MessagesReadPayload) => void;
}

export interface ClientToServerEvents {
	join_chat: (payload: ChatIdPayload, ack: (res: JoinChatAck) => void) => void;
	leave_chat: (payload: ChatIdPayload) => void;
	send_message: (
		payload: SendMessagePayload,
		ack: (res: SendMessageAck) => void,
	) => void;
	typing_indicator: (payload: TypingIndicatorPayload) => void;
	message_read: (
		payload: ChatIdPayload,
		ack: (res: MessageReadAck) => void,
	) => void;
}
