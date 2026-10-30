import { resolveApiUrl } from "./helpers/env.ts";

// Roda uma vez antes dos testes: confere que a API local está de pé e conectada ao banco
export default async function globalSetup() {
	const apiUrl = resolveApiUrl();

	let response: Response;
	try {
		response = await fetch(`${apiUrl}/ready`);
	} catch {
		throw new Error(
			`A API não respondeu em ${apiUrl}. Suba o banco de testes e a API antes do E2E (veja o README).`,
		);
	}

	if (!response.ok) {
		throw new Error(
			`A API em ${apiUrl} respondeu ${response.status} em /ready. Confira a conexão com o banco de testes.`,
		);
	}
}
