import { AlertCircle, ArrowLeft, Loader2, RotateCw } from "lucide-react";
import {
	Link,
	useLoaderData,
	useNavigation,
	useRevalidator,
} from "react-router";
import { OrderDetailHeader } from "@/components/orders";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SellerOrderDetailLoaderData } from "@/router/loaders";

const ORDERS_LIST_PATH = "/minha-conta?aba=pedidos";

/** Página de detalhe do pedido para o vendedor (RF-54). */
export default function SellerOrderDetailPage() {
	const { order, error, errorStatus } =
		useLoaderData<SellerOrderDetailLoaderData>();
	const navigation = useNavigation();
	const revalidator = useRevalidator();

	const isRevalidating = revalidator.state === "loading";

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
		</div>
	);
}
