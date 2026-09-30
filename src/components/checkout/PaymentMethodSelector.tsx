import { Banknote, CheckCircle2, CreditCard, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaymentMethodOption {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
	{
		id: "PIX",
		title: "PIX",
		description: "Transferência instantânea via QR Code / Chave Pix",
		icon: QrCode,
	},
	{
		id: "Dinheiro",
		title: "Dinheiro em Espécie",
		description: "Pagamento presencial na entrega ou retirada no local",
		icon: Banknote,
	},
	{
		id: "Cartão",
		title: "Cartão de Débito / Crédito",
		description: "Pagamento presencial na maquininha do produtor",
		icon: CreditCard,
	},
];

export interface PaymentMethodSelectorProps {
	selectedMethod: string;
	onSelectMethod: (method: string) => void;
	disabled?: boolean;
}

export function PaymentMethodSelector({
	selectedMethod,
	onSelectMethod,
	disabled = false,
}: PaymentMethodSelectorProps) {
	return (
		<div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-4">
			<div>
				<h2 className="text-base sm:text-lg font-bold text-foreground">
					Forma de Pagamento
				</h2>
				<p className="text-xs text-muted-foreground mt-0.5">
					Selecione a forma de pagamento combinada com o produtor
				</p>
			</div>

			<fieldset
				className="flex flex-col gap-2.5 border-0 p-0 m-0"
				disabled={disabled}
			>
				<legend className="sr-only">Selecione a forma de pagamento</legend>

				{PAYMENT_METHODS.map((method) => {
					const Icon = method.icon;
					const isSelected = selectedMethod === method.id;

					return (
						<label
							key={method.id}
							className={cn(
								"flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all min-h-16 cursor-pointer select-none",
								isSelected
									? "border-primary bg-primary/5 ring-2 ring-primary/20"
									: "border-border/70 hover:border-border hover:bg-muted/40",
								disabled && "opacity-60 cursor-not-allowed",
							)}
						>
							<input
								type="radio"
								name="paymentMethod"
								value={method.id}
								checked={isSelected}
								onChange={() => onSelectMethod(method.id)}
								disabled={disabled}
								className="sr-only"
							/>

							<div className="flex items-center gap-3 min-w-0">
								<div
									className={cn(
										"flex size-10 items-center justify-center rounded-xl shrink-0 transition-colors",
										isSelected
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground",
									)}
								>
									<Icon className="size-5" />
								</div>

								<div className="flex flex-col min-w-0">
									<span className="font-semibold text-sm text-foreground truncate">
										{method.title}
									</span>
									<span className="text-xs text-muted-foreground truncate">
										{method.description}
									</span>
								</div>
							</div>

							{isSelected && (
								<CheckCircle2 className="size-5 text-primary shrink-0 ml-2" />
							)}
						</label>
					);
				})}
			</fieldset>
		</div>
	);
}
