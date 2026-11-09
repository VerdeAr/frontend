import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RootErrorBoundary() {
	const error = useRouteError();

	let title = "Ops! Algo deu errado";
	let message =
		"Ocorreu um erro inesperado ao carregar esta página. Por favor, tente novamente.";

	if (isRouteErrorResponse(error)) {
		if (error.status === 404) {
			title = "Página não encontrada";
			message =
				"O endereço acessado não foi encontrado ou não está disponível em nossa feira virtual.";
		} else if (error.status === 401 || error.status === 403) {
			title = "Acesso não autorizado";
			message =
				"Você precisa estar autenticado para acessar esta funcionalidade. Faça login e tente novamente.";
		} else {
			title = `Erro ${error.status}`;
			message =
				error.statusText ||
				"Não foi possível processar sua solicitação no momento.";
		}
	} else if (error instanceof Error && error.message) {
		message = error.message;
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 py-12 selection:bg-primary/20 selection:text-primary">
			<div
				className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-80 bg-linear-to-b from-destructive/10 via-destructive/5 to-transparent blur-3xl"
				aria-hidden="true"
			/>

			<div className="mx-auto max-w-md w-full flex flex-col items-center text-center gap-6">
				<div className="flex size-18 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive shadow-xs">
					<AlertTriangle className="size-9" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						{title}
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						{message}
					</p>
				</div>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
					<Link
						to="/"
						className={cn(
							buttonVariants({ variant: "default" }),
							"w-full sm:w-auto h-11 px-6 rounded-xl font-semibold shadow-xs gap-2",
						)}
					>
						<Home className="size-4" />
						<span>Voltar para o Início</span>
					</Link>

					<Button
						type="button"
						variant="outline"
						onClick={() => window.location.reload()}
						className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium gap-2 border-border/80 hover:bg-muted/60"
					>
						<RefreshCw className="size-4" />
						<span>Recarregar Página</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
