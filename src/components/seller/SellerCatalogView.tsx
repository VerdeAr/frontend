import {
	AlertCircle,
	AlertTriangle,
	CheckCircle,
	Package,
	PackagePlus,
	PackageSearch,
	Plus,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { sellerProductsService } from "@/services/seller-products.service";
import type { Product } from "@/types";
import { SellerProductCard } from "./SellerProductCard";
import { SellerProductTable } from "./SellerProductTable";

export type StatusFilter = "todos" | "ativos" | "inativos" | "esgotados";

export interface SellerCatalogViewProps {
	onOpenCreateDialog?: () => void;
	onOpenEditDialog?: (product: Product) => void;
	className?: string;
}

export function SellerCatalogView({
	onOpenCreateDialog,
	onOpenEditDialog,
	className,
}: SellerCatalogViewProps) {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [successNotice, setSuccessNotice] = useState<string | null>(null);

	const loadProducts = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await sellerProductsService.getSellerProducts();
			setProducts(data);
		} catch (err) {
			console.error("Erro ao carregar produtos do vendedor:", err);
			setError(
				"Não foi possível carregar os produtos do seu catálogo. Tente novamente.",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadProducts();
	}, [loadProducts]);

	// Métricas calculadas
	const metrics = useMemo(() => {
		const total = products.length;
		const active = products.filter((p) => p.is_active).length;
		const lowOrOutOfStock = products.filter((p) => p.stock <= 5).length;
		return { total, active, lowOrOutOfStock };
	}, [products]);

	// Filtros de busca e status
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			// Filtro textual
			const matchesQuery =
				!searchQuery.trim() ||
				product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				Boolean(
					product.category?.name
						?.toLowerCase()
						.includes(searchQuery.toLowerCase()),
				);

			if (!matchesQuery) return false;

			// Filtro de status
			if (statusFilter === "ativos") return product.is_active;
			if (statusFilter === "inativos") return !product.is_active;
			if (statusFilter === "esgotados") return product.stock <= 0;

			return true;
		});
	}, [products, searchQuery, statusFilter]);

	// Ação de alternar ativo/inativo
	const handleToggleActive = async (productId: string) => {
		try {
			setTogglingId(productId);
			const response = await sellerProductsService.toggleActive(productId);
			setProducts((prev) =>
				prev.map((p) =>
					p.id === productId ? { ...p, is_active: response.is_active } : p,
				),
			);
			setSuccessNotice(
				response.is_active
					? "Produto ativado para venda na loja!"
					: "Produto pausado da loja.",
			);
			setTimeout(() => setSuccessNotice(null), 3000);
		} catch (err) {
			console.error("Erro ao alterar status do produto:", err);
			alert("Não foi possível alterar o status do produto. Tente novamente.");
		} finally {
			setTogglingId(null);
		}
	};

	// Ação de exclusão
	const handleDelete = async (productId: string) => {
		try {
			setDeletingId(productId);
			await sellerProductsService.deleteProduct(productId);
			setProducts((prev) => prev.filter((p) => p.id !== productId));
			setSuccessNotice("Produto excluído com sucesso.");
			setTimeout(() => setSuccessNotice(null), 3000);
		} catch (err) {
			console.error("Erro ao excluir produto:", err);
			alert("Não foi possível excluir o produto. Tente novamente.");
		} finally {
			setDeletingId(null);
		}
	};

	const handleEdit = (product: Product) => {
		if (onOpenEditDialog) {
			onOpenEditDialog(product);
		} else {
			alert(`Editar produto: ${product.name}`);
		}
	};

	const handleCreate = () => {
		if (onOpenCreateDialog) {
			onOpenCreateDialog();
		} else {
			alert("Cadastrar novo produto");
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			{/* Cabeçalho da Seção com Botão de Cadastro */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h3 className="text-xl sm:text-2xl font-bold text-foreground">
						Meus Produtos & Estoque
					</h3>
					<p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
						Gerencie o catálogo, preços e disponibilidade dos alimentos da sua
						propriedade.
					</p>
				</div>

				<Button
					type="button"
					onClick={handleCreate}
					className="h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs gap-2 shrink-0 self-start sm:self-auto"
				>
					<Plus className="size-4.5" />
					<span>Cadastrar Produto</span>
				</Button>
			</div>

			{/* Cards de Métricas Resumo */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
				<div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs flex items-center gap-3">
					<div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
						<Package className="size-5" />
					</div>
					<div>
						<span className="text-xs text-muted-foreground font-medium block">
							Total de Produtos
						</span>
						<span className="text-xl font-bold text-foreground">
							{metrics.total}
						</span>
					</div>
				</div>

				<div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs flex items-center gap-3">
					<div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
						<CheckCircle className="size-5" />
					</div>
					<div>
						<span className="text-xs text-muted-foreground font-medium block">
							Ativos na Loja
						</span>
						<span className="text-xl font-bold text-foreground">
							{metrics.active}
						</span>
					</div>
				</div>

				<div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs flex items-center gap-3">
					<div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
						<AlertTriangle className="size-5" />
					</div>
					<div>
						<span className="text-xs text-muted-foreground font-medium block">
							Estoque Crítico (≤ 5)
						</span>
						<span className="text-xl font-bold text-foreground">
							{metrics.lowOrOutOfStock}
						</span>
					</div>
				</div>
			</div>

			{/* Barra de Filtros e Busca */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
				{/* Campo de Busca Rápida */}
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Buscar no seu catálogo..."
						className="h-11 w-full rounded-2xl border border-border/70 bg-card pl-10 pr-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
							aria-label="Limpar busca"
						>
							<X className="size-3.5" />
						</button>
					)}
				</div>

				{/* Pílulas de Status */}
				<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
					{(
						[
							{ id: "todos", label: "Todos" },
							{ id: "ativos", label: "Ativos" },
							{ id: "inativos", label: "Pausados" },
							{ id: "esgotados", label: "Esgotados" },
						] as const
					).map((tab) => {
						const isSelected = statusFilter === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setStatusFilter(tab.id)}
								className={cn(
									"h-11 px-3.5 rounded-xl text-xs font-medium transition-all shrink-0 border",
									isSelected
										? "bg-primary text-primary-foreground border-primary font-semibold"
										: "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-border/50",
								)}
							>
								{tab.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Feedback Temporário de Sucesso */}
			{successNotice && (
				<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
					<CheckCircle className="size-4 shrink-0 text-emerald-600" />
					<span>{successNotice}</span>
				</div>
			)}

			{/* Estado de Erro */}
			{error ? (
				<div className="flex w-full flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
					<AlertCircle className="size-8 text-destructive mb-2" />
					<p className="text-sm text-muted-foreground mb-4">{error}</p>
					<Button
						type="button"
						variant="outline"
						onClick={loadProducts}
						className="h-11 rounded-xl px-4 text-xs font-medium gap-2"
					>
						<RefreshCw className="size-4" />
						<span>Tentar Novamente</span>
					</Button>
				</div>
			) : isLoading ? (
				/* Estado de Loading com Skeletons */
				<div className="space-y-3">
					{["sk-1", "sk-2", "sk-3", "sk-4"].map((skId) => (
						<div
							key={skId}
							className="h-24 w-full rounded-2xl border border-border/40 bg-card p-4 flex items-center justify-between"
						>
							<div className="flex items-center gap-3">
								<Skeleton className="size-16 rounded-xl" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-20" />
								</div>
							</div>
							<Skeleton className="h-9 w-24 rounded-xl" />
						</div>
					))}
				</div>
			) : products.length === 0 ? (
				/* Estado Vazio Total */
				<div className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 sm:p-12 text-center">
					<div className="size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
						<PackagePlus className="size-8" />
					</div>
					<h4 className="text-base sm:text-lg font-semibold text-foreground mb-1">
						Nenhum produto cadastrado ainda
					</h4>
					<p className="max-w-md text-xs sm:text-sm text-muted-foreground mb-6">
						Cadastre seus primeiros alimentos agroecológicos para que eles
						apareçam na feira virtual da sua região.
					</p>
					<Button
						type="button"
						onClick={handleCreate}
						className="h-11 rounded-2xl px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2"
					>
						<Plus className="size-4" />
						<span>Cadastrar Primeiro Alimento</span>
					</Button>
				</div>
			) : filteredProducts.length === 0 ? (
				/* Estado Vazio por Filtro */
				<div className="flex w-full flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 p-8 text-center">
					<PackageSearch className="size-8 text-muted-foreground mb-2" />
					<p className="text-sm font-semibold text-foreground">
						Nenhum produto encontrado para estes filtros
					</p>
					<p className="text-xs text-muted-foreground mt-1 mb-4">
						Tente buscar por outro nome ou selecionar outro status.
					</p>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setSearchQuery("");
							setStatusFilter("todos");
						}}
						className="h-11 rounded-xl px-4 text-xs font-medium"
					>
						Limpar Filtros
					</Button>
				</div>
			) : (
				/* Lista de Produtos (Mobile: Cards, Desktop: Tabela) */
				<>
					{/* Versão Mobile (Cards verticais) */}
					<div className="grid grid-cols-1 gap-3 md:hidden">
						{filteredProducts.map((product) => (
							<SellerProductCard
								key={product.id}
								product={product}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onToggleActive={handleToggleActive}
								isToggling={togglingId === product.id}
								isDeleting={deletingId === product.id}
							/>
						))}
					</div>

					{/* Versão Desktop & Tablet (Tabela) */}
					<div className="hidden md:block">
						<SellerProductTable
							products={filteredProducts}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onToggleActive={handleToggleActive}
							togglingId={togglingId}
							deletingId={deletingId}
						/>
					</div>
				</>
			)}
		</div>
	);
}
