import type { CartItem, DeliveryType } from "./models";

export interface CartResponse {
	id: string;
	user_id: string;
	delivery_type: DeliveryType | null;
	payment_method: string | null;
	items: CartItemWithProduct[];
	subtotal: number;
	shipping: number;
	total: number;
	total_items: number;
	created_at?: string;
	updated_at?: string;
}

export interface CartItemWithProduct extends CartItem {
	total: number;
}

export interface AddCartItemData {
	product_id: string;
	quantity?: number;
}

export interface UpdateCartItemData {
	quantity: number;
}

export interface SetDeliveryTypeData {
	delivery_type: DeliveryType;
}

export interface SetPaymentMethodData {
	payment_method: string;
}
