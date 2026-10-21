import {
	HeartHandshake,
	MapPin,
	ShieldCheck,
	Sprout,
	Store,
} from "lucide-react";
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
					<div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
						<Sprout className="size-3.5 shrink-0" />
						<span className="uppercase tracking-wider">Produtor Familiar</span>
					</div>

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

			{/* Selos de Confiança e Localidade */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs text-foreground/80">
				<div className="flex items-center gap-2">
					<ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
					<span>Produtor verificado pela Verdear</span>
				</div>
				<div className="flex items-center gap-2">
					<HeartHandshake className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
					<span>100% da renda ao pequeno produtor</span>
				</div>
				<div className="flex items-center gap-2 sm:col-span-2">
					<MapPin className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
					<span>Produção regional fresca e colhida sob demanda</span>
				</div>
			</div>
		</div>
	);
}
