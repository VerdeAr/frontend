import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatMessageInput } from "./ChatMessageInput";

describe("ChatMessageInput", () => {
	beforeEach(() => {
		Element.prototype.scrollIntoView = vi.fn();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("renderiza o campo de mensagem e o botão de envio", () => {
		render(<ChatMessageInput onSend={vi.fn()} />);

		expect(
			screen.getByPlaceholderText("Digite sua mensagem"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Enviar mensagem" }),
		).toBeInTheDocument();
	});

	it("desabilita o campo e exibe o motivo quando disabled for true", () => {
		render(
			<ChatMessageInput
				onSend={vi.fn()}
				disabled
				disabledReason="Conversa finalizada."
			/>,
		);

		const textarea = screen.getByPlaceholderText("Envio indisponível");
		expect(textarea).toBeDisabled();
		expect(
			screen.getByRole("button", { name: "Enviar mensagem" }),
		).toBeDisabled();
		expect(screen.getByText("Conversa finalizada.")).toBeInTheDocument();
	});

	it("aciona scrollIntoView ao receber foco", () => {
		vi.useFakeTimers();
		render(<ChatMessageInput onSend={vi.fn()} />);

		const textarea = screen.getByPlaceholderText("Digite sua mensagem");
		fireEvent.focus(textarea);

		vi.advanceTimersByTime(450);
		expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
			block: "end",
			behavior: "smooth",
		});
		vi.useRealTimers();
	});

	it("envia mensagem e limpa o campo com sucesso", async () => {
		const onSendMock = vi.fn().mockResolvedValue(undefined);
		const user = userEvent.setup();

		render(<ChatMessageInput onSend={onSendMock} />);

		const textarea = screen.getByPlaceholderText("Digite sua mensagem");
		await user.type(textarea, "Olá, tudo bem?");
		expect(textarea).toHaveValue("Olá, tudo bem?");

		const submitButton = screen.getByRole("button", {
			name: "Enviar mensagem",
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(onSendMock).toHaveBeenCalledWith("Olá, tudo bem?");
		});

		await waitFor(() => {
			expect(textarea).toHaveValue("");
		});
	});

	it("envia mensagem ao pressionar Enter", async () => {
		const onSendMock = vi.fn().mockResolvedValue(undefined);
		const user = userEvent.setup();

		render(<ChatMessageInput onSend={onSendMock} />);

		const textarea = screen.getByPlaceholderText("Digite sua mensagem");
		await user.type(textarea, "Mensagem via Enter{Enter}");

		await waitFor(() => {
			expect(onSendMock).toHaveBeenCalledWith("Mensagem via Enter");
		});
	});

	it("notifica digitação e para após inatividade", () => {
		vi.useFakeTimers();
		const onTypingChange = vi.fn();

		render(
			<ChatMessageInput onSend={vi.fn()} onTypingChange={onTypingChange} />,
		);

		const textarea = screen.getByPlaceholderText("Digite sua mensagem");
		fireEvent.change(textarea, { target: { value: "Oi" } });

		expect(onTypingChange).toHaveBeenCalledWith(true);

		// Avança além do tempo de inatividade (2000ms)
		vi.advanceTimersByTime(2500);

		expect(onTypingChange).toHaveBeenCalledWith(false);
		vi.useRealTimers();
	});

	it("exibe mensagem de erro quando onSend falha e mantém o texto", async () => {
		const onSendMock = vi.fn().mockRejectedValue(new Error("Falha na conexão"));
		const user = userEvent.setup();

		render(<ChatMessageInput onSend={onSendMock} />);

		const textarea = screen.getByPlaceholderText("Digite sua mensagem");
		await user.type(textarea, "Tentativa de envio");

		const submitButton = screen.getByRole("button", {
			name: "Enviar mensagem",
		});
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent("Falha na conexão");
		});

		expect(textarea).toHaveValue("Tentativa de envio");
	});
});
