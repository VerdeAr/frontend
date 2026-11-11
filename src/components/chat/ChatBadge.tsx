import { cn } from "@/lib/utils";
import { selectUnreadTotal, useChatStore } from "@/stores";

export interface ChatBadgeProps {
	className?: string;
}

// Total de não lidas vem da store, atualizada pelo `new_message` (sem polling)
export function ChatBadge({ className }: ChatBadgeProps) {
	const count = useChatStore(selectUnreadTotal);

	if (count <= 0) {
		return null;
	}

	const displayCount = count > 99 ? "99+" : count;

	return (
		<span
			className={cn(
				"absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs pointer-events-none select-none",
				className,
			)}
		>
			<span className="sr-only">, {count} mensagens não lidas</span>
			<span aria-hidden="true">{displayCount}</span>
		</span>
	);
}
