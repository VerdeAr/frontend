export type UserRole = "CLIENTE" | "VENDEDOR";

export type DeliveryType = "ENTREGA" | "RETIRADA";

export type SaleStatus = "ABERTA" | "FINALIZADA" | "CANCELADA";

export type ChatStatus = "ATIVO" | "FINALIZADO";

export interface Neighborhood {
	id: string;
	name: string;
	city: string;
	created_at?: string;
	updated_at?: string;
}

export interface Category {
	id: string;
	name: string;
	created_at?: string;
	updated_at?: string;
}

export interface MeasurementUnit {
	id: string;
	name: string;
	symbol?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface PaymentMethod {
	id: string;
	description: string;
	created_at?: string;
	updated_at?: string;
}

export interface Seller {
	id: string;
	user_id: string;
	description?: string | null;
	cnpj?: string | null;
	farm_name?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface Shipping {
	id: string;
	seller_id: string;
	neighborhood_id: string;
	neighborhood?: Neighborhood;
	price: number;
	created_at?: string;
	updated_at?: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	cpf?: string | null;
	phone?: string | null;
	address?: string | null;
	neighborhood_id?: string | null;
	neighborhood?: Neighborhood | null;
	role: UserRole;
	is_active: boolean;
	fixed_shipping_rate?: number | null;
	last_seen?: string | null;
	seller?: Seller | null;
	created_at?: string;
	updated_at?: string;
}

export interface Product {
	id: string;
	seller_id: string;
	seller?: Seller;
	category_id?: string | null;
	category?: Category | null;
	measurement_unit_id?: string | null;
	measurement_unit?: MeasurementUnit | null;
	name: string;
	price: number;
	is_active: boolean;
	image_url?: string | null;
	stock: number;
	description?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface CartItem {
	id: string;
	cart_id: string;
	product_id: string;
	product: Product;
	quantity: number;
	price: number;
	created_at?: string;
	updated_at?: string;
}

export interface Cart {
	id: string;
	user_id: string;
	delivery_type?: DeliveryType | null;
	payment_method?: string | null;
	items: CartItem[];
	created_at?: string;
	updated_at?: string;
}

export interface SaleProduct {
	id: string;
	sale_id: string;
	product_id: string;
	product: Product;
	quantity: number;
	unit_price: number;
	created_at?: string;
	updated_at?: string;
}

export interface Payment {
	id: string;
	sale_id: string;
	payment_method_id?: string | null;
	payment_method?: PaymentMethod | null;
	amount: number;
	created_at?: string;
	updated_at?: string;
}

export interface Review {
	id: string;
	sale_id: string;
	customer_id: string;
	customer?: User;
	rating: number;
	comment?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface Message {
	id: string;
	chat_id: string;
	sender_id: string;
	sender?: User;
	content: string;
	is_read: boolean;
	created_at: string;
	updated_at?: string;
}

export interface Chat {
	id: string;
	customer_id: string;
	customer?: User;
	seller_id: string;
	seller?: Seller;
	status: ChatStatus;
	last_message_at?: string | null;
	messages?: Message[];
	unread_count?: number;
	created_at?: string;
	updated_at?: string;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
	errors?: Array<{ field: string; message: string }>;
}
