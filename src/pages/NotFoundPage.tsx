import { ArrowLeft, Sprout, Store } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACTION_CLASSES = "w-full sm:w-auto h-11 px-6 rounded-xl gap-2";

export default function NotFoundPage() {
	const location = useLocation();
	const navigate = useNavigate();

	// "default" indica que a página foi aberta direto pelo endereço, sem histórico para voltar
	const canGoBack = location.key !== "default";

	return (
		<section className="flex flex-col items-center justify-center text-center gap-6 py-12 md:py-20">
			<div className="flex size-18 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
				<Sprout className="size-9" aria-hidden="true" />
			</div>

			<div className="max-w-md space-y-2">
				<p className="text-sm font-semibold text-primary">Erro 404</p>
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
					Página não encontrada
				</h1>
				<p className="text-sm text-muted-foreground leading-relaxed">
					Esta página não brotou por aqui. O endereço{" "}
					<code className="break-all rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
						{location.pathname}
					</code>{" "}
					não existe ou foi removido da nossa feira virtual.
				</p>
			</div>

			<div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md sm:max-w-none">
				<Link
					to="/"
					className={cn(
						buttonVariants({ variant: "default" }),
						ACTION_CLASSES,
						"font-semibold shadow-xs",
					)}
				>
					<Store className="size-4" aria-hidden="true" />
					<span>Voltar para a vitrine</span>
				</Link>

				{canGoBack && (
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate(-1)}
						className={cn(ACTION_CLASSES, "font-medium")}
					>
						<ArrowLeft className="size-4" aria-hidden="true" />
						<span>Voltar à página anterior</span>
					</Button>
				)}
			</div>
		</section>
	);
}
