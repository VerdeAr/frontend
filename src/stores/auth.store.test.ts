import { beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "@/services/auth.service";
import { criarUsuario } from "@/test/fixtures";
import { useAuthStore } from "./auth.store";

vi.mock("@/services/auth.service", () => ({
	authService: {
		login: vi.fn(),
		register: vi.fn(),
		logout: vi.fn(),
		getProfile: vi.fn(),
	},
}));

const servico = vi.mocked(authService);

const estadoInicial = {
	user: null,
	isAuthenticated: false,
	isLoading: true,
};

beforeEach(() => {
	useAuthStore.setState(estadoInicial);
	vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("auth.store: login e cadastro", () => {
	it("login autentica o usuário e encerra o carregamento", async () => {
		const usuario = criarUsuario();
		servico.login.mockResolvedValue({ user: usuario });

		const resposta = await useAuthStore
			.getState()
			.login({ email: "maria@verdear.dev", password: "segredo" });

		const estado = useAuthStore.getState();
		expect(servico.login).toHaveBeenCalledWith({
			email: "maria@verdear.dev",
			password: "segredo",
		});
		expect(resposta.user).toEqual(usuario);
		expect(estado.user).toEqual(usuario);
		expect(estado.isAuthenticated).toBe(true);
		expect(estado.isLoading).toBe(false);
	});

	it("login com falha repassa o erro e continua deslogado", async () => {
		servico.login.mockRejectedValue(new Error("Credenciais inválidas."));

		await expect(
			useAuthStore.getState().login({ email: "a@a.com", password: "x" }),
		).rejects.toThrow("Credenciais inválidas.");

		const estado = useAuthStore.getState();
		expect(estado.user).toBeNull();
		expect(estado.isAuthenticated).toBe(false);
		expect(estado.isLoading).toBe(false);
	});

	it("cadastro autentica o usuário criado", async () => {
		const usuario = criarUsuario({ role: "VENDEDOR" });
		servico.register.mockResolvedValue({ user: usuario });

		await useAuthStore.getState().register({
			name: usuario.name,
			email: usuario.email,
			password: "segredo",
			cpf: "12345678901",
			role: "VENDEDOR",
		});

		expect(useAuthStore.getState().user?.role).toBe("VENDEDOR");
		expect(useAuthStore.getState().isAuthenticated).toBe(true);
	});

	it("cadastro com falha repassa o erro e encerra o carregamento", async () => {
		servico.register.mockRejectedValue(new Error("E-mail já está em uso."));

		await expect(
			useAuthStore.getState().register({
				name: "Maria",
				email: "maria@verdear.dev",
				password: "segredo",
				cpf: "12345678901",
				role: "CLIENTE",
			}),
		).rejects.toThrow("E-mail já está em uso.");

		expect(useAuthStore.getState().isLoading).toBe(false);
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});
});

describe("auth.store: logout", () => {
	it("limpa o usuário depois que a API encerra a sessão", async () => {
		useAuthStore.getState().setAuth(criarUsuario());
		servico.logout.mockResolvedValue();

		await useAuthStore.getState().logout();

		const estado = useAuthStore.getState();
		expect(servico.logout).toHaveBeenCalledTimes(1);
		expect(estado.user).toBeNull();
		expect(estado.isAuthenticated).toBe(false);
		expect(estado.isLoading).toBe(false);
	});

	it("se a API falhar, mantém a sessão e repassa o erro", async () => {
		const usuario = criarUsuario();
		useAuthStore.getState().setAuth(usuario);
		servico.logout.mockRejectedValue(new Error("Falha de rede"));

		await expect(useAuthStore.getState().logout()).rejects.toThrow(
			"Falha de rede",
		);

		expect(useAuthStore.getState().user).toEqual(usuario);
		expect(useAuthStore.getState().isAuthenticated).toBe(true);
		expect(useAuthStore.getState().isLoading).toBe(false);
	});
});

describe("auth.store: restauração da sessão pelo cookie", () => {
	it("checkAuth confirma a sessão consultando a API", async () => {
		const usuario = criarUsuario();
		servico.getProfile.mockResolvedValue(usuario);

		const resultado = await useAuthStore.getState().checkAuth();

		expect(resultado).toEqual(usuario);
		expect(useAuthStore.getState().isAuthenticated).toBe(true);
		expect(useAuthStore.getState().isLoading).toBe(false);
	});

	it("checkAuth limpa uma sessão antiga quando a API recusa (cookie expirado)", async () => {
		useAuthStore.getState().setAuth(criarUsuario());
		servico.getProfile.mockRejectedValue(new Error("401"));

		const resultado = await useAuthStore.getState().checkAuth();

		expect(resultado).toBeNull();
		expect(useAuthStore.getState().user).toBeNull();
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
		expect(useAuthStore.getState().isLoading).toBe(false);
	});

	it("fetchProfile atualiza o usuário e devolve null em caso de erro", async () => {
		const usuario = criarUsuario({ name: "Nome Atualizado" });
		servico.getProfile.mockResolvedValueOnce(usuario);

		await useAuthStore.getState().fetchProfile();
		expect(useAuthStore.getState().user?.name).toBe("Nome Atualizado");

		servico.getProfile.mockRejectedValueOnce(new Error("falha"));
		const falha = await useAuthStore.getState().fetchProfile();

		expect(falha).toBeNull();
		expect(useAuthStore.getState().user?.name).toBe("Nome Atualizado");
	});
});

describe("auth.store: persistência", () => {
	it("guarda apenas o usuário e o estado de autenticação, nunca um token", () => {
		useAuthStore.getState().setAuth(criarUsuario());

		const bruto = localStorage.getItem("@verdear/auth");
		expect(bruto).not.toBeNull();

		const salvo = JSON.parse(bruto ?? "{}");
		expect(Object.keys(salvo.state).sort()).toEqual([
			"isAuthenticated",
			"user",
		]);
		expect(bruto).not.toMatch(/token/i);
	});
});
