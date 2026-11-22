import { AlertCircle, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
	ChatBubble,
	ChatConnectionBanner,
	ChatMessageInput,
	TypingIndicator,
} from "@/components/chat";
import { buttonVariants } from "@/components/ui/button";
import { useVisualViewport } from "@/hooks";
import { getChatContact } from "@/lib/chat";
import { cn } from "@/lib/utils";
import { socketService } from "@/services/socket.service";
import {
	selectChatById,
	selectChatMessages,
	selectConnectionStatus,
	selectIsTyping,
	useAuthStore,
	useChatStore,
} from "@/stores";

export default function ChatRoomPage() {
	const { id: chatId = "" } = useParams<{ id: string }>();
	const currentUserId = useAuthStore((state) => state.user?.id);

	const chat = useChatStore(selectChatById(chatId));
	const loadedChatId = chat?.id;
	const messages = useChatStore(selectChatMessages(chatId));
	const isTyping = useChatStore(selectIsTyping(chatId));
	const connectionStatus = useChatStore(selectConnectionStatus);
	const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
	const fetchChat = useChatStore((state) => state.fetchChat);
	const fetchMessages = useChatStore((state) => state.fetchMessages);
	const sendMessage = useChatStore((state) => state.sendMessage);
	const openChat = useChatStore((state) => state.openChat);
	const closeChat = useChatStore((state) => state.closeChat);

	const {
		height: visualHeight,
		isLandscape,
		isKeyboardOpen,
	} = useVisualViewport();
	const isCompactLandscape = isLandscape && visualHeight < 600;

	const [notFound, setNotFound] = useState(false);
	const endRef = useRef<HTMLDivElement>(null);
	const hasScrolledRef = useRef(false);

	// Carrega a conversa e o histórico, e marca a sala como aberta (zera as não lidas)
	useEffect(() => {
		if (!chatId) return;
		let cancelled = false;
		hasScrolledRef.current = false;
		setNotFound(false);

		void fetchChat(chatId).then((loaded) => {
			if (cancelled) return;
			if (!loaded) {
				setNotFound(true);
				return;
			}
			void fetchMessages(chatId);
			openChat(chatId);
		});

		return () => {
			cancelled = true;
			closeChat();
		};
	}, [chatId, fetchChat, fetchMessages, openChat, closeChat]);

	// Garante a sala mesmo para conversa criada depois da última conexão
	useEffect(() => {
		if (!loadedChatId || connectionStatus !== "conectado") return;
		socketService.joinChat(loadedChatId).catch((err: unknown) => {
			console.error("Erro ao entrar na sala da conversa:", err);
		});
	}, [loadedChatId, connectionStatus]);

	// Rolagem automática: instantânea na primeira carga, suave nas novas mensagens
	useEffect(() => {
		if (messages.length === 0 && !isTyping) return;
		endRef.current?.scrollIntoView({
			behavior: hasScrolledRef.current ? "smooth" : "auto",
			block: "end",
		});
		hasScrolledRef.current = true;
	}, [messages.length, isTyping]);

	// Mantém a rolagem ajustada quando a altura visível do viewport muda (ex: teclado virtual abre)
	useEffect(() => {
		if (hasScrolledRef.current && visualHeight > 0) {
			endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
		}
	}, [visualHeight]);

	const handleSend = useCallback(
		(content: string) => sendMessage(chatId, content),
		[chatId, sendMessage],
	);

	const handleTypingChange = useCallback(
		(typing: boolean) => socketService.emitTyping(chatId, typing),
		[chatId],
	);

	if (notFound) {
		return (
			<div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
				<AlertCircle className="size-8 text-destructive" />
				<p className="text-sm text-foreground">
					Conversa não encontrada ou você não participa dela.
				</p>
				<Link
					to="/chat"
					className={cn(
						buttonVariants({ variant: "outline" }),
						"h-11 rounded-xl px-5",
					)}
				>
					Voltar para mensagens
				</Link>
			</div>
		);
	}

	if (!chat) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	const contact = getChatContact(chat, currentUserId);
	const isFinished = chat.status === "FINALIZADO";
	const statusText = isTyping
		? "digitando..."
		: isFinished
			? "Conversa finalizada"
			: contact.subtitle;

	// Em orientação horizontal (especialmente com teclado virtual aberto),
	// fixa a altura do chat ao espaço visível da tela
	const containerStyle = isCompactLandscape
		? {
				height: `${Math.max(visualHeight - (isKeyboardOpen ? 12 : 64), 140)}px`,
			}
		: undefined;

	return (
		<div
			style={containerStyle}
			className={cn(
				"mx-auto flex h-[calc(100dvh-7rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-xs",
				isCompactLandscape && "rounded-xl border-border/40",
			)}
		>
			<div
				className={cn(
					"flex shrink-0 items-center gap-2 border-b border-border/60 bg-background px-2 py-2",
					isCompactLandscape && "py-1",
				)}
			>
				<Link
					to="/chat"
					className={cn(
						"flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
						isCompactLandscape && "size-8",
					)}
					aria-label="Voltar para mensagens"
				>
					<ArrowLeft className={isCompactLandscape ? "size-4" : "size-5"} />
				</Link>
				<div className="flex min-w-0 flex-col">
					<h1
						className={cn(
							"truncate font-bold text-foreground",
							isCompactLandscape ? "text-sm" : "text-base",
						)}
					>
						{contact.name}
					</h1>
					{statusText && (
						<span
							className={cn(
								"truncate text-xs",
								isTyping ? "italic text-primary" : "text-muted-foreground",
								isCompactLandscape && "text-[11px] leading-tight",
							)}
						>
							{statusText}
						</span>
					)}
				</div>
			</div>

			<ChatConnectionBanner
				status={connectionStatus}
				className="shrink-0 rounded-none border-x-0 border-t-0"
			/>

			<div
				className={cn(
					"flex flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-3 py-4",
					isCompactLandscape && "gap-1.5 py-2",
				)}
				role="log"
				aria-label={`Mensagens com ${contact.name}`}
			>
				{isLoadingMessages && messages.length === 0 ? (
					<div className="flex flex-1 items-center justify-center">
						<Loader2 className="size-6 animate-spin text-primary" />
					</div>
				) : messages.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
						<MessageCircle className="size-8" />
						<p className="text-sm">
							Envie a primeira mensagem para {contact.name}.
						</p>
					</div>
				) : (
					messages.map((message) => (
						<ChatBubble
							key={message.id}
							message={message}
							isMine={message.sender_id === currentUserId}
						/>
					))
				)}
				{isTyping && <TypingIndicator name={contact.name} />}
				<div ref={endRef} />
			</div>

			<ChatMessageInput
				onSend={handleSend}
				onTypingChange={handleTypingChange}
				disabled={isFinished}
				disabledReason="Esta conversa foi finalizada e não aceita novas mensagens."
				className="shrink-0"
			/>
		</div>
	);
}
