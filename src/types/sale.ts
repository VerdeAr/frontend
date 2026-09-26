import type { DeliveryType, SaleStatus, User } from "./models";

export interface CheckoutPayload {
	delivery_type?: DeliveryType;
	payment_method?: string;
}

export interface FormattedSaleItem {
	id: string;
	product_id: string;
	product_name: string;
	product_image: string | null;
	measurement_unit: string | null;
	quantity: number;
	unit_price: number;
	total: number;
	seller?: {
		id: string;
		name: string;
		phone: string | null;
	} | null;
}

export interface SalePayment {
	id: string;
	amount: number;
	payment_method: string | null;
}

export interface SaleResponse {
	id: string;
	customer_id: string;
	customer?: Partial<User>;
	delivery_type: DeliveryType;
	status: SaleStatus;
	total_amount: number;
	created_at: string;
	updated_at: string;
	items: FormattedSaleItem[];
	payments: SalePayment[];
}

export interface SellerOrderResponse {
	id: string;
	status: SaleStatus;
	delivery_type: DeliveryType;
	created_at: string;
	customer: {
		id: string;
		name: string;
		email: string;
		phone: string | null;
		address: string | null;
		neighborhood: string | null;
	};
	items: FormattedSaleItem[];
	seller_subtotal: number;
	order_total: number;
}
