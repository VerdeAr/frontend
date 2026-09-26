import { CheckCircle2, Store, Truck } from "lucide-react";
import { formatBRL } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DeliveryType } from "@/types";

export interface DeliverySelectorProps {
	deliveryType: DeliveryType | null;
	onSelect: (type: DeliveryType) => Promise<void>;
	shipping: number;
	isUpdating?: boolean;
}

export function DeliverySelector({
	deliveryType,
	onSelect,
	shipping,
	isUpdating = false,
}: DeliverySelectorProps) {
	return (
		<div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-4">
			<div>
				<h2 className="text-base sm:text-lg font-bold text-foreground">
					Forma de Entrega
				</h2>
				<p className="text-xs text-muted-foreground mt-0.5">
					Escolha como prefere receber seus produtos
				</p>
			</div>

			<fieldset
				className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-0 p-0 m-0"
				disabled={isUpdating}
			>
				<legend className="sr-only">Modalidade de entrega</legend>

				{/* Opção: Entrega em Domicílio */}
				<label
					className={cn(
						"flex flex-col justify-between p-4 rounded-2xl border text-left transition-all min-h-22 cursor-pointer select-none",
						deliveryType === "ENTREGA"
							? "border-primary bg-primary/5 ring-2 ring-primary/20"
							: "border-border/70 hover:border-border hover:bg-muted/40",
						isUpdating && "opacity-60 cursor-not-allowed",
					)}
				>
					<input
						type="radio"
						name="deliveryType"
						value="ENTREGA"
						checked={deliveryType === "ENTREGA"}
						onChange={() => onSelect("ENTREGA")}
						disabled={isUpdating}
						className="sr-only"
					/>
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2">
							<div
								className={cn(
									"flex size-8 items-center justify-center rounded-xl",
									deliveryType === "ENTREGA"
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground",
								)}
							>
								<Truck className="size-4" />
							</div>
							<span className="font-semibold text-sm text-foreground">
								Entrega
							</span>
						</div>

						{deliveryType === "ENTREGA" && (
							<CheckCircle2 className="size-4 text-primary shrink-0" />
						)}
					</div>

					<div className="mt-3 flex items-baseline justify-between gap-2">
						<span className="text-xs text-muted-foreground">Em domicílio</span>
						<span className="text-xs font-semibold text-foreground">
							{shipping > 0 ? formatBRL(shipping) : "A calcular"}
						</span>
					</div>
				</label>

				{/* Opção: Retirada no Local */}
				<label
					className={cn(
						"flex flex-col justify-between p-4 rounded-2xl border text-left transition-all min-h-22 cursor-pointer select-none",
						deliveryType === "RETIRADA"
							? "border-primary bg-primary/5 ring-2 ring-primary/20"
							: "border-border/70 hover:border-border hover:bg-muted/40",
						isUpdating && "opacity-60 cursor-not-allowed",
					)}
				>
					<input
						type="radio"
						name="deliveryType"
						value="RETIRADA"
						checked={deliveryType === "RETIRADA"}
						onChange={() => onSelect("RETIRADA")}
						disabled={isUpdating}
						className="sr-only"
					/>
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2">
							<div
								className={cn(
									"flex size-8 items-center justify-center rounded-xl",
									deliveryType === "RETIRADA"
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground",
								)}
							>
								<Store className="size-4" />
							</div>
							<span className="font-semibold text-sm text-foreground">
								Retirada
							</span>
						</div>

						{deliveryType === "RETIRADA" && (
							<CheckCircle2 className="size-4 text-primary shrink-0" />
						)}
					</div>

					<div className="mt-3 flex items-baseline justify-between gap-2">
						<span className="text-xs text-muted-foreground">Com produtor</span>
						<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
							Grátis
						</span>
					</div>
				</label>
			</fieldset>
		</div>
	);
}
