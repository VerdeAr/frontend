const DEFAULT_API_URL = "http://localhost:3000";

// O E2E cria cadastros, produtos e pedidos. Por isso só roda contra uma API na própria máquina,
// que deve estar ligada a um banco de testes. Nunca contra homologação ou produção.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

/** Lê `E2E_API_URL` (padrão `http://localhost:3000`) e recusa qualquer endereço que não seja local. */
export function resolveApiUrl(): string {
	const raw = process.env.E2E_API_URL?.trim() || DEFAULT_API_URL;

	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		throw new Error(`E2E_API_URL inválida: "${raw}".`);
	}

	if (!LOCAL_HOSTS.has(url.hostname)) {
		throw new Error(
			`E2E_API_URL aponta para "${url.hostname}". O E2E só roda contra uma API local ligada ` +
				"a um banco de testes (localhost ou 127.0.0.1), nunca contra a homologação.",
		);
	}

	return raw.replace(/\/+$/, "");
}
