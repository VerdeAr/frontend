import { z } from "zod";

export const reviewFormSchema = z.object({
	rating: z
		.number()
		.int("A nota deve ser um número inteiro.")
		.min(1, "Selecione pelo menos 1 estrela.")
		.max(5, "A nota máxima é 5 estrelas."),
	comment: z
		.string()
		.max(500, "O comentário deve ter no máximo 500 caracteres.")
		.optional()
		.or(z.literal("")),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

export const createReviewPayloadSchema = z.object({
	sale_id: z.string().uuid("ID de venda inválido."),
	rating: z
		.number()
		.int("Nota deve ser um número inteiro.")
		.min(1, "Nota deve ser entre 1 e 5.")
		.max(5, "Nota deve ser entre 1 e 5."),
	comment: z
		.string()
		.max(500, "Comentário deve ter no máximo 500 caracteres.")
		.optional()
		.nullable(),
});

export type CreateReviewPayload = z.infer<typeof createReviewPayloadSchema>;
