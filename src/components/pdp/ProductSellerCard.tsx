import { Loader2, MessageCircle, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { StarRatingDisplay } from "@/components/reviews";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reviewService } from "@/services/review.service";
import type { FormattedReviewItem, Seller } from "@/types";

export interface ProductSellerCardProps {
	seller?: Seller | null;
	// Sem a ação (ex.: produto do próprio usuário), o botão de conversa não aparece
	onContactSeller?: () => void;
	isContacting?: boolean;
	contactError?: string | null;
	className?: string;
}

export function ProductSellerCard({
	seller,
	onContactSeller,
	isContacting = false,
	contactError,
	className,
}: ProductSellerCardProps) {
	const [sellerReviews, setSellerReviews] = useState<FormattedReviewItem[]>([]);

	useEffect(() => {
		if (!seller?.id) return;
		let isMounted = true;

		reviewService
			.getReviewsBySeller(seller.id)
			.then((data) => {
				if (isMounted) setSellerReviews(data);
			})
			.catch((err) => {
				console.error("Erro ao carregar reputação do vendedor:", err);
			});

		return () => {
			isMounted = false;
		};
	}, [seller?.id]);

	const totalReviews = sellerReviews.length;
	const averageRating =
		totalReviews > 0
			? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
			: null;

	const farmName = seller?.farm_name || "Propriedade Agroecológica";
	const producerName = seller?.user?.name || "Produtor Rural Parceiro";
	const description =
		seller?.description ||
		"Produtor rural familiar comprometido com o cultivo sustentável, respeito à terra e oferta de alimentos saudáveis sem agrotóxicos para a comunidade local.";

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-3.5 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-xs sm:rounded-3xl sm:p-5",
				className,
			)}
		>
			{/* Cabeçalho do Produtor */}
			<div className="flex items-start gap-3.5">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 shadow-xs dark:text-emerald-400">
					<Store className="size-6" />
				</div>

				<div className="flex flex-1 flex-col min-w-0">
					<h2 className="text-base font-bold text-foreground sm:text-lg truncate">
						{farmName}
					</h2>

					<p className="text-xs text-muted-foreground truncate">
						Responsável: {producerName}
					</p>

					{/* Reputação Geral do Produtor */}
					<div className="mt-1 flex items-center">
						<StarRatingDisplay
							rating={averageRating}
							reviewCount={totalReviews}
							size="sm"
						/>
					</div>
				</div>
			</div>

			{/* Descrição e História do Produtor */}
			<p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
				{description}
			</p>

			{onContactSeller && (
				<div className="flex flex-col gap-1.5">
					<Button
						variant="outline"
						onClick={onContactSeller}
						disabled={isContacting}
						className="h-11 w-full gap-2 rounded-xl text-sm font-semibold"
					>
						{isContacting ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<MessageCircle className="size-4" />
						)}
						Conversar com o produtor
					</Button>
					{contactError && (
						<p role="alert" className="text-xs text-destructive">
							{contactError}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
