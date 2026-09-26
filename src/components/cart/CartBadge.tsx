import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { selectCartItemCount, useCartStore } from "@/stores";

export interface CartBadgeProps {
	className?: string;
}

export function CartBadge({ className }: CartBadgeProps) {
	const count = useCartStore(selectCartItemCount);
	const [isPulsing, setIsPulsing] = useState(false);
	const prevCountRef = useRef(count);

	useEffect(() => {
		if (count !== prevCountRef.current) {
			prevCountRef.current = count;
			if (count > 0) {
				setIsPulsing(true);
				const timer = setTimeout(() => setIsPulsing(false), 300);
				return () => clearTimeout(timer);
			}
		}
	}, [count]);

	if (count <= 0) {
		return null;
	}

	const displayCount = count > 99 ? "99+" : count;

	return (
		<span
			className={cn(
				"absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs transition-transform duration-300 pointer-events-none select-none",
				isPulsing && "scale-125",
				className,
			)}
		>
			<span className="sr-only">, {count} itens no carrinho</span>
			<span aria-hidden="true">{displayCount}</span>
		</span>
	);
}
