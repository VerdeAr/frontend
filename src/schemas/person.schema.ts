import { z } from "zod";

export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(2, "Nome deve ter pelo menos 2 caracteres")
		.max(100, "Nome muito longo"),
	phone: z.string().max(20).optional().or(z.literal("")),
	address: z.string().max(255).optional().or(z.literal("")),
	neighborhood_id: z.string().optional().or(z.literal("")),

	// Campos opcionais do Vendedor Rural
	farm_name: z.string().max(150).optional().or(z.literal("")),
	description: z.string().max(500).optional().or(z.literal("")),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z
	.object({
		current_password: z.string().min(1, "Senha atual é obrigatória"),
		new_password: z
			.string()
			.min(6, "A nova senha deve ter no mínimo 6 caracteres"),
		confirm_password: z
			.string()
			.min(6, "Confirmação de senha deve ter no mínimo 6 caracteres"),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "A nova senha e a confirmação não coincidem",
		path: ["confirm_password"],
	});

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export const updateShippingRateSchema = z.object({
	fixed_shipping_rate: z
		.number()
		.min(0, "A taxa de frete não pode ser negativa"),
});

export type UpdateShippingRateFormData = z.infer<
	typeof updateShippingRateSchema
>;
