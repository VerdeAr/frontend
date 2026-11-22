import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, SendHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
	type ChatMessageFormData,
	chatMessageSchema,
	MESSAGE_MAX_LENGTH,
} from "@/schemas";

// Tempo sem digitar até avisar o outro participante que parou
const TYPING_IDLE_MS = 2000;

export interface ChatMessageInputProps {
	onSend: (content: string) => Promise<void>;
	onTypingChange?: (isTyping: boolean) => void;
	disabled?: boolean;
	disabledReason?: string;
	className?: string;
}

export function ChatMessageInput({
	onSend,
	onTypingChange,
	disabled = false,
	disabledReason,
	className,
}: ChatMessageInputProps) {
	const [sendError, setSendError] = useState<string | null>(null);
	const isTypingRef = useRef(false);
	const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const formRef = useRef<HTMLFormElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<ChatMessageFormData>({
		resolver: zodResolver(chatMessageSchema),
		defaultValues: { content: "" },
	});

	const contentLength = watch("content").length;

	const scrollToInput = useCallback(() => {
		formRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
	}, []);

	const handleFocus = () => {
		// Dá um pequeno atraso para o teclado virtual do celular abrir/animar
		setTimeout(scrollToInput, 150);
		setTimeout(scrollToInput, 400);
	};

	// Monitora mudanças no visualViewport ou rotação da tela mantendo o campo em foco visível
	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleViewportChange = () => {
			if (document.activeElement === textareaRef.current) {
				setTimeout(scrollToInput, 150);
			}
		};

		const vv = window.visualViewport;
		if (vv) {
			vv.addEventListener("resize", handleViewportChange);
			vv.addEventListener("scroll", handleViewportChange);
		}
		window.addEventListener("orientationchange", handleViewportChange);

		return () => {
			if (vv) {
				vv.removeEventListener("resize", handleViewportChange);
				vv.removeEventListener("scroll", handleViewportChange);
			}
			window.removeEventListener("orientationchange", handleViewportChange);
		};
	}, [scrollToInput]);

	const stopTyping = useCallback(() => {
		if (idleTimerRef.current) {
			clearTimeout(idleTimerRef.current);
			idleTimerRef.current = null;
		}
		if (isTypingRef.current) {
			isTypingRef.current = false;
			onTypingChange?.(false);
		}
	}, [onTypingChange]);

	const handleTyping = () => {
		if (!isTypingRef.current) {
			isTypingRef.current = true;
			onTypingChange?.(true);
		}
		if (idleTimerRef.current) {
			clearTimeout(idleTimerRef.current);
		}
		idleTimerRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
	};

	// Ao sair da sala, garante que o outro lado não fique vendo "digitando..."
	useEffect(() => stopTyping, [stopTyping]);

	const onSubmit = async (data: ChatMessageFormData) => {
		setSendError(null);
		stopTyping();
		try {
			await onSend(data.content);
			reset({ content: "" });
		} catch (err: unknown) {
			// Mantém o texto para o usuário tentar de novo
			setSendError(
				err instanceof Error ? err.message : "Não foi possível enviar.",
			);
		}
	};

	const submit = handleSubmit(onSubmit);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		// Enter envia; Shift+Enter quebra a linha
		if (
			event.key === "Enter" &&
			!event.shiftKey &&
			!event.nativeEvent.isComposing
		) {
			event.preventDefault();
			void submit();
		}
	};

	const isBlocked = disabled || isSubmitting;
	const feedback = disabled
		? disabledReason
		: (sendError ?? errors.content?.message);
	const {
		onChange,
		ref: formRegisterRef,
		...contentField
	} = register("content");

	return (
		<form
			ref={formRef}
			onSubmit={submit}
			className={cn(
				"flex w-full flex-col gap-1.5 border-t border-border/60 bg-background p-3 landscape:p-1.5 landscape:gap-1",
				className,
			)}
		>
			<div className="flex items-end gap-2 landscape:gap-1.5">
				<label htmlFor="chat-message" className="sr-only">
					Mensagem
				</label>
				<textarea
					id="chat-message"
					ref={(node) => {
						formRegisterRef(node);
						textareaRef.current = node;
					}}
					rows={1}
					maxLength={MESSAGE_MAX_LENGTH}
					placeholder={disabled ? "Envio indisponível" : "Digite sua mensagem"}
					disabled={disabled}
					autoComplete="off"
					aria-invalid={Boolean(errors.content)}
					onFocus={handleFocus}
					onKeyDown={handleKeyDown}
					onChange={(event) => {
						void onChange(event);
						handleTyping();
					}}
					{...contentField}
					// text-base no mobile evita o zoom automático do iOS ao focar
					className="field-sizing-content max-h-32 min-h-11 w-full flex-1 resize-none rounded-2xl border border-input bg-muted/40 px-4 py-2.5 text-base outline-none transition-colors focus:border-primary focus:bg-background disabled:cursor-not-allowed disabled:opacity-60 md:text-sm landscape:max-h-16 landscape:min-h-9 landscape:px-3 landscape:py-1.5"
				/>
				<button
					type="submit"
					disabled={isBlocked}
					className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50 landscape:size-9"
					aria-label="Enviar mensagem"
				>
					{isSubmitting ? (
						<Loader2 className="size-5 animate-spin landscape:size-4" />
					) : (
						<SendHorizontal className="size-5 landscape:size-4" />
					)}
				</button>
			</div>

			{(feedback || contentLength > MESSAGE_MAX_LENGTH * 0.9) && (
				<div className="flex items-center justify-between gap-2 px-1 text-xs landscape:text-[11px]">
					<span
						className={cn(
							disabled ? "text-muted-foreground" : "text-destructive",
						)}
						role={feedback && !disabled ? "alert" : undefined}
					>
						{feedback}
					</span>
					{contentLength > MESSAGE_MAX_LENGTH * 0.9 && (
						<span className="shrink-0 text-muted-foreground">
							{contentLength}/{MESSAGE_MAX_LENGTH}
						</span>
					)}
				</div>
			)}
		</form>
	);
}
