import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import { uploadService } from "@/services/upload.service";

vi.mock("@/services/upload.service", () => ({
	uploadService: {
		validateImage: vi.fn(),
		uploadImage: vi.fn(),
	},
}));

describe("ImageUploadDropzone", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(uploadService.validateImage).mockReturnValue({ valid: true });
		window.URL.createObjectURL = vi.fn(
			() => "blob:http://localhost/test-preview",
		);
		window.URL.revokeObjectURL = vi.fn();
	});

	it("renderiza o estado vazio inicial com textos explicativos", () => {
		render(<ImageUploadDropzone />);

		expect(screen.getByText(/Arraste uma foto aqui ou/i)).toBeInTheDocument();
		expect(screen.getByText(/clique para escolher/i)).toBeInTheDocument();
		expect(
			screen.getByText(/Formatos aceitos: JPG, PNG ou WebP até 5MB/i),
		).toBeInTheDocument();
	});

	it("renderiza prévia quando uma URL é passada via prop value", () => {
		render(
			<ImageUploadDropzone value="https://cdn.verdear.com.br/fotos/alface.jpg" />,
		);

		const img = screen.getByRole("img", {
			name: /Prévia da imagem do produto/i,
		});
		expect(img).toHaveAttribute(
			"src",
			"https://cdn.verdear.com.br/fotos/alface.jpg",
		);
		expect(
			screen.getByRole("button", { name: /Trocar imagem/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Remover imagem/i }),
		).toBeInTheDocument();
	});

	it("chama onChange com string vazia ao clicar em Remover", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(
			<ImageUploadDropzone
				value="https://cdn.verdear.com.br/fotos/tomate.jpg"
				onChange={handleChange}
			/>,
		);

		const removeBtn = screen.getByRole("button", { name: /Remover imagem/i });
		await user.click(removeBtn);

		expect(handleChange).toHaveBeenCalledWith("");
	});

	it("exibe mensagem de erro quando o arquivo for maior que 5MB", async () => {
		vi.mocked(uploadService.validateImage).mockReturnValueOnce({
			valid: false,
			error: "A imagem deve ter no máximo 5MB.",
		});

		const handleError = vi.fn();
		render(<ImageUploadDropzone onError={handleError} />);

		const fileInput = screen.getByTestId("image-upload-input");
		const file = new File(["dummy content"], "large.png", {
			type: "image/png",
		});

		fireEvent.change(fileInput, { target: { files: [file] } });

		expect(
			await screen.findByText("A imagem deve ter no máximo 5MB."),
		).toBeInTheDocument();
		expect(handleError).toHaveBeenCalledWith(
			"A imagem deve ter no máximo 5MB.",
		);
		expect(uploadService.uploadImage).not.toHaveBeenCalled();
	});

	it("mostra prévia imediata e barra de progresso com acessibilidade durante o envio", async () => {
		let resolveUpload: (url: string) => void = () => {};
		const uploadPromise = new Promise<string>((resolve) => {
			resolveUpload = resolve;
		});

		vi.mocked(uploadService.uploadImage).mockImplementationOnce(
			async (_file, onProgress) => {
				onProgress?.(45);
				return uploadPromise;
			},
		);

		render(<ImageUploadDropzone />);

		const fileInput = screen.getByTestId("image-upload-input");
		const file = new File(["cenoura"], "cenoura.webp", { type: "image/webp" });

		fireEvent.change(fileInput, { target: { files: [file] } });

		// A imagem de prévia local deve estar presente na tela durante o envio
		const previewImg = screen.getByRole("img", {
			name: /Prévia da imagem do produto/i,
		});
		expect(previewImg).toHaveAttribute(
			"src",
			"blob:http://localhost/test-preview",
		);

		// Barra de progresso acessível sobreposta à foto
		const progressBar = screen.getByRole("progressbar");
		expect(progressBar).toHaveAttribute("aria-valuenow", "45");
		expect(screen.getByText("Enviando foto...")).toBeInTheDocument();
		expect(screen.getByText("45%")).toBeInTheDocument();

		resolveUpload("https://cdn.verdear.com.br/produtos/cenoura.webp");
		await waitFor(() => {
			expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
		});
	});

	it("trata erro caso o envio para a Cloudflare R2 falhe", async () => {
		vi.mocked(uploadService.uploadImage).mockRejectedValueOnce(
			new Error("Falha na conexão com o servidor de armazenamento."),
		);

		const handleError = vi.fn();
		render(<ImageUploadDropzone onError={handleError} />);

		const fileInput = screen.getByTestId("image-upload-input");
		const file = new File(["rucula"], "rucula.png", { type: "image/png" });

		fireEvent.change(fileInput, { target: { files: [file] } });

		expect(
			await screen.findByText(
				"Falha na conexão com o servidor de armazenamento.",
			),
		).toBeInTheDocument();
		expect(handleError).toHaveBeenCalledWith(
			"Falha na conexão com o servidor de armazenamento.",
		);
	});

	it("exibe mensagem amigável quando ocorre erro ao carregar a imagem na tag img", () => {
		render(
			<ImageUploadDropzone value="https://cdn.verdear.com.br/fotos/inexistente.jpg" />,
		);

		const img = screen.getByRole("img", {
			name: /Prévia da imagem do produto/i,
		});

		fireEvent.error(img);

		expect(
			screen.getByText("Não foi possível carregar a imagem vinculada."),
		).toBeInTheDocument();
	});

	it("suporta drop de arquivo na área de dropzone", async () => {
		vi.mocked(uploadService.uploadImage).mockResolvedValueOnce(
			"https://cdn.verdear.com.br/morango.png",
		);

		const handleChange = vi.fn();
		render(<ImageUploadDropzone onChange={handleChange} />);

		const dropzone = screen.getByRole("button", {
			name: /Área para envio da foto/i,
		});
		const file = new File(["morango"], "morango.png", { type: "image/png" });

		fireEvent.dragOver(dropzone);
		fireEvent.drop(dropzone, {
			dataTransfer: {
				files: [file],
			},
		});

		await waitFor(() => {
			expect(uploadService.uploadImage).toHaveBeenCalledWith(
				file,
				expect.any(Function),
			);
			expect(handleChange).toHaveBeenCalledWith(
				"https://cdn.verdear.com.br/morango.png",
			);
		});
	});
});
