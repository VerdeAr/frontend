import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationControlsProps {
	/** Página atual (base 1). */
	currentPage: number;
	/** Total de páginas disponíveis. */
	totalPages: number;
	/** Total de itens (para exibição informativa). */
	totalItems?: number;
	/** Rótulo singular do item (ex: "produto"). */
	itemLabel?: string;
	/** Callback acionado ao solicitar uma mudança de página. */
	onPageChange: (page: number) => void;
}

/**
 * Controles de paginação genéricos — Anterior / Próxima + informação de página.
 * Desacoplado de qualquer entidade de negócio.
 */
export function PaginationControls({
	currentPage,
	totalPages,
	totalItems,
	itemLabel = "item",
	onPageChange,
}: PaginationControlsProps) {
	const isFirstPage = currentPage <= 1;
	const isLastPage = currentPage >= totalPages;

	return (
		<nav
			aria-label="Controles de paginação"
			className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6"
		>
			{/* Informação de página */}
			<p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
				Página{" "}
				<span className="font-semibold text-foreground">{currentPage}</span> de{" "}
				<span className="font-semibold text-foreground">{totalPages}</span>
				{totalItems !== undefined && (
					<span className="hidden sm:inline">
						{" "}
						({totalItems} {totalItems === 1 ? itemLabel : `${itemLabel}s`} no
						total)
					</span>
				)}
			</p>

			{/* Botões de navegação */}
			<div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
				<Button
					type="button"
					variant="outline"
					disabled={isFirstPage}
					onClick={() => onPageChange(currentPage - 1)}
					className="h-11 rounded-2xl px-4 text-xs sm:text-sm font-medium gap-1.5 flex-1 sm:flex-initial"
				>
					<ChevronLeft className="size-4" />
					<span>Anterior</span>
				</Button>

				<Button
					type="button"
					variant="outline"
					disabled={isLastPage}
					onClick={() => onPageChange(currentPage + 1)}
					className="h-11 rounded-2xl px-4 text-xs sm:text-sm font-medium gap-1.5 flex-1 sm:flex-initial"
				>
					<span>Próxima</span>
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</nav>
	);
}
