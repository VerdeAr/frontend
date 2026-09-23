import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertCircle,
	CheckCircle2,
	Eye,
	EyeOff,
	KeyRound,
	Loader2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { cn } from "@/lib/utils";
import { type UpdatePasswordFormData, updatePasswordSchema } from "@/schemas";
import { authService } from "@/services";

interface PasswordChangeFormProps {
	className?: string;
}

export function PasswordChangeForm({ className }: PasswordChangeFormProps) {
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<UpdatePasswordFormData>({
		resolver: zodResolver(updatePasswordSchema),
		defaultValues: {
			current_password: "",
			new_password: "",
			confirm_password: "",
		},
	});

	const onSubmit = async (data: UpdatePasswordFormData) => {
		setServerError(null);
		setSuccessMessage(null);
		try {
			const result = await authService.updatePassword(data);
			setSuccessMessage(result.message || "Senha atualizada com sucesso!");
			reset();
		} catch (err: unknown) {
			const error = err as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			setServerError(
				error.response?.data?.message ||
					"Não foi possível atualizar a senha. Verifique sua senha atual.",
			);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			noValidate
			className={cn("flex flex-col gap-6 w-full max-w-lg", className)}
		>
			{serverError && (
				<div
					role="alert"
					className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive dark:bg-destructive/20"
				>
					<AlertCircle className="size-4 shrink-0 mt-0.5" />
					<span className="leading-tight">{serverError}</span>
				</div>
			)}

			{successMessage && (
				<div
					role="status"
					className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/15"
				>
					<CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
					<span className="leading-tight">{successMessage}</span>
				</div>
			)}

			<FormInput
				id="current_password"
				label="Senha Atual"
				required
				type={showCurrent ? "text" : "password"}
				autoComplete="current-password"
				placeholder="Digite sua senha atual"
				error={errors.current_password?.message}
				disabled={isSubmitting}
				rightElement={
					<button
						type="button"
						onClick={() => setShowCurrent((p) => !p)}
						className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-xl"
						aria-label={showCurrent ? "Ocultar senha" : "Exibir senha"}
						tabIndex={-1}
					>
						{showCurrent ? (
							<EyeOff className="size-4" />
						) : (
							<Eye className="size-4" />
						)}
					</button>
				}
				{...register("current_password")}
			/>

			<FormInput
				id="new_password"
				label="Nova Senha"
				required
				type={showNew ? "text" : "password"}
				autoComplete="new-password"
				placeholder="Mínimo de 6 caracteres"
				error={errors.new_password?.message}
				disabled={isSubmitting}
				rightElement={
					<button
						type="button"
						onClick={() => setShowNew((p) => !p)}
						className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-xl"
						aria-label={showNew ? "Ocultar senha" : "Exibir senha"}
						tabIndex={-1}
					>
						{showNew ? (
							<EyeOff className="size-4" />
						) : (
							<Eye className="size-4" />
						)}
					</button>
				}
				{...register("new_password")}
			/>

			<FormInput
				id="confirm_password"
				label="Confirmar Nova Senha"
				required
				type={showConfirmPassword ? "text" : "password"}
				autoComplete="new-password"
				placeholder="Repita a nova senha"
				error={errors.confirm_password?.message}
				disabled={isSubmitting}
				rightElement={
					<button
						type="button"
						onClick={() => setShowConfirmPassword((p) => !p)}
						className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-xl"
						aria-label={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
						tabIndex={-1}
					>
						{showConfirmPassword ? (
							<EyeOff className="size-4" />
						) : (
							<Eye className="size-4" />
						)}
					</button>
				}
				{...register("confirm_password")}
			/>

			<div className="flex justify-end pt-2">
				<Button
					type="submit"
					className="h-11 px-6 font-semibold text-sm rounded-xl shadow-xs transition-all w-full sm:w-auto"
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="size-4 animate-spin mr-2" />
							Alterando senha...
						</>
					) : (
						<>
							<KeyRound className="size-4 mr-2" />
							Alterar Senha
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
