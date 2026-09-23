import { Sprout } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { LoginForm } from "@/components/auth";
import { useAuthStore } from "@/stores";

export default function Login() {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	return (
		<div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4 sm:px-6">
			{/* Subtle Ambient Glow */}
			<div
				className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-80 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl"
				aria-hidden="true"
			/>

			<div className="w-full max-w-md mx-auto flex flex-col items-center">
				{/* Brand Emblem & Header */}
				<div className="flex flex-col items-center text-center mb-8">
					<div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-xs">
						<Sprout className="size-6" />
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						Bem-vindo de volta!
					</h1>
					<p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
						Entre com suas credenciais para continuar conectando-se ao campo.
					</p>
				</div>

				{/* Open Form Flow */}
				<div className="w-full bg-card/60 backdrop-blur-sm sm:border sm:border-border/60 sm:rounded-3xl sm:p-8 sm:shadow-xs">
					<LoginForm />
				</div>
			</div>
		</div>
	);
}
