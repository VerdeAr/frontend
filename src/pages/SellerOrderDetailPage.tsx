import {
	AlertCircle,
	ArrowLeft,
	CheckCircle2,
	Loader2,
	RotateCw,
} from "lucide-react";
import { useState } from "react";
import {
	Link,
	useLoaderData,
	useNavigation,
	useRevalidator,
} from "react-router";
import {
	OrderAdjustmentDialog,
	OrderCustomerCard,
	OrderDetailHeader,
	OrderQuickActions,
	OrderStatusTimeline,
	SellerOrderItemsList,
} from "@/components/orders";
import { Button, buttonVariants } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import { getSaleStatusLabel } from "@/lib/sale-status";
import { cn } from "@/lib/utils";
import type { SellerOrderDetailLoaderData } from "@/router/loaders";
import { saleService } from "@/services/sale.service";
import type { SellerTargetStatus } from "@/types";

type ActionFeedback = { type: "success" | "error"; message: string } | null;

const ORDERS_LIST_PATH = "/minha-conta?aba=pedidos";

/** Página de detalhe do pedido para o vendedor (RF-54). */
export default function SellerOrderDetailPage() {
	const { order, error, errorStatus } =
		useLoaderData<SellerOrderDetailLoaderData>();
	const navigation = useNavigation();
	const revalidator = useRevalidator();

	const [pendingTarget, setPendingTarget] = useState<SellerTargetStatus | null>(
		null,
	);
	const [feedback, setFeedback] = useState<ActionFeedback>(null);
	const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

	const isRevalidating = revalidator.state === "loading";

	/** Muda o status no backend e recarrega o pedido; devolve true em caso de sucesso. */
	const handleChangeStatus = async (
		target: SellerTargetStatus,
	): Promise<boolean> => {
		if (!order || pendingTarget) return false;

		setPendingTarget(target);
		setFeedback(null);
		try {
			await saleService.updateOrderStatus(order.id, target);
			await revalidator.revalidate();
			setFeedback({
				type: "success",
				message: `Pedido atualizado para "${getSaleStatusLabel(target)}".`,
			});
			return true;
		} catch (err) {
			console.error("Erro ao atualizar status do pedido:", err);
			setFeedback({
				type: "error",
				message: getApiErrorMessage(
					err,
					"Não foi possível atualizar o pedido. Tente novamente.",
				),
			});
			// O pedido pode ter mudado em outra tela; recarrega para mostrar o estado real
			revalidator.revalidate();
			return false;
		} finally {
			setPendingTarget(null);
		}
	};

	const handleAdjustmentSubmitted = () => {
		setFeedback({
			type: "success",
			message:
				"Proposta enviada. O pedido fica aguardando a resposta do cliente.",
		});
		revalidator.revalidate();
	};

	if (navigation.state === "loading" && !order) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!order) {
		// 403 e 404 não mudam com uma nova tentativa; só falhas de rede ou servidor
		const canRetry = errorStatus !== 403 && errorStatus !== 404;

		return (
			<div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
				<AlertCircle className="size-10 text-destructive" aria-hidden="true" />
				<h1 className="text-xl font-bold text-foreground">
					{errorStatus === 403 ? "Acesso não permitido" : "Pedido indisponível"}
				</h1>
				<p className="text-sm text-muted-foreground">
					{error || "Não foi possível carregar o pedido."}
				</p>
				<div className="mt-3 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
					{canRetry && (
						<Button
							type="button"
							variant="outline"
							className="h-11 px-6"
							disabled={isRevalidating}
							onClick={() => revalidator.revalidate()}
						>
							{isRevalidating ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<RotateCw className="size-4" />
							)}
							Tentar novamente
						</Button>
					)}
					<Link
						to={ORDERS_LIST_PATH}
						className={cn(buttonVariants({ variant: "default" }), "h-11 px-6")}
					>
						Voltar aos pedidos
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
			<Link
				to={ORDERS_LIST_PATH}
				className="inline-flex h-11 items-center gap-2 self-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Voltar aos pedidos
			</Link>

			<OrderDetailHeader order={order} />

			{feedback && (
				<p
					role={feedback.type === "error" ? "alert" : "status"}
					className={cn(
						"flex items-start gap-2 rounded-xl border p-3 text-sm",
						feedback.type === "error"
							? "border-destructive/30 bg-destructive/10 text-destructive"
							: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
					)}
				>
					{feedback.type === "error" ? (
						<AlertCircle
							className="mt-0.5 size-4 shrink-0"
							aria-hidden="true"
						/>
					) : (
						<CheckCircle2
							className="mt-0.5 size-4 shrink-0"
							aria-hidden="true"
						/>
					)}
					<span>{feedback.message}</span>
				</p>
			)}

			<OrderQuickActions
				status={order.status}
				deliveryType={order.delivery_type}
				hasPendingAdjustment={order.pending_adjustment !== null}
				pendingTarget={pendingTarget}
				onChangeStatus={handleChangeStatus}
				onProposeAdjustment={() => {
					setFeedback(null);
					setIsAdjustmentOpen(true);
				}}
			/>

			<OrderAdjustmentDialog
				open={isAdjustmentOpen}
				onOpenChange={setIsAdjustmentOpen}
				orderId={order.id}
				items={order.items}
				orderTotal={order.order_total}
				onSubmitted={handleAdjustmentSubmitted}
			/>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<OrderStatusTimeline
					status={order.status}
					deliveryType={order.delivery_type}
					history={order.status_history}
				/>
				<OrderCustomerCard
					customer={order.customer}
					deliveryType={order.delivery_type}
				/>
			</div>

			<SellerOrderItemsList
				items={order.items}
				sellerSubtotal={order.seller_subtotal}
				orderTotal={order.order_total}
			/>
		</div>
	);
}
