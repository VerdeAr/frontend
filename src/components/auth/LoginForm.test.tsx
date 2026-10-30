import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores";
import { criarUsuario } from "@/test/fixtures";
import { LoginForm } from "./LoginForm";

vi.mock("@/services/auth.service", () => ({
	authService: {
		login: vi.fn(),
		register: vi.fn(),
		logout: vi.fn(),
		getProfile: vi.fn(),
	},
}));

const servico = vi.mocked(authService);

function renderizar(onSuccess?: () => void) {
	return render(
		<MemoryRouter initialEntries={["/login"]}>
			<Routes>
				<Route path="/login" element={<LoginForm onSuccess={onSuccess} />} />
				<Route path="/" element={<p>Página inicial</p>} />
				<Route path="/cadastro" element={<p>Página de cadastro</p>} />
			</Routes>
		</MemoryRouter>,
	);
}

const campoEmail = () => screen.getByLabelText(/E-mail/);
const campoSenha = () => screen.getByLabelText(/Senha/);
const botaoEntrar = () =>
	screen.getByRole("button", { name: "Entrar na conta" });

beforeEach(() => {
	useAuthStore.setState({
		user: null,
		isAuthenticated: false,
		isLoading: false,
	});
});

describe("LoginForm: validação", () => {
	it("exige e-mail e senha e não chama a API", async () => {
		const usuario = userEvent.setup();
		renderizar();

		await usuario.click(botaoEntrar());

		expect(await screen.findByText("E-mail é obrigatório")).toBeInTheDocument();
		expect(screen.getByText("Senha é obrigatória")).toBeInTheDocument();
		expect(servico.login).not.toHaveBeenCalled();
	});

	it("recusa e-mail em formato inválido", async () => {
		const usuario = userEvent.setup();
		renderizar();

		await usuario.type(campoEmail(), "isso-nao-e-email");
		await usuario.type(campoSenha(), "segredo");
		await usuario.click(botaoEntrar());

		expect(
			await screen.findByText("Insira um endereço de e-mail válido"),
		).toBeInTheDocument();
		expect(servico.login).not.toHaveBeenCalled();
	});

	it("recusa senha com menos de 6 caracteres", async () => {
		const usuario = userEvent.setup();
		renderizar();

		await usuario.type(campoEmail(), "maria@verdear.dev");
		await usuario.type(campoSenha(), "12345");
		await usuario.click(botaoEntrar());

		expect(
			await screen.findByText("A senha deve ter pelo menos 6 caracteres"),
		).toBeInTheDocument();
		expect(servico.login).not.toHaveBeenCalled();
	});
});

describe("LoginForm: envio", () => {
	it("faz login com os dados digitados e vai para a página inicial", async () => {
		const usuario = userEvent.setup();
		servico.login.mockResolvedValue({ user: criarUsuario() });
		renderizar();

		await usuario.type(campoEmail(), "maria@verdear.dev");
		await usuario.type(campoSenha(), "segredo");
		await usuario.click(botaoEntrar());

		expect(await screen.findByText("Página inicial")).toBeInTheDocument();
		expect(servico.login).toHaveBeenCalledWith({
			email: "maria@verdear.dev",
			password: "segredo",
		});
		expect(useAuthStore.getState().isAuthenticated).toBe(true);
	});

	it("chama onSuccess em vez de navegar quando ele é informado", async () => {
		const usuario = userEvent.setup();
		const onSuccess = vi.fn();
		servico.login.mockResolvedValue({ user: criarUsuario() });
		renderizar(onSuccess);

		await usuario.type(campoEmail(), "maria@verdear.dev");
		await usuario.type(campoSenha(), "segredo");
		await usuario.click(botaoEntrar());

		await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
		expect(screen.queryByText("Página inicial")).not.toBeInTheDocument();
	});

	it("mostra a mensagem de erro devolvida pela API", async () => {
		const usuario = userEvent.setup();
		servico.login.mockRejectedValue({
			response: { data: { message: "Credenciais inválidas." } },
		});
		renderizar();

		await usuario.type(campoEmail(), "maria@verdear.dev");
		await usuario.type(campoSenha(), "senha-errada");
		await usuario.click(botaoEntrar());

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Credenciais inválidas.",
		);
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});

	it("usa uma mensagem padrão quando a API não explica o erro", async () => {
		const usuario = userEvent.setup();
		servico.login.mockRejectedValue(new Error("Network Error"));
		renderizar();

		await usuario.type(campoEmail(), "maria@verdear.dev");
		await usuario.type(campoSenha(), "segredo");
		await usuario.click(botaoEntrar());

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Não foi possível realizar o login. Verifique suas credenciais.",
		);
	});
});

describe("LoginForm: interface", () => {
	it("alterna a visibilidade da senha", async () => {
		const usuario = userEvent.setup();
		renderizar();

		expect(campoSenha()).toHaveAttribute("type", "password");

		await usuario.click(screen.getByRole("button", { name: "Exibir senha" }));
		expect(campoSenha()).toHaveAttribute("type", "text");

		await usuario.click(screen.getByRole("button", { name: "Ocultar senha" }));
		expect(campoSenha()).toHaveAttribute("type", "password");
	});

	it("leva ao cadastro pelo link", async () => {
		const usuario = userEvent.setup();
		renderizar();

		await usuario.click(screen.getByRole("link", { name: "Cadastre-se" }));

		expect(await screen.findByText("Página de cadastro")).toBeInTheDocument();
	});
});
