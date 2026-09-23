import { Heart } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
	return (
		<footer className="border-t border-border/60 bg-muted/30 mt-auto py-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
					{/* Coluna 1: Sobre */}
					<div>
						<img
							src="/images/logo-transparent.webp"
							alt="Verdear"
							className="h-8 w-auto mb-3 mx-auto md:mx-0"
						/>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Conectando o produtor rural familiar diretamente ao consumidor,
							promovendo alimentos frescos, comércio justo e sustentabilidade no
							campo.
						</p>
					</div>

					{/* Coluna 2: Navegação */}
					<div className="flex flex-col space-y-2">
						<h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-2">
							Navegação
						</h3>
						<Link
							to="/"
							className="text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							Página Inicial
						</Link>
						<Link
							to="/carrinho"
							className="text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							Carrinho de Compras
						</Link>
						<Link
							to="/chat"
							className="text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							Atendimento e Dúvidas
						</Link>
					</div>

					{/* Coluna 3: Institucional */}
					<div>
						<h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-2">
							Institucional
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Desenvolvido no âmbito das disciplinas de Fábrica de Software da{" "}
							<span className="font-medium text-foreground">UTFPR</span>.
						</p>
					</div>
				</div>

				<div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground text-center">
					<p>
						© {new Date().getFullYear()} Verdear. Todos os direitos reservados.
					</p>
					<p className="flex items-center justify-center gap-1">
						Feito com <Heart className="size-3 text-red-500 fill-red-500" />{" "}
						para a agricultura familiar.
					</p>
				</div>
			</div>
		</footer>
	);
}
