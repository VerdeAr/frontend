import type { Chat } from "@/types";

export interface ChatContact {
	name: string;
	subtitle: string;
}

// O contato é sempre o outro participante: o vendedor para o cliente e vice-versa (RN-47)
export function getChatContact(
	chat: Chat,
	currentUserId: string | null | undefined,
): ChatContact {
	const isCustomer = chat.customer_id === currentUserId;

	if (isCustomer) {
		return {
			name:
				chat.seller?.farm_name || chat.seller?.user?.name || "Produtor Rural",
			subtitle: chat.seller?.farm_name ? (chat.seller?.user?.name ?? "") : "",
		};
	}

	return {
		name: chat.customer?.name || "Cliente",
		subtitle: "Cliente",
	};
}
