import {
	AlertTriangle,
	Home,
	Lock,
	LogIn,
	RefreshCw,
	SearchX,
	ServerCrash,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useRouteError } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { getRouteErrorContent, type RouteErrorKind } from "@/lib/route-error";
import { cn } from "@/lib/utils";

const ICON_BY_KIND: Record<RouteErrorKind, typeof AlertTriangle> = {
	"not-found": SearchX,
	unauthorized: LogIn,
	forbidden: Lock,
	server: ServerCrash,
	unknown: AlertTriangle,
};

const ACTION_CLASSES = "w-full sm:w-auto h-11 px-6 rounded-xl gap-2";

export default function RootErrorBoundary() {
	const error = useRouteError();
	const { kind, title, message } = getRouteErrorContent(error);
	const Icon = ICON_BY_KIND[kind];

	// O texto técnico não aparece na tela; fica no console para quem for depurar
	useEffect(() => {
		console.error("Erro capturado pelo RootErrorBoundary:", error);
	}, [error]);

	// Recarregar só ajuda em falhas transitórias; 404 e 403 continuariam iguais
	const canReload = kind === "server" || kind === "unknown";

	return (
		<div className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4 py-12 selection:bg-primary/20 selection:text-primary">
			<div
				className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-80 bg-linear-to-b from-destructive/10 via-destructive/5 to-transparent blur-3xl"
				aria-hidden="true"
			/>

			<div className="mx-auto max-w-md w-full flex flex-col items-center text-center gap-6">
				<div className="flex size-18 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive shadow-xs">
					<Icon className="size-9" aria-hidden="true" />
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
					{kind === "unauthorized" && (
						<Link
							to="/login"
							className={cn(
								buttonVariants({ variant: "default" }),
								ACTION_CLASSES,
								"font-semibold shadow-xs",
							)}
						>
							<LogIn className="size-4" aria-hidden="true" />
							<span>Entrar</span>
						</Link>
					)}

					<Link
						to="/"
						className={cn(
							buttonVariants({
								variant: kind === "unauthorized" ? "outline" : "default",
							}),
							ACTION_CLASSES,
							"font-semibold shadow-xs",
						)}
					>
						<Home className="size-4" aria-hidden="true" />
						<span>Voltar para o Início</span>
					</Link>

					{canReload && (
						<Button
							type="button"
							variant="outline"
							onClick={() => window.location.reload()}
							className={cn(
								ACTION_CLASSES,
								"font-medium border-border/80 hover:bg-muted/60",
							)}
						>
							<RefreshCw className="size-4" aria-hidden="true" />
							<span>Recarregar Página</span>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
