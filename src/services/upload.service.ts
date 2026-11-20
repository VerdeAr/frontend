import axios from "axios";
import { api } from "@/lib/api";
import type {
	PresignedUrlRequest,
	PresignedUrlResponse,
	UploadProgressCallback,
} from "@/types/upload";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

interface RawPresignedResponse {
	uploadUrl?: string;
	upload_url?: string;
	url?: string;
	publicUrl?: string;
	public_url?: string;
	fileUrl?: string;
	file_url?: string;
}

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
	 * Solicita à API protegida do backend uma presigned URL temporária para upload.
	 */
	async getPresignedUrl(
		filename: string,
		contentType: string,
	): Promise<PresignedUrlResponse> {
		const payload: PresignedUrlRequest & {
			file_name: string;
			content_type: string;
		} = {
			filename,
			contentType,
			file_name: filename,
			content_type: contentType,
		};

		const response = await api.post<RawPresignedResponse>(
			"/upload/presigned-url",
			payload,
		);

		const data = response.data;
		const uploadUrl = data.uploadUrl || data.upload_url || data.url;
		const publicUrl =
			data.publicUrl || data.public_url || data.fileUrl || data.file_url;

		if (!uploadUrl || !publicUrl) {
			throw new Error("Resposta inválida do serviço de upload.");
		}

		return {
			uploadUrl,
			publicUrl,
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
	 * Retorna a URL pública final da imagem.
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
		const { uploadUrl, publicUrl } = await this.getPresignedUrl(
			file.name,
			file.type,
		);

		onProgress?.(20);
		await this.uploadBinary(uploadUrl, file, (percent) => {
			// Mapeia o progresso do upload binário (20% a 100%)
			const mappedProgress = Math.round(20 + (percent * 80) / 100);
			onProgress?.(mappedProgress);
		});

		onProgress?.(100);
		return publicUrl;
	},
};
