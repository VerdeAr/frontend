import { Loader2 } from "lucide-react";
import type * as React from "react";
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
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: React.ReactNode;
	confirmLabel: string;
	cancelLabel?: string;
	/** Use "destructive" para ações sem volta, como cancelar um pedido. */
	variant?: "default" | "destructive";
	isLoading?: boolean;
	onConfirm: () => void;
}

/**
 * Diálogo de confirmação acessível (foco preso no diálogo e Esc fecha, pelo Base UI).
 * Enquanto `isLoading` estiver ativo, os botões ficam bloqueados para evitar duplo envio.
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	cancelLabel = "Voltar",
	variant = "default",
	isLoading = false,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				// Não fecha no meio do envio
				if (!isLoading) onOpenChange(nextOpen);
			}}
		>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						className="h-11"
						disabled={isLoading}
						onClick={() => onOpenChange(false)}
					>
						{cancelLabel}
					</Button>
					<Button
						type="button"
						variant={variant}
						className="h-11"
						disabled={isLoading}
						onClick={onConfirm}
					>
						{isLoading && <Loader2 className="size-4 animate-spin" />}
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
