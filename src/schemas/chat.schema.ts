import { z } from "zod";

// Mesmos limites do backend (socketSendMessageSchema)
export const MESSAGE_MAX_LENGTH = 2000;

export const chatMessageSchema = z.object({
	content: z
		.string()
		.trim()
		.min(1, "Digite uma mensagem")
		.max(
			MESSAGE_MAX_LENGTH,
			`A mensagem pode ter no máximo ${MESSAGE_MAX_LENGTH} caracteres`,
		),
});

export type ChatMessageFormData = z.infer<typeof chatMessageSchema>;
