import { defineConfig, devices } from "@playwright/test";
import { resolveApiUrl } from "./e2e/helpers/env.ts";

// A API usada pelo E2E (sempre local). O build do preview embute esta URL (VITE_API_BASEURL).
// A leitura acontece antes do build, então uma URL remota falha logo, sem gastar tempo.
const apiUrl = resolveApiUrl();

// Porta liberada no CORS do backend por padrão (CORS_ORIGIN)
const appPort = 5173;
const baseURL = `http://localhost:${appPort}`;

const isCI = Boolean(process.env.CI);

export default defineConfig({
	testDir: "./e2e",
	globalSetup: "./e2e/global-setup.ts",
	// O fluxo cria dados no banco de testes; um teste por vez evita interferência
	fullyParallel: false,
	workers: 1,
	forbidOnly: isCI,
	// Tentativas extras só no CI, onde a máquina é mais lenta e variável
	retries: isCI ? 2 : 0,
	reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		// Build separado em dist-e2e para não sobrescrever o dist/ do desenvolvimento
		command: `npx vite build --outDir dist-e2e && npx vite preview --outDir dist-e2e --port ${appPort} --strictPort`,
		url: baseURL,
		// Nunca reaproveita um servidor já aberto: ele poderia apontar para outra API
		reuseExistingServer: false,
		timeout: 120_000,
		env: { VITE_API_BASEURL: apiUrl },
	},
});
