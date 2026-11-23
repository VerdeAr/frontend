import {
	AlertCircle,
	ImagePlus,
	Loader2,
	RefreshCw,
	Trash2,
	UploadCloud,
} from "lucide-react";
import * as React from "react";
import { FormField } from "@/components/ui/form-input";
import { cn } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";

export interface ImageUploadDropzoneProps {
	id?: string;
	label?: string;
	error?: string;
	helperText?: string;
	required?: boolean;
	value?: string | null;
	onChange?: (url: string) => void;
	onUploadStart?: () => void;
	onUploadEnd?: (url: string) => void;
	onError?: (errorMessage: string) => void;
	disabled?: boolean;
	className?: string;
}

export function ImageUploadDropzone({
	id,
	label = "Foto do Alimento",
	error,
	helperText = "Envie uma foto real do produto para atrair mais compradores (PNG, JPG ou WebP até 5MB).",
	required,
	value,
	onChange,
	onUploadStart,
	onUploadEnd,
	onError,
	disabled = false,
	className,
}: ImageUploadDropzoneProps) {
	const generatedId = React.useId();
	const dropzoneId = id || generatedId;

	const fileInputRef = React.useRef<HTMLInputElement | null>(null);
	const [isDragging, setIsDragging] = React.useState(false);
	const [isUploading, setIsUploading] = React.useState(false);
	const [uploadProgress, setUploadProgress] = React.useState(0);
	const [internalError, setInternalError] = React.useState<string | null>(null);
	const [imageLoadError, setImageLoadError] = React.useState(false);
	const [localPreviewUrl, setLocalPreviewUrl] = React.useState<string | null>(
		null,
	);

	// Limpa URL temporária do navegador para evitar vazamento de memória
	React.useEffect(() => {
		return () => {
			if (localPreviewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(localPreviewUrl);
			}
		};
	}, [localPreviewUrl]);

	// Reseta erro de carregamento caso o valor mude externamente
	React.useEffect(() => {
		if (value) {
			setImageLoadError(false);
		}
	}, [value]);

	const currentImageUrl = localPreviewUrl || value;

	const handleFileSelection = async (file: File) => {
		setInternalError(null);
		setImageLoadError(false);

		const validation = uploadService.validateImage(file);
		if (!validation.valid) {
			const msg = validation.error || "Arquivo de imagem inválido.";
			setInternalError(msg);
			onError?.(msg);
			return;
		}

		// Preview instantâneo antes de enviar o binário
		const objectUrl = URL.createObjectURL(file);
		setLocalPreviewUrl(objectUrl);
		setIsUploading(true);
		setUploadProgress(0);
		onUploadStart?.();

		try {
			const fileUrl = await uploadService.uploadImage(file, (progress) => {
				setUploadProgress(progress);
			});

			onChange?.(fileUrl);
			onUploadEnd?.(fileUrl);
			setInternalError(null);
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: "Não foi possível enviar a imagem. Tente novamente.";
			setInternalError(msg);
			onError?.(msg);
			setLocalPreviewUrl(null);
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			handleFileSelection(files[0]);
		}
	};

	const onDragOver = (e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (!disabled && !isUploading) {
			setIsDragging(true);
		}
	};

	const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const onDrop = (e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		if (disabled || isUploading) return;

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			handleFileSelection(files[0]);
		}
	};

	const triggerSelectFile = () => {
		if (!disabled && !isUploading) {
			fileInputRef.current?.click();
		}
	};

	const handleRemoveImage = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (localPreviewUrl?.startsWith("blob:")) {
			URL.revokeObjectURL(localPreviewUrl);
		}
		setLocalPreviewUrl(null);
		setImageLoadError(false);
		setInternalError(null);
		onChange?.("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const displayError = error || internalError;

	return (
		<FormField
			id={dropzoneId}
			label={label}
			required={required}
			error={displayError || undefined}
			helperText={helperText}
			className={className}
		>
			<input
				ref={fileInputRef}
				id={dropzoneId}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				className="sr-only"
				disabled={disabled || isUploading}
				onChange={onInputChange}
				data-testid="image-upload-input"
			/>

			{/* Imagem Presente (Durante Upload com Barra Sobreposta ou Já Carregada) */}
			{currentImageUrl ? (
				<div className="relative group overflow-hidden rounded-2xl border border-border/80 bg-muted/20 p-2 transition-all">
					<div className="relative h-44 sm:h-52 w-full overflow-hidden rounded-xl bg-muted/40">
						{imageLoadError ? (
							<div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center bg-destructive/10 text-destructive">
								<AlertCircle className="size-6 shrink-0" />
								<span className="text-xs font-medium">
									Não foi possível carregar a imagem vinculada.
								</span>
							</div>
						) : (
							<img
								src={currentImageUrl}
								alt="Prévia da imagem do produto"
								className={cn(
									"h-full w-full object-cover transition-transform duration-300",
									!isUploading && "group-hover:scale-105",
									isUploading && "brightness-60",
								)}
								onError={() => setImageLoadError(true)}
							/>
						)}

						{/* Overlay de Progresso durante Upload */}
						{isUploading && (
							<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs p-4 text-white">
								<Loader2 className="size-6 animate-spin text-emerald-400 mb-2" />
								<div className="w-full max-w-xs space-y-1.5">
									<div className="flex justify-between text-xs font-semibold text-white">
										<span>Enviando foto...</span>
										<span>{uploadProgress}%</span>
									</div>
									<div
										role="progressbar"
										aria-valuenow={uploadProgress}
										aria-valuemin={0}
										aria-valuemax={100}
										aria-label="Progresso do envio da imagem"
										className="h-2 w-full overflow-hidden rounded-full bg-white/30"
									>
										<div
											className="h-full bg-emerald-500 transition-all duration-200"
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
								</div>
								<span className="text-[11px] text-white/80 mt-1">
									Enviando com segurança para a nuvem
								</span>
							</div>
						)}
					</div>

					<div className="mt-2.5 flex items-center justify-between gap-2 px-1">
						<span className="truncate text-xs font-medium text-muted-foreground">
							{isUploading ? "Enviando arquivo..." : "Foto vinculada"}
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={triggerSelectFile}
								disabled={disabled || isUploading}
								className="flex h-11 items-center gap-1.5 rounded-xl border border-border/80 bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
								aria-label="Trocar imagem"
							>
								<RefreshCw className="size-3.5" />
								<span>Trocar</span>
							</button>

							<button
								type="button"
								onClick={handleRemoveImage}
								disabled={disabled || isUploading}
								className="flex h-11 items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-50"
								aria-label="Remover imagem"
							>
								<Trash2 className="size-3.5" />
								<span>Remover</span>
							</button>
						</div>
					</div>
				</div>
			) : (
				/* Dropzone Vazio */
				<button
					type="button"
					tabIndex={disabled ? -1 : 0}
					onClick={triggerSelectFile}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							triggerSelectFile();
						}
					}}
					onDragOver={onDragOver}
					onDragEnter={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={onDrop}
					className={cn(
						"relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer select-none",
						"min-h-[160px] sm:min-h-[180px]",
						isDragging
							? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-4 ring-emerald-500/10"
							: "border-border/80 bg-muted/10 hover:border-emerald-500/60 hover:bg-muted/20",
						disabled && "cursor-not-allowed opacity-75",
						displayError && "border-destructive/50 bg-destructive/5",
					)}
					aria-label="Área para envio da foto: arraste uma imagem aqui ou clique para escolher (JPG, PNG ou WebP até 5MB)"
				>
					<div className="flex flex-col items-center gap-2.5">
						<div
							className={cn(
								"flex size-12 items-center justify-center rounded-2xl transition-colors",
								isDragging
									? "bg-emerald-500/20 text-emerald-600"
									: "bg-muted text-muted-foreground group-hover:text-foreground",
							)}
						>
							{isDragging ? (
								<UploadCloud className="size-6 animate-bounce" />
							) : (
								<ImagePlus className="size-6" />
							)}
						</div>
						<div className="space-y-1">
							<p className="text-xs sm:text-sm font-semibold text-foreground">
								{isDragging ? (
									<span className="text-emerald-600">Solte a imagem aqui</span>
								) : (
									<>
										Arraste uma foto aqui ou{" "}
										<span className="text-emerald-600 underline underline-offset-2">
											clique para escolher
										</span>
									</>
								)}
							</p>
							<p className="text-[11px] text-muted-foreground">
								Formatos aceitos: JPG, PNG ou WebP até 5MB
							</p>
						</div>
					</div>
				</button>
			)}
		</FormField>
	);
}
