import {
	AlertCircle,
	ArrowRight,
	MessageCircle,
	RefreshCw,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";
import { ChatConnectionBanner, ChatContactItem } from "@/components/chat";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getChatContact } from "@/lib/chat";
import { cn } from "@/lib/utils";
import {
	selectChats,
	selectConnectionStatus,
	useAuthStore,
	useChatStore,
} from "@/stores";

export default function ChatInboxPage() {
	const currentUserId = useAuthStore((state) => state.user?.id);
	const chats = useChatStore(selectChats);
	const unreadByChat = useChatStore((state) => state.unreadByChat);
	const typingByChat = useChatStore((state) => state.typingByChat);
	const connectionStatus = useChatStore(selectConnectionStatus);
	const isLoadingChats = useChatStore((state) => state.isLoadingChats);
	const error = useChatStore((state) => state.error);
	const fetchChats = useChatStore((state) => state.fetchChats);

	useEffect(() => {
		void fetchChats();
	}, [fetchChats]);

	const isFirstLoad = isLoadingChats && chats.length === 0;

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
			<div className="flex flex-col gap-1 border-b border-border/60 pb-4">
				<h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
					Mensagens
				</h1>
				<p className="text-sm text-muted-foreground">
					Converse com produtores e clientes sobre produtos e pedidos.
				</p>
			</div>

			<ChatConnectionBanner status={connectionStatus} />

			{error && chats.length === 0 ? (
				<div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
					<AlertCircle className="size-8 text-destructive" />
					<p className="text-sm text-foreground">{error}</p>
					<Button
						variant="outline"
						onClick={() => void fetchChats()}
						className="h-11 gap-2 rounded-xl px-5"
					>
						<RefreshCw className="size-4" />
						Tentar novamente
					</Button>
				</div>
			) : isFirstLoad ? (
				<ul className="flex flex-col gap-2" aria-label="Carregando conversas">
					{["s1", "s2", "s3", "s4"].map((key) => (
						<li key={key}>
							<Skeleton className="h-16 w-full rounded-2xl" />
						</li>
					))}
				</ul>
			) : chats.length === 0 ? (
				<div className="flex flex-col items-center px-4 py-12 text-center">
					<div className="mb-5 flex size-16 items-center justify-center rounded-3xl border border-emerald-500/20 bg-emerald-500/10 text-primary">
						<MessageCircle className="size-8" />
					</div>
					<h2 className="mb-2 text-lg font-bold text-foreground">
						Nenhuma conversa ainda
					</h2>
					<p className="mb-6 max-w-sm text-sm text-muted-foreground">
						Abra um produto e toque em "Conversar com o produtor" para tirar
						dúvidas direto com quem planta.
					</p>
					<Link
						to="/#produtos"
						className={cn(
							buttonVariants({ variant: "default" }),
							"h-11 gap-2 rounded-xl px-6 text-sm font-semibold",
						)}
					>
						Explorar produtos
						<ArrowRight className="size-4" />
					</Link>
				</div>
			) : (
				<ul className="flex flex-col gap-2">
					{chats.map((chat) => {
						const contact = getChatContact(chat, currentUserId);
						return (
							<li key={chat.id}>
								<ChatContactItem
									chat={chat}
									contactName={contact.name}
									contactSubtitle={contact.subtitle}
									isSellerContact={chat.customer_id === currentUserId}
									unreadCount={unreadByChat[chat.id] ?? 0}
									isTyping={typingByChat[chat.id] ?? false}
								/>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
