import { Banknote, Check, Copy, CreditCard, QrCode } from "lucide-react";
import { useState } from "react";
import { formatBRL } from "@/lib/formatters";

export interface OrderPaymentInstructionsProps {
	paymentMethod: string | null;
	totalAmount: number;
}

export function OrderPaymentInstructions({
	paymentMethod,
	totalAmount,
}: OrderPaymentInstructionsProps) {
	const [copied, setCopied] = useState(false);
	const pixKey = "pix@verdear.com.br";

	const handleCopyPix = async () => {
		try {
			await navigator.clipboard.writeText(pixKey);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Falha ao copiar chave pix:", err);
		}
	};

	const isPix = paymentMethod?.toUpperCase().includes("PIX");
	const isDinheiro = paymentMethod?.toLowerCase().includes("dinheiro");

	return (
		<div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-4">
			<div className="flex items-center gap-2.5">
				<div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
					{isPix ? (
						<QrCode className="size-4.5" />
					) : isDinheiro ? (
						<Banknote className="size-4.5" />
					) : (
						<CreditCard className="size-4.5" />
					)}
				</div>
				<div>
					<h3 className="font-bold text-base text-foreground">
						Instruções de Pagamento ({paymentMethod || "Não informado"})
					</h3>
					<p className="text-xs text-muted-foreground">
						Valor total:{" "}
						<strong className="text-foreground">
							{formatBRL(totalAmount)}
						</strong>
					</p>
				</div>
			</div>

			{isPix ? (
				<div className="flex flex-col gap-3 rounded-2xl bg-muted/40 p-4 border border-border/50">
					<p className="text-xs text-muted-foreground">
						Para agilizar a separação dos seus produtos frescos, realize a
						transferência PIX utilizando a chave abaixo:
					</p>

					<div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-background border border-input">
						<code className="text-xs font-mono text-foreground font-semibold truncate">
							{pixKey}
						</code>

						<button
							type="button"
							onClick={handleCopyPix}
							className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
						>
							{copied ? (
								<>
									<Check className="size-3.5" />
									<span>Copiado!</span>
								</>
							) : (
								<>
									<Copy className="size-3.5" />
									<span>Copiar Chave</span>
								</>
							)}
						</button>
					</div>

					<span className="text-[11px] text-muted-foreground">
						* Apresente o comprovante ao produtor rural no momento da entrega ou
						retirada.
					</span>
				</div>
			) : isDinheiro ? (
				<div className="rounded-2xl bg-muted/40 p-4 border border-border/50 text-xs text-muted-foreground space-y-1">
					<p className="font-semibold text-foreground">Pagamento em Espécie</p>
					<p>
						Prepare o valor exato de <strong>{formatBRL(totalAmount)}</strong>{" "}
						ou informe o troco ao produtor no momento do contato.
					</p>
				</div>
			) : (
				<div className="rounded-2xl bg-muted/40 p-4 border border-border/50 text-xs text-muted-foreground space-y-1">
					<p className="font-semibold text-foreground">Cartão Presencial</p>
					<p>
						O produtor rural ou entregador levará a máquina de cartão para
						processamento presencial (débito ou crédito).
					</p>
				</div>
			)}
		</div>
	);
}
