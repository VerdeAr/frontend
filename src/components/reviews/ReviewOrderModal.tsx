import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertCircle,
	CheckCircle2,
	Loader2,
	Sparkles,
	Sprout,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { type ReviewFormData, reviewFormSchema } from "@/schemas";
import { reviewService } from "@/services";
import { StarRatingInput } from "./StarRatingInput";

export interface ReviewOrderModalItem {
	id: string;
	product_name: string;
	product_image?: string | null;
	quantity?: number;
	measurement_unit?: string | null;
}

export interface ReviewOrderModalSale {
	id: string;
	items?: ReviewOrderModalItem[];
}

export interface ReviewOrderModalProps {
	isOpen: boolean;
	onClose: () => void;
	sale: ReviewOrderModalSale | null;
	onSuccess?: () => void;
}

export function ReviewOrderModal({
	isOpen,
	onClose,
	sale,
	onSuccess,
}: ReviewOrderModalProps) {
	const [apiError, setApiError] = useState<string | null>(null);
	const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

	const {
		control,
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ReviewFormData>({
		resolver: zodResolver(reviewFormSchema),
		defaultValues: {
			rating: 0,
			comment: "",
		},
	});

	const commentValue = watch("comment") || "";
	const characterCount = commentValue.length;

	// Limpa o formulário e erros sempre que o modal abrir ou a venda mudar
	useEffect(() => {
		if (isOpen) {
			reset({ rating: 0, comment: "" });
			setApiError(null);
			setIsSubmittedSuccess(false);
		}
	}, [isOpen, reset]);

	const onSubmit = async (data: ReviewFormData) => {
		if (!sale) return;

		setApiError(null);
		try {
			await reviewService.createReview({
				sale_id: sale.id,
				rating: data.rating,
				comment: data.comment ? data.comment.trim() : null,
			});

			setIsSubmittedSuccess(true);
			setTimeout(() => {
				onSuccess?.();
				onClose();
			}, 1200);
		} catch (err: unknown) {
			console.error("Erro ao enviar avaliação:", err);
			const error = err as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			setApiError(
				error.response?.data?.message ||
					"Não foi possível registrar sua avaliação. Tente novamente.",
			);
		}
	};

	if (!sale) return null;

	const shortSaleId = sale.id.slice(0, 8).toUpperCase();

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
				<DialogHeader className="gap-1.5 text-left">
					<div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs tracking-wider uppercase">
						<Sparkles className="size-4" />
						<span>Avaliação do Pedido</span>
					</div>
					<DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
						Como foi sua experiência?
					</DialogTitle>
					<DialogDescription className="text-xs sm:text-sm text-muted-foreground">
						Sua avaliação ajuda a fortalecer nossos produtores rurais e orienta
						outros consumidores locais.
					</DialogDescription>
				</DialogHeader>

				{/* Resumo visual dos itens do pedido */}
				{sale.items && sale.items.length > 0 && (
					<div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3 border border-border/50">
						<span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
							Itens do Pedido #{shortSaleId}
						</span>
						<div className="flex flex-wrap gap-2">
							{sale.items.map((item) => (
								<div
									key={item.id}
									className="flex items-center gap-2 rounded-lg bg-background/80 px-2.5 py-1 text-xs border border-border/40 shadow-2xs"
								>
									{item.product_image ? (
										<img
											src={item.product_image}
											alt={item.product_name}
											className="size-4.5 rounded-sm object-cover"
										/>
									) : (
										<Sprout className="size-3.5 text-emerald-600 dark:text-emerald-400" />
									)}
									<span className="font-medium text-foreground truncate max-w-[150px]">
										{item.product_name}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{isSubmittedSuccess ? (
					<div className="flex flex-col items-center justify-center gap-3 py-8 text-center animate-in fade-in zoom-in-95">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
							<CheckCircle2 className="size-8" />
						</div>
						<h3 className="text-base font-bold text-foreground">
							Avaliação enviada com sucesso!
						</h3>
						<p className="text-xs text-muted-foreground max-w-xs">
							Obrigado por apoiar a agricultura familiar sustentável do VerdeAr.
						</p>
					</div>
				) : (
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-5 pt-2"
					>
						{/* Seletor de Estrelas */}
						<Controller
							control={control}
							name="rating"
							render={({ field }) => (
								<StarRatingInput
									id={`rating-${sale.id}`}
									label="Qual sua nota para esta compra?"
									value={field.value}
									onChange={(val) => field.onChange(val)}
									error={errors.rating?.message}
									disabled={isSubmitting}
								/>
							)}
						/>

						{/* Campo de Comentário Opcional */}
						<div className="flex flex-col gap-1.5">
							<div className="flex items-center justify-between">
								<label
									htmlFor={`comment-${sale.id}`}
									className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
								>
									Comentário (opcional)
								</label>
								<span
									className={`text-[11px] font-medium ${
										characterCount > 480
											? "text-destructive font-bold"
											: "text-muted-foreground/70"
									}`}
								>
									{characterCount}/500
								</span>
							</div>

							<textarea
								id={`comment-${sale.id}`}
								{...register("comment")}
								rows={3}
								maxLength={500}
								disabled={isSubmitting}
								placeholder="Conte o que achou da qualidade dos produtos, da entrega ou do atendimento..."
								className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground shadow-2xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors"
							/>

							{errors.comment && (
								<p
									role="alert"
									className="text-xs font-medium text-destructive"
								>
									{errors.comment.message}
								</p>
							)}
						</div>

						{/* Mensagem de Erro da API */}
						{apiError && (
							<div
								role="alert"
								className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20"
							>
								<AlertCircle className="size-4 shrink-0" />
								<span>{apiError}</span>
							</div>
						)}

						{/* Rodapé com Ações */}
						<DialogFooter className="mt-2 sm:gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={isSubmitting}
								className="h-11 w-full sm:w-auto rounded-xl text-sm font-semibold"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="h-11 w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold gap-2 shadow-xs"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										<span>Enviando...</span>
									</>
								) : (
									<span>Enviar Avaliação</span>
								)}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
