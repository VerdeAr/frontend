import { ArrowRight, ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartEmptyState() {
	return (
		<div className="flex flex-col items-center justify-center text-center py-16 px-4">
			<div className="flex size-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-primary shadow-xs mb-6">
				<ShoppingCart className="size-10" />
			</div>

			<h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">
				Seu carrinho está vazio
			</h2>

			<p className="text-sm sm:text-base text-muted-foreground max-w-md mb-8">
				Descubra alimentos frescos, sementes e produtos artesanais direto da
				agricultura familiar sustentável.
			</p>

			<Link
				to="/#produtos"
				className={cn(
					buttonVariants({ variant: "default" }),
					"h-11 px-6 gap-2 text-sm font-semibold rounded-xl shadow-xs",
				)}
			>
				<span>Explorar Produtos</span>
				<ArrowRight className="size-4" />
			</Link>
		</div>
	);
}
