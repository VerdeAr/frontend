import {
	Apple,
	Carrot,
	Cherry,
	Cookie,
	Egg,
	Leaf,
	Salad,
	Sparkles,
	Wheat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategorySelectorProps {
	categories: Category[];
	selectedCategoryId: string | null;
	onSelectCategory: (categoryId: string | null) => void;
	className?: string;
}

// Mapeamento visual temático de ícones para cada categoria comum do agro
function getCategoryIcon(name: string) {
	const lower = name.toLowerCase();
	if (
		lower.includes("horta") ||
		lower.includes("folha") ||
		lower.includes("verdura")
	) {
		return Salad;
	}
	if (lower.includes("fruta")) {
		return Apple;
	}
	if (
		lower.includes("legume") ||
		lower.includes("tubérculo") ||
		lower.includes("raiz")
	) {
		return Carrot;
	}
	if (
		lower.includes("grão") ||
		lower.includes("cereal") ||
		lower.includes("farinha")
	) {
		return Wheat;
	}
	if (
		lower.includes("ovo") ||
		lower.includes("leite") ||
		lower.includes("queijo") ||
		lower.includes("laticínio")
	) {
		return Egg;
	}
	if (
		lower.includes("mel") ||
		lower.includes("doce") ||
		lower.includes("geleia")
	) {
		return Cookie;
	}
	if (
		lower.includes("tempero") ||
		lower.includes("erva") ||
		lower.includes("chá")
	) {
		return Leaf;
	}
	return Cherry;
}

export function CategorySelector({
	categories,
	selectedCategoryId,
	onSelectCategory,
	className,
}: CategorySelectorProps) {
	return (
		<div className={cn("w-full py-2", className)}>
			<div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 pt-0.5">
				{/* Botão "Todos" */}
				<button
					type="button"
					onClick={() => onSelectCategory(null)}
					className={cn(
						"h-11 px-4 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-medium transition-all select-none whitespace-nowrap shrink-0 border",
						selectedCategoryId === null
							? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
							: "bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border/50",
					)}
				>
					<Sparkles className="size-4 shrink-0" />
					<span>Todos os Produtos</span>
				</button>

				{/* Pílulas de Categoria */}
				{categories.map((category) => {
					const Icon = getCategoryIcon(category.name);
					const isSelected = selectedCategoryId === category.id;

					return (
						<button
							key={category.id}
							type="button"
							onClick={() => onSelectCategory(isSelected ? null : category.id)}
							className={cn(
								"h-11 px-4 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-medium transition-all select-none whitespace-nowrap shrink-0 border",
								isSelected
									? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold dark:bg-emerald-500"
									: "bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground border-border/50",
							)}
						>
							<Icon className="size-4 shrink-0" />
							<span>{category.name}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
