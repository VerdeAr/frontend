import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface StarRatingInputProps {
	value: number;
	onChange: (rating: number) => void;
	maxStars?: number;
	disabled?: boolean;
	error?: string | null;
	label?: string;
	id?: string;
	className?: string;
}

const RATING_LABELS: Record<number, string> = {
	1: "Muito insatisfeito (1 estrela)",
	2: "Insatisfeito (2 estrelas)",
	3: "Regular (3 estrelas)",
	4: "Satisfeito (4 estrelas)",
	5: "Excelente! (5 estrelas)",
};

export function StarRatingInput({
	value,
	onChange,
	maxStars = 5,
	disabled = false,
	error,
	label = "Sua nota",
	id = "star-rating-input",
	className,
}: StarRatingInputProps) {
	const [hoveredRating, setHoveredRating] = useState<number | null>(null);

	const activeRating = hoveredRating ?? value;
	const activeLabel =
		activeRating > 0 ? RATING_LABELS[activeRating] : "Selecione uma nota";

	return (
		<fieldset className={cn("flex flex-col gap-2 border-0 p-0 m-0", className)}>
			{label && (
				<legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
					{label}
				</legend>
			)}

			<div id={id} className="flex flex-wrap items-center gap-1.5">
				{Array.from({ length: maxStars }, (_, index) => {
					const starNumber = index + 1;
					const isFilled = starNumber <= activeRating;
					const isSelected = starNumber === value;

					return (
						<button
							key={starNumber}
							type="button"
							aria-pressed={isSelected}
							aria-label={`${starNumber} de ${maxStars} estrelas: ${RATING_LABELS[starNumber]}`}
							disabled={disabled}
							onClick={() => onChange(starNumber)}
							onMouseEnter={() => setHoveredRating(starNumber)}
							onMouseLeave={() => setHoveredRating(null)}
							onFocus={() => setHoveredRating(starNumber)}
							onBlur={() => setHoveredRating(null)}
							className={cn(
								"flex size-11 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl transition-all duration-150",
								"hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
								"disabled:cursor-not-allowed disabled:opacity-50",
								isSelected && "bg-amber-500/10",
							)}
						>
							<Star
								className={cn(
									"size-7 transition-transform duration-150",
									isFilled
										? "fill-amber-400 text-amber-400 scale-105"
										: "fill-transparent text-muted-foreground/35 hover:text-amber-400/60",
								)}
							/>
						</button>
					);
				})}

				<span
					aria-live="polite"
					className="ml-2 text-xs font-medium text-muted-foreground"
				>
					{activeLabel}
				</span>
			</div>

			{error && (
				<p role="alert" className="text-xs font-medium text-destructive">
					{error}
				</p>
			)}
		</fieldset>
	);
}
