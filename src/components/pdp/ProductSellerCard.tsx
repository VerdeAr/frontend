import { Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seller } from "@/types";

export interface ProductSellerCardProps {
	seller?: Seller | null;
	className?: string;
}

export function ProductSellerCard({
	seller,
	className,
}: ProductSellerCardProps) {
	const farmName = seller?.farm_name || "Propriedade Agroecológica";
	const producerName = seller?.user?.name || "Produtor Rural Parceiro";
	const description =
		seller?.description ||
		"Produtor rural familiar comprometido com o cultivo sustentável, respeito à terra e oferta de alimentos saudáveis sem agrotóxicos para a comunidade local.";

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-3.5 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-xs sm:rounded-3xl sm:p-5",
				className,
			)}
		>
			{/* Cabeçalho do Produtor */}
			<div className="flex items-start gap-3.5">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 shadow-xs dark:text-emerald-400">
					<Store className="size-6" />
				</div>

				<div className="flex flex-1 flex-col min-w-0">
					<h2 className="text-base font-bold text-foreground sm:text-lg truncate">
						{farmName}
					</h2>

					<p className="text-xs text-muted-foreground truncate">
						Responsável: {producerName}
					</p>
				</div>
			</div>

			{/* Descrição e História do Produtor */}
			<p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
				{description}
			</p>
		</div>
	);
}
