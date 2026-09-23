import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
					className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/20"
				>
					<AlertCircle className="size-4 shrink-0 mt-0.5" />
					<span className="leading-tight">{serverError}</span>
				</div>
			)}

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="email" className="text-sm font-medium">
					E-mail
				</Label>
				<Input
					id="email"
					type="email"
					autoComplete="email"
					autoCapitalize="none"
					placeholder="seu@email.com"
					className="h-11 text-sm"
					aria-invalid={!!errors.email}
					disabled={isSubmitting}
					{...register("email")}
				/>
				{errors.email && (
					<span className="text-xs font-medium text-destructive">
						{errors.email.message}
					</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<Label htmlFor="password" className="text-sm font-medium">
						Senha
					</Label>
				</div>
				<div className="relative flex items-center">
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						autoComplete="current-password"
						placeholder="••••••••"
						className="h-11 pr-11 text-sm"
						aria-invalid={!!errors.password}
						disabled={isSubmitting}
						{...register("password")}
					/>
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						className="absolute right-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-lg"
						aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
						tabIndex={-1}
					>
						{showPassword ? (
							<EyeOff className="size-4" />
						) : (
							<Eye className="size-4" />
						)}
					</button>
				</div>
				{errors.password && (
					<span className="text-xs font-medium text-destructive">
						{errors.password.message}
					</span>
				)}
			</div>

			<Button
				type="submit"
				className="h-11 w-full mt-2 font-medium text-sm transition-all"
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

			<div className="text-center text-sm text-muted-foreground mt-2">
				Ainda não tem uma conta?{" "}
				<Link
					to="/cadastro"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Cadastre-se
				</Link>
			</div>
		</form>
	);
}
