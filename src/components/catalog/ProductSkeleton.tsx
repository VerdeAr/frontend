import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ProductSkeletonProps {
	className?: string;
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
	return (
		<div
			className={cn(
				"relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/40 bg-card p-0 shadow-xs",
				className,
			)}
		>
			{/* Placeholder da Imagem */}
			<div className="relative aspect-square w-full bg-muted/40 animate-pulse">
				<Skeleton className="size-full rounded-none" />
				{/* Tag de categoria simulada */}
				<div className="absolute top-2.5 left-2.5">
					<Skeleton className="h-5 w-16 rounded-full bg-background/60 backdrop-blur-xs" />
				</div>
			</div>

			{/* Placeholder das Informações */}
			<div className="flex flex-1 flex-col justify-between p-3 sm:p-4 gap-3">
				<div className="space-y-2">
					{/* Nome da Fazenda */}
					<div className="flex items-center gap-1.5">
						<Skeleton className="size-3.5 rounded-full" />
						<Skeleton className="h-3 w-24" />
					</div>

					{/* Título do Produto (2 linhas) */}
					<Skeleton className="h-4 w-4/5" />
					<Skeleton className="h-3.5 w-3/5" />
				</div>

				{/* Preço e Botão */}
				<div className="pt-2 border-t border-border/40 space-y-2.5">
					<div className="flex items-center justify-between">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-3 w-12 hidden sm:block" />
					</div>
					{/* Altura de 44px (h-11) para simular o botão touch */}
					<Skeleton className="h-11 w-full rounded-xl sm:rounded-2xl" />
				</div>
			</div>
		</div>
	);
}
