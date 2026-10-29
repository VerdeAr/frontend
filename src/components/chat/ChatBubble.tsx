import { Check, CheckCheck } from "lucide-react";
import { formatChatTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

export interface ChatBubbleProps {
	message: Message;
	isMine: boolean;
}

export function ChatBubble({ message, isMine }: ChatBubbleProps) {
	return (
		<div
			className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}
		>
			<div
				className={cn(
					"flex max-w-[80%] flex-col gap-1 rounded-2xl px-3.5 py-2 shadow-xs md:max-w-[65%]",
					isMine
						? "rounded-br-md bg-primary text-primary-foreground"
						: "rounded-bl-md border border-border/60 bg-card text-foreground",
				)}
			>
				<p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
					{message.content}
				</p>
				<div
					className={cn(
						"flex items-center justify-end gap-1 text-[10px]",
						isMine ? "text-primary-foreground/80" : "text-muted-foreground",
					)}
				>
					<time dateTime={message.created_at}>
						{formatChatTime(message.created_at)}
					</time>
					{/* Confirmação de leitura só nas mensagens enviadas por mim */}
					{isMine &&
						(message.is_read ? (
							<CheckCheck className="size-3.5" aria-label="Lida" />
						) : (
							<Check className="size-3.5" aria-label="Enviada" />
						))}
				</div>
			</div>
		</div>
	);
}
