import { Loader2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatConnectionStatus } from "@/types";

export interface ChatConnectionBannerProps {
	status: ChatConnectionStatus;
	className?: string;
}

// Avisa quando o tempo real está fora; conectado não exibe nada
export function ChatConnectionBanner({
	status,
	className,
}: ChatConnectionBannerProps) {
	if (status === "conectado") {
		return null;
	}

	const isReconnecting = status === "reconectando";

	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(
				"flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium",
				isReconnecting
					? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
					: "border-destructive/30 bg-destructive/10 text-destructive",
				className,
			)}
		>
			{isReconnecting ? (
				<Loader2 className="size-3.5 shrink-0 animate-spin" />
			) : (
				<WifiOff className="size-3.5 shrink-0" />
			)}
			<span>
				{isReconnecting
					? "Conectando ao chat... As mensagens novas aparecem assim que a conexão voltar."
					: "Chat sem conexão em tempo real. Atualize a página ou entre novamente."}
			</span>
		</div>
	);
}
