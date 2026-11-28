import axios from "axios";
import { api } from "@/lib/api";
import type {
	PresignedUrlRequest,
	PresignedUrlResponse,
	UploadProgressCallback,
} from "@/types/upload";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const uploadService = {
	/**
	 * Valida o arquivo de imagem quanto ao tamanho (máximo 5MB) e formato permitido.
	 */
	validateImage(file: File): { valid: boolean; error?: string } {
		if (file.size > MAX_IMAGE_SIZE_BYTES) {
			return {
				valid: false,
				error: "A imagem deve ter no máximo 5MB.",
			};
		}

		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			return {
				valid: false,
				error: "Formato não suportado. Utilize imagens JPG, PNG ou WebP.",
			};
		}

		return { valid: true };
	},

	/**
	 * Solicita à API protegida do backend uma presigned URL temporária para upload (contrato VER-87).
	 */
	async getPresignedUrl(
		filename: string,
		contentType: string,
		size: number,
	): Promise<PresignedUrlResponse> {
		const payload: PresignedUrlRequest = {
			filename,
			contentType,
			size,
		};

		const response = await api.post<PresignedUrlResponse>(
			"/upload/presigned-url",
			payload,
		);

		const data = response.data;
		if (!data?.uploadUrl || !data?.fileUrl) {
			throw new Error("Resposta inválida do serviço de upload.");
		}

		return {
			uploadUrl: data.uploadUrl,
			fileUrl: data.fileUrl,
		};
	},

	/**
	 * Realiza o upload binário direto para a Cloudflare R2 via Axios PUT.
	 * Utiliza a instância pura do Axios para não anexar credenciais ou headers da API local.
	 */
	async uploadBinary(
		uploadUrl: string,
		file: File,
		onProgress?: UploadProgressCallback,
	): Promise<void> {
		await axios.put(uploadUrl, file, {
			headers: {
				"Content-Type": file.type,
			},
			onUploadProgress: (progressEvent) => {
				if (progressEvent.total && onProgress) {
					const percentage = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total,
					);
					onProgress(percentage);
				}
			},
		});
	},

	/**
	 * Pipeline completo: valida o arquivo, obtém a presigned URL e envia o binário diretamente ao R2.
	 * Retorna a URL final da imagem (fileUrl).
	 */
	async uploadImage(
		file: File,
		onProgress?: UploadProgressCallback,
	): Promise<string> {
		const validation = this.validateImage(file);
		if (!validation.valid) {
			throw new Error(validation.error || "Arquivo de imagem inválido.");
		}

		onProgress?.(5);
		const { uploadUrl, fileUrl } = await this.getPresignedUrl(
			file.name,
			file.type,
			file.size,
		);

		onProgress?.(20);
		await this.uploadBinary(uploadUrl, file, (percent) => {
			// Mapeia o progresso do upload binário (20% a 100%)
			const mappedProgress = Math.round(20 + (percent * 80) / 100);
			onProgress?.(mappedProgress);
		});

		onProgress?.(100);
		return fileUrl;
	},
};
