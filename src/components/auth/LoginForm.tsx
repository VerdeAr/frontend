import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { cn } from "@/lib/utils";
import { type LoginFormData, loginSchema } from "@/schemas";
import { useAuthStore } from "@/stores";

interface LoginFormProps {
	onSuccess?: () => void;
	className?: string;
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);
	const [showPassword, setShowPassword] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		setServerError(null);
		try {
			await login(data);
			if (onSuccess) {
				onSuccess();
			} else {
				navigate("/");
			}
		} catch (err: unknown) {
			const error = err as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			const message =
				error.response?.data?.message ||
				"Não foi possível realizar o login. Verifique suas credenciais.";
			setServerError(message);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			noValidate
			className={cn("flex flex-col gap-4 w-full", className)}
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

			<FormInput
				id="email"
				label="E-mail"
				type="email"
				autoComplete="email"
				autoCapitalize="none"
				placeholder="seu@email.com"
				required
				disabled={isSubmitting}
				error={errors.email?.message}
				{...register("email")}
			/>

			<FormInput
				id="password"
				label="Senha"
				type={showPassword ? "text" : "password"}
				autoComplete="current-password"
				placeholder="••••••••"
				required
				disabled={isSubmitting}
				error={errors.password?.message}
				rightElement={
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-xl"
						aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
						tabIndex={-1}
					>
						{showPassword ? (
							<EyeOff className="size-4" />
						) : (
							<Eye className="size-4" />
						)}
					</button>
				}
				{...register("password")}
			/>

			<Button
				type="submit"
				className="h-12 w-full mt-2 font-semibold text-sm rounded-xl shadow-xs transition-all"
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="size-4 animate-spin mr-2" />
						Entrando...
					</>
				) : (
					"Entrar na conta"
				)}
			</Button>

			<div className="text-center text-sm text-muted-foreground mt-1">
				Ainda não tem uma conta?{" "}
				<Link
					to="/cadastro"
					className="font-semibold text-primary underline-offset-4 hover:underline"
				>
					Cadastre-se
				</Link>
			</div>
		</form>
	);
}
