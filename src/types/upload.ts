export interface PresignedUrlRequest {
	filename: string;
	contentType: string;
	size: number;
}

export interface PresignedUrlResponse {
	uploadUrl: string;
	fileUrl: string;
}

export type UploadProgressCallback = (percentage: number) => void;
