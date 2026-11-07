import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingDisplayProps {
	rating?: number | null;
	reviewCount?: number | null;
	showCount?: boolean;
	showStars?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const SIZE_VARIANTS = {
	sm: {
		star: "size-3.5",
		text: "text-xs",
		gap: "gap-1",
	},
	md: {
		star: "size-4",
		text: "text-sm",
		gap: "gap-1.5",
	},
	lg: {
		star: "size-5",
		text: "text-base",
		gap: "gap-2",
	},
};

export function StarRatingDisplay({
	rating,
	reviewCount,
	showCount = true,
	showStars = true,
	size = "sm",
	className,
}: StarRatingDisplayProps) {
	const currentSize = SIZE_VARIANTS[size];
	const hasRating = typeof rating === "number" && rating > 0;
	const count = typeof reviewCount === "number" ? reviewCount : 0;
	const formattedRating = hasRating ? rating.toFixed(1) : "Novo";

	const accessibleLabel = hasRating
		? `Nota ${formattedRating} de 5 estrelas baseada em ${count} avaliações`
		: "Produto novo sem avaliações";

	return (
		<div
			role="img"
			aria-label={accessibleLabel}
			className={cn(
				"inline-flex items-center",
				currentSize.gap,
				currentSize.text,
				className,
			)}
		>
			{showStars && (
				<div
					className="flex items-center gap-0.5 text-amber-400"
					aria-hidden="true"
				>
					{Array.from({ length: 5 }, (_, index) => {
						const starThreshold = index + 1;
						const isFilled = hasRating && rating >= starThreshold;
						const isHalf =
							hasRating && !isFilled && rating >= starThreshold - 0.5;

						return (
							<Star
								key={starThreshold}
								className={cn(
									currentSize.star,
									isFilled
										? "fill-amber-400 text-amber-400"
										: isHalf
											? "fill-amber-400/50 text-amber-400"
											: "fill-transparent text-muted-foreground/30",
								)}
							/>
						);
					})}
				</div>
			)}

			<span className="font-semibold text-foreground">{formattedRating}</span>

			{showCount && (
				<span className="text-muted-foreground">
					{count > 0 ? `(${count})` : "• Sem avaliações"}
				</span>
			)}
		</div>
	);
}
