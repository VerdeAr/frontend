import { AlertTriangle, Pencil, Sprout, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatBRL, formatStock } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export interface SellerProductTableProps {
	products: Product[];
	onEdit: (product: Product) => void;
	onDelete: (productId: string) => void;
	onToggleActive: (productId: string) => void;
	togglingId?: string | null;
	deletingId?: string | null;
	className?: string;
}

export function SellerProductTable({
	products,
	onEdit,
	onDelete,
	onToggleActive,
	togglingId,
	deletingId,
	className,
}: SellerProductTableProps) {
	return (
		<div
			className={cn(
				"w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs",
				className,
			)}
		>
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
						<tr>
							<th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">
								Produto
							</th>
							<th scope="col" className="px-3 py-3.5">
								Categoria
							</th>
							<th scope="col" className="px-3 py-3.5">
								Preço
							</th>
							<th scope="col" className="px-3 py-3.5">
								Estoque
							</th>
							<th scope="col" className="px-3 py-3.5 text-center">
								Disponibilidade
							</th>
							<th scope="col" className="py-3.5 pl-3 pr-4 sm:pr-6 text-right">
								Ações
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/40">
						{products.map((product) => (
							<TableRowItem
								key={product.id}
								product={product}
								onEdit={onEdit}
								onDelete={onDelete}
								onToggleActive={onToggleActive}
								isToggling={togglingId === product.id}
								isDeleting={deletingId === product.id}
							/>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

interface TableRowItemProps {
	product: Product;
	onEdit: (product: Product) => void;
	onDelete: (productId: string) => void;
	onToggleActive: (productId: string) => void;
	isToggling: boolean;
	isDeleting: boolean;
}

function TableRowItem({
	product,
	onEdit,
	onDelete,
	onToggleActive,
	isToggling,
	isDeleting,
}: TableRowItemProps) {
	const [imageError, setImageError] = useState(false);

	const isOutOfStock = product.stock <= 0;
	const isLowStock = !isOutOfStock && product.stock <= 5;
	const unitLabel =
		product.measurement_unit?.symbol || product.measurement_unit?.name || "un";

	const handleDelete = () => {
		if (
			window.confirm(
				`Tem certeza que deseja remover o produto "${product.name}"?`,
			)
		) {
			onDelete(product.id);
		}
	};

	return (
		<tr
			className={cn(
				"transition-colors hover:bg-muted/30",
				!product.is_active && "opacity-75 bg-muted/10",
			)}
		>
			{/* Thumbnail e Nome */}
			<td className="py-4 pl-4 pr-3 sm:pl-6">
				<div className="flex items-center gap-3">
					<div className="size-12 shrink-0 overflow-hidden rounded-xl bg-muted/30 border border-border/40">
						{product.image_url && !imageError ? (
							<img
								src={product.image_url}
								alt={product.name}
								loading="lazy"
								onError={() => setImageError(true)}
								className="size-full object-cover"
							/>
						) : (
							<div className="flex size-full items-center justify-center bg-emerald-500/10 text-emerald-600">
								<Sprout className="size-5" />
							</div>
						)}
					</div>
					<div className="min-w-0">
						<span className="font-semibold text-foreground truncate block max-w-xs">
							{product.name}
						</span>
						{product.description && (
							<span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
								{product.description}
							</span>
						)}
					</div>
				</div>
			</td>

			{/* Categoria */}
			<td className="px-3 py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
				{product.category?.name ? (
					<span className="inline-flex rounded-full bg-muted/60 px-2.5 py-0.5 border border-border/50 text-foreground">
						{product.category.name}
					</span>
				) : (
					"—"
				)}
			</td>

			{/* Preço Unitário */}
			<td className="px-3 py-4 whitespace-nowrap font-medium">
				<span className="font-bold text-emerald-600 dark:text-emerald-400">
					{formatBRL(product.price)}
				</span>
				<span className="text-xs text-muted-foreground ml-1">
					/ {unitLabel}
				</span>
			</td>

			{/* Estoque */}
			<td className="px-3 py-4 whitespace-nowrap">
				{isOutOfStock ? (
					<Badge variant="destructive" className="text-xs">
						Esgotado
					</Badge>
				) : isLowStock ? (
					<Badge
						variant="outline"
						className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs gap-1"
					>
						<AlertTriangle className="size-3" />
						<span>{formatStock(product.stock, unitLabel)}</span>
					</Badge>
				) : (
					<span className="text-xs text-foreground font-medium">
						{formatStock(product.stock, unitLabel)}
					</span>
				)}
			</td>

			{/* Status com Switch */}
			<td className="px-3 py-4 whitespace-nowrap text-center">
				<div className="flex items-center justify-center gap-2">
					<Switch
						checked={product.is_active}
						onCheckedChange={() => onToggleActive(product.id)}
						disabled={isToggling}
						aria-label={`Alternar status do produto ${product.name}`}
					/>
					<span className="text-xs font-medium text-muted-foreground hidden lg:inline">
						{product.is_active ? "Ativo" : "Pausado"}
					</span>
				</div>
			</td>

			{/* Ações */}
			<td className="py-4 pl-3 pr-4 sm:pr-6 whitespace-nowrap text-right">
				<div className="flex items-center justify-end gap-1.5">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onEdit(product)}
						className="h-9 px-3 rounded-xl gap-1 text-xs font-medium"
						aria-label={`Editar ${product.name}`}
					>
						<Pencil className="size-3.5" />
						<span>Editar</span>
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={isDeleting}
						onClick={handleDelete}
						className="h-9 w-9 p-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
						aria-label={`Excluir ${product.name}`}
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			</td>
		</tr>
	);
}
