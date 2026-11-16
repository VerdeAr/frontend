import { isRouteErrorResponse } from "react-router";
import { getApiErrorStatus } from "./api-error";

/** Categoria do erro capturado pelo `errorElement`, usada para escolher texto e ações. */
export type RouteErrorKind =
	| "not-found"
	| "unauthorized"
	| "forbidden"
	| "server"
	| "unknown";

export interface RouteErrorContent {
	kind: RouteErrorKind;
	/** Código HTTP, quando o erro trouxer um. */
	status: number | null;
	title: string;
	message: string;
}

const CONTENT_BY_KIND: Record<
	RouteErrorKind,
	Pick<RouteErrorContent, "title" | "message">
> = {
	"not-found": {
		title: "Página não encontrada",
		message:
			"O endereço acessado não foi encontrado ou não está mais disponível na nossa feira virtual.",
	},
	unauthorized: {
		title: "Sua sessão expirou",
		message: "Entre na sua conta novamente para continuar.",
	},
	forbidden: {
		title: "Acesso não permitido",
		message: "Sua conta não tem permissão para acessar esta página.",
	},
	server: {
		title: "Serviço indisponível",
		message:
			"Não conseguimos falar com o servidor agora. Tente novamente em alguns instantes.",
	},
	unknown: {
		title: "Ops! Algo deu errado",
		message:
			"Ocorreu um erro inesperado ao carregar esta página. Tente novamente.",
	},
};

/** Código HTTP de uma resposta lançada pelo roteador ou de um erro do Axios. */
function getErrorStatus(error: unknown): number | null {
	if (isRouteErrorResponse(error)) {
		return error.status;
	}
	return getApiErrorStatus(error);
}

function getKindFromStatus(status: number | null): RouteErrorKind {
	if (status === 404) return "not-found";
	if (status === 401) return "unauthorized";
	if (status === 403) return "forbidden";
	if (status !== null && status >= 500) return "server";
	return "unknown";
}

/**
 * Converte o erro capturado pelo `errorElement` em título e mensagem amigáveis.
 * Nunca repassa o texto técnico do erro original ao usuário.
 */
export function getRouteErrorContent(error: unknown): RouteErrorContent {
	const status = getErrorStatus(error);
	const kind = getKindFromStatus(status);
	return { kind, status, ...CONTENT_BY_KIND[kind] };
}
