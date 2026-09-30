import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmDialogProps {
	/** Controla a abertura/fechamento do diálogo. */
	open: boolean;
	/** Título exibido no cabeçalho do diálogo. */
	title: string;
	/** Mensagem descritiva da ação a ser confirmada. */
	message: string;
	/** Rótulo do botão de confirmação. Padrão: "Confirmar". */
	confirmLabel?: string;
	/** Rótulo do botão de cancelamento. Padrão: "Cancelar". */
	cancelLabel?: string;
	/** Variante visual do botão de confirmação. Padrão: "destructive". */
	confirmVariant?: "default" | "destructive" | "outline" | "ghost";
	/** Indica se a ação de confirmação está em progresso (desabilita botões). */
	isLoading?: boolean;
	/** Callback acionado ao confirmar a ação. */
	onConfirm: () => void;
	/** Callback acionado ao cancelar ou fechar o diálogo. */
	onCancel: () => void;
}

/**
 * Diálogo de confirmação genérico — substitui o uso de `window.confirm()`.
 * Suporta título, mensagem customizável e variante de destaque do botão.
 */
export function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel = "Confirmar",
	cancelLabel = "Cancelar",
	confirmVariant = "destructive",
	isLoading = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
			<DialogContent showCloseButton={false} className="max-w-sm">
				<DialogHeader>
					<div className="flex items-center gap-3 mb-1">
						<div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
							<AlertTriangle className="size-5" />
						</div>
						<DialogTitle>{title}</DialogTitle>
					</div>
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
						className="rounded-xl"
					>
						{cancelLabel}
					</Button>
					<Button
						type="button"
						variant={confirmVariant}
						onClick={onConfirm}
						disabled={isLoading}
						className="rounded-xl"
					>
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
