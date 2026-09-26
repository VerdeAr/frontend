import { z } from "zod";

export const productFormSchema = z.object({
	name: z
		.string()
		.min(2, "O nome do produto deve ter no mínimo 2 caracteres")
		.max(255, "Nome muito longo"),
	price: z.number().positive("O preço unitário deve ser maior que zero"),
	stock: z.number().min(0, "O estoque não pode ser negativo"),
	category_id: z.string().optional().or(z.literal("")).nullable(),
	measurement_unit_id: z.string().optional().or(z.literal("")).nullable(),
	description: z
		.string()
		.max(2000, "Descrição muito longa")
		.optional()
		.or(z.literal(""))
		.nullable(),
	image_url: z
		.string()
		.url("Insira uma URL de imagem válida")
		.optional()
		.or(z.literal(""))
		.nullable(),
	is_active: z.boolean(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
