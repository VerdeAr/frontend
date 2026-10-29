import { cn } from "@/lib/utils";

export interface TypingIndicatorProps {
	name?: string;
	className?: string;
}

export function TypingIndicator({ name, className }: TypingIndicatorProps) {
	return (
		<div
			className={cn("flex w-full justify-start", className)}
			role="status"
			aria-live="polite"
		>
			<div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border/60 bg-card px-3.5 py-2.5 shadow-xs">
				<span className="flex items-center gap-1" aria-hidden="true">
					<span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
					<span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
					<span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
				</span>
				<span className="sr-only">
					{name ? `${name} está digitando` : "Digitando"}
				</span>
			</div>
		</div>
	);
}
