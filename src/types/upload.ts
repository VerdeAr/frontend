export interface PresignedUrlRequest {
	filename: string;
	contentType: string;
}

export interface PresignedUrlResponse {
	uploadUrl: string;
	publicUrl: string;
}

export type UploadProgressCallback = (percentage: number) => void;
