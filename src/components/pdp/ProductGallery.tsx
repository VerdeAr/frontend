import { AlertCircle, Sprout } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProductGalleryProps {
	imageUrl?: string | null;
	productName: string;
	isOutOfStock?: boolean;
	isLowStock?: boolean;
	stock?: number;
	className?: string;
}

export function ProductGallery({
	imageUrl,
	productName,
	isOutOfStock = false,
	isLowStock = false,
	stock,
	className,
}: ProductGalleryProps) {
	const [imageError, setImageError] = useState(false);

	const hasImage = Boolean(imageUrl) && !imageError;

	return (
		<div className={cn("flex w-full flex-col gap-2.5", className)}>
			<div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/25 shadow-xs sm:rounded-3xl">
				{hasImage ? (
					<img
						src={imageUrl ?? undefined}
						alt={productName}
						loading="eager"
						onError={() => setImageError(true)}
						className="size-full object-cover transition-transform duration-500 hover:scale-105"
					/>
				) : (
					<div className="flex size-full flex-col items-center justify-center bg-radial from-emerald-500/15 via-emerald-500/5 to-transparent p-6 text-center">
						<div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 shadow-xs dark:text-emerald-400">
							<Sprout className="size-8" />
						</div>
						<span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
							Verdear Agroecologia
						</span>
						<p className="mt-1 max-w-[200px] text-[11px] text-muted-foreground">
							Produto fresco e agroecológico da agricultura familiar
						</p>
					</div>
				)}

				{/* Badges de Estoque */}
				<div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
					{isOutOfStock ? (
						<Badge
							variant="destructive"
							className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-xs gap-1"
						>
							<AlertCircle className="size-3.5" />
							<span>Esgotado</span>
						</Badge>
					) : isLowStock && typeof stock === "number" ? (
						<span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-xs">
							<span>Últimas {stock} un.</span>
						</span>
					) : null}
				</div>
			</div>
		</div>
	);
}
