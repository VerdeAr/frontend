import { ChevronRight, Store, User as UserIcon } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { formatChatListDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Chat } from "@/types";

export interface ChatContactItemProps {
	chat: Chat;
	contactName: string;
	contactSubtitle?: string;
	isSellerContact: boolean;
	unreadCount: number;
	isTyping?: boolean;
}

export function ChatContactItem({
	chat,
	contactName,
	contactSubtitle,
	isSellerContact,
	unreadCount,
	isTyping = false,
}: ChatContactItemProps) {
	const hasUnread = unreadCount > 0;
	const isFinished = chat.status === "FINALIZADO";
	const lastActivity = chat.last_message_at ?? chat.created_at;
	const Icon = isSellerContact ? Store : UserIcon;

	const statusText = isTyping
		? "digitando..."
		: isFinished
			? "Conversa finalizada"
			: contactSubtitle || (chat.last_message_at ? "" : "Nenhuma mensagem");

	return (
		<Link
			to={`/chat/${chat.id}`}
			className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 shadow-xs transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			aria-label={
				hasUnread
					? `Conversa com ${contactName}, ${unreadCount} mensagens não lidas`
					: `Conversa com ${contactName}`
			}
		>
			<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
				<Icon className="size-5" />
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center justify-between gap-2">
					<span
						className={cn(
							"truncate text-sm",
							hasUnread ? "font-bold text-foreground" : "font-semibold",
						)}
					>
						{contactName}
					</span>
					<span
						className={cn(
							"shrink-0 text-xs",
							hasUnread
								? "font-semibold text-primary"
								: "text-muted-foreground",
						)}
					>
						{formatChatListDate(lastActivity)}
					</span>
				</div>

				<div className="flex items-center justify-between gap-2">
					<span
						className={cn(
							"truncate text-xs",
							isTyping ? "italic text-primary" : "text-muted-foreground",
						)}
					>
						{statusText}
					</span>
					{hasUnread && (
						<Badge className="h-5 min-w-5 px-1.5 text-[10px] font-bold">
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					)}
					{isFinished && !hasUnread && (
						<Badge variant="outline" className="text-[10px]">
							Finalizada
						</Badge>
					)}
				</div>
			</div>

			<ChevronRight
				className="size-4 shrink-0 text-muted-foreground"
				aria-hidden="true"
			/>
		</Link>
	);
}
