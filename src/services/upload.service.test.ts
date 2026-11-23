import type { AxiosProgressEvent } from "axios";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import {
	ALLOWED_IMAGE_TYPES,
	MAX_IMAGE_SIZE_BYTES,
	uploadService,
} from "@/services/upload.service";

vi.mock("@/lib/api", () => ({
	api: {
		post: vi.fn(),
	},
}));

vi.mock("axios", () => {
	const mockAxios = {
		put: vi.fn(),
		create: vi.fn(() => mockAxios),
		interceptors: {
			request: { use: vi.fn() },
			response: { use: vi.fn() },
		},
	};
	return {
		default: mockAxios,
		...mockAxios,
	};
});

describe("uploadService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("validateImage", () => {
		it("aceita arquivos JPG, PNG e WebP com menos de 5MB", () => {
			for (const type of ALLOWED_IMAGE_TYPES) {
				const file = new File(["dummy content"], "test.jpg", { type });
				const result = uploadService.validateImage(file);
				expect(result.valid).toBe(true);
				expect(result.error).toBeUndefined();
			}
		});

		it("rejeita arquivo com tamanho superior a 5MB", () => {
			const largeBlob = new Array(MAX_IMAGE_SIZE_BYTES + 10).fill("a").join("");
			const file = new File([largeBlob], "large.png", { type: "image/png" });
			const result = uploadService.validateImage(file);
			expect(result.valid).toBe(false);
			expect(result.error).toBe("A imagem deve ter no máximo 5MB.");
		});

		it("rejeita formatos não suportados", () => {
			const file = new File(["dummy"], "doc.pdf", { type: "application/pdf" });
			const result = uploadService.validateImage(file);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("Formato não suportado");
		});
	});

	describe("getPresignedUrl", () => {
		it("requisita presigned URL com filename, contentType e size (contrato VER-87)", async () => {
			vi.mocked(api.post).mockResolvedValueOnce({
				data: {
					uploadUrl:
						"https://r2.cloudflarestorage.com/bucket/alface.webp?sig=123",
					fileUrl: "https://cdn.verdear.com.br/alface.webp",
				},
			});

			const response = await uploadService.getPresignedUrl(
				"alface.webp",
				"image/webp",
				2048,
			);

			expect(api.post).toHaveBeenCalledWith("/upload/presigned-url", {
				filename: "alface.webp",
				contentType: "image/webp",
				size: 2048,
			});
			expect(response.uploadUrl).toBe(
				"https://r2.cloudflarestorage.com/bucket/alface.webp?sig=123",
			);
			expect(response.fileUrl).toBe("https://cdn.verdear.com.br/alface.webp");
		});

		it("dispara erro se a resposta não contiver uploadUrl ou fileUrl", async () => {
			vi.mocked(api.post).mockResolvedValueOnce({
				data: {},
			});

			await expect(
				uploadService.getPresignedUrl("cenoura.png", "image/png", 1024),
			).rejects.toThrow("Resposta inválida do serviço de upload.");
		});
	});

	describe("uploadBinary", () => {
		it("envia o arquivo via axios.put com o Content-Type correto e calcula progresso", async () => {
			let progressCallback: ((e: AxiosProgressEvent) => void) | undefined;

			vi.mocked(axios.put).mockImplementationOnce((_url, _data, config) => {
				progressCallback = config?.onUploadProgress;
				return Promise.resolve({ status: 200 });
			});

			const file = new File(["dummy-data"], "foto.jpg", { type: "image/jpeg" });
			const onProgress = vi.fn();

			const uploadPromise = uploadService.uploadBinary(
				"https://r2.upload.url",
				file,
				onProgress,
			);

			if (progressCallback) {
				progressCallback({
					loaded: 50,
					total: 100,
					bytes: 50,
					lengthComputable: true,
				} as AxiosProgressEvent);
			}

			await uploadPromise;

			expect(axios.put).toHaveBeenCalledWith(
				"https://r2.upload.url",
				file,
				expect.objectContaining({
					headers: { "Content-Type": "image/jpeg" },
				}),
			);
			expect(onProgress).toHaveBeenCalledWith(50);
		});
	});

	describe("uploadImage", () => {
		it("executa o fluxo completo com sucesso e retorna a fileUrl", async () => {
			vi.mocked(api.post).mockResolvedValueOnce({
				data: {
					uploadUrl: "https://r2.upload.url",
					fileUrl: "https://cdn.verdear.com.br/produto.jpg",
				},
			});

			vi.mocked(axios.put).mockResolvedValueOnce({ status: 200 });

			const file = new File(["image-bytes"], "produto.jpg", {
				type: "image/jpeg",
			});
			const progressUpdates: number[] = [];

			const resultUrl = await uploadService.uploadImage(file, (p) => {
				progressUpdates.push(p);
			});

			expect(api.post).toHaveBeenCalledWith("/upload/presigned-url", {
				filename: "produto.jpg",
				contentType: "image/jpeg",
				size: file.size,
			});
			expect(resultUrl).toBe("https://cdn.verdear.com.br/produto.jpg");
			expect(progressUpdates).toContain(100);
		});

		it("falha imediatamente se o arquivo for inválido sem chamar a API", async () => {
			const file = new File(["bad-data"], "doc.txt", { type: "text/plain" });

			await expect(uploadService.uploadImage(file)).rejects.toThrow(
				"Formato não suportado",
			);
			expect(api.post).not.toHaveBeenCalled();
			expect(axios.put).not.toHaveBeenCalled();
		});
	});
});
