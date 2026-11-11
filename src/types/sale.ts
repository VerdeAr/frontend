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

export type SaleAdjustmentStatus = "PENDENTE" | "ACEITO" | "RECUSADO";

/** Item da proposta de ajuste, com os valores atuais e os propostos. */
export interface SaleAdjustmentItem {
	id: string;
	sale_product_id: string;
	product_id: string | null;
	product_name: string;
	original_quantity: number;
	proposed_quantity: number;
	original_unit_price: number;
	proposed_unit_price: number;
	original_total: number;
	proposed_total: number;
}

/** Proposta de ajuste de itens ou pesagem feita pelo vendedor (RF-56). */
export interface SaleAdjustment {
	id: string;
	reason: string;
	status: SaleAdjustmentStatus;
	/** Status ao qual o pedido volta se o cliente aceitar. */
	previous_status: SaleStatus;
	created_at?: string;
	items: SaleAdjustmentItem[];
	current_order_total: number;
	/** Total do pedido se o ajuste for aceito (o frete não muda). */
	proposed_order_total: number;
}

/** Entrada da linha do tempo de status do pedido. */
export interface StatusHistoryEntry {
	status: SaleStatus;
	changed_at: string;
	/** Nulo nos registros anteriores ao histórico. */
	changed_by?: {
		id: string;
		name: string;
	} | null;
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
	is_reviewed?: boolean;
	review?: {
		id: string;
		rating: number;
		comment: string | null;
		created_at: string;
	} | null;
	/** Proposta aguardando resposta do cliente (presente no histórico de compras). */
	pending_adjustment?: SaleAdjustment | null;
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
	/** true quando há proposta de ajuste aguardando o cliente. */
	has_pending_adjustment?: boolean;
}

/** Detalhe do pedido visto pelo vendedor (GET /vendedor/pedidos/:id). */
export interface SellerOrderDetail {
	id: string;
	status: SaleStatus;
	delivery_type: DeliveryType;
	created_at: string;
	updated_at: string;
	payment_method: string | null;
	customer: SellerOrderResponse["customer"];
	items: FormattedSaleItem[];
	seller_subtotal: number;
	order_total: number;
	status_history: StatusHistoryEntry[];
	pending_adjustment: SaleAdjustment | null;
}

/** Corpo de POST /vendedor/pedidos/:id/propor-ajuste. */
export interface ProposeAdjustmentPayload {
	reason: string;
	items: Array<{
		sale_product_id: string;
		quantity: number;
	}>;
}
