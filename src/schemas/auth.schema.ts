import { cnpj as cnpjValidator, cpf as cpfValidator } from "cpf-cnpj-validator";
import { z } from "zod";

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, "E-mail é obrigatório")
		.email("Insira um endereço de e-mail válido"),
	password: z
		.string()
		.min(1, "Senha é obrigatória")
		.min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerFormSchema = z
	.object({
		name: z
			.string()
			.min(2, "Nome deve ter pelo menos 2 caracteres")
			.max(100, "Nome muito longo"),
		email: z.email("Insira um endereço de e-mail válido"),
		cpf: z
			.string()
			.min(11, "CPF deve conter no mínimo 11 dígitos")
			.refine(
				(val) => cpfValidator.isValid(val.replace(/\D/g, "")),
				"CPF informado é inválido",
			),
		password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
		confirm_password: z
			.string()
			.min(6, "Confirmação de senha deve ter no mínimo 6 caracteres"),
		role: z.enum(["CLIENTE", "VENDEDOR"]),
		phone: z.string().max(20).optional().or(z.literal("")),
		address: z.string().max(255).optional().or(z.literal("")),
		neighborhood_id: z.string().optional().or(z.literal("")),

		// Campos específicos para Vendedor Rural
		description: z.string().max(500).optional().or(z.literal("")),
		cnpj: z
			.string()
			.optional()
			.or(z.literal(""))
			.refine((val) => {
				if (!val || val.trim() === "") return true;
				return cnpjValidator.isValid(val.replace(/\D/g, ""));
			}, "CNPJ informado é inválido"),
		farm_name: z.string().max(150).optional().or(z.literal("")),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: "As senhas não coincidem",
		path: ["confirm_password"],
	})
	.refine(
		(data) => {
			if (data.role === "VENDEDOR") {
				return !!data.farm_name && data.farm_name.trim().length > 0;
			}
			return true;
		},
		{
			message: "Nome da propriedade ou sítio é obrigatório para vendedores",
			path: ["farm_name"],
		},
	);

export type RegisterFormData = z.infer<typeof registerFormSchema>;
