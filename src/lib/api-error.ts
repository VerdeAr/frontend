import { isAxiosError } from "axios";

/** Formato de erro devolvido pela API (`ErrorResponse` no Swagger do backend). */
interface ApiErrorBody {
	message?: unknown;
	errors?: Array<{ field?: unknown; message?: unknown }>;
}

/** Código HTTP do erro da API, ou null se não houve resposta (rede, timeout ou erro de código). */
export function getApiErrorStatus(error: unknown): number | null {
	if (isAxiosError(error)) {
		return error.response?.status ?? null;
	}
	return null;
}

/**
 * Mensagem amigável para exibir ao usuário: usa a mensagem da API quando houver
 * (e a primeira mensagem de campo em erros de validação), senão o texto padrão.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
	if (!isAxiosError<ApiErrorBody>(error)) {
		return fallback;
	}

	const body = error.response?.data;
	const fieldMessage = body?.errors?.find(
		(item) => typeof item.message === "string" && item.message.trim() !== "",
	)?.message;

	if (typeof fieldMessage === "string") {
		return fieldMessage;
	}

	if (typeof body?.message === "string" && body.message.trim() !== "") {
		return body.message;
	}

	return fallback;
}
