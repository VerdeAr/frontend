import {
	ClipboardList,
	MessageCircle,
	Search,
	ShoppingCart,
	User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

export function Header() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");

	const isSeller = user?.role === "VENDEDOR";

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/produtos/busca?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<Link
					to="/"
					className="flex items-center gap-2 transition-opacity hover:opacity-90 shrink-0"
					aria-label="Verdear Home"
				>
					<img
						src="/images/logo-transparent.webp"
						alt="Verdear"
						className="h-10 w-auto object-contain"
					/>
				</Link>

				{/* Barra de Pesquisa (visível a partir de sm, ou simplificada no mobile) */}
				<form
					onSubmit={handleSearch}
					className="hidden sm:flex flex-1 max-w-md items-center relative"
				>
					<input
						type="search"
						name="q"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Pesquisar produtos agrícolas..."
						className="w-full h-10 rounded-full border border-input bg-muted/40 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
					/>
					<Search
						className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4"
						aria-hidden="true"
					/>
				</form>

				{/* Ícones de Ação */}
				<nav className="flex items-center gap-1 sm:gap-2">
					{/* Botão de Busca Mobile (abre busca rápida) */}
					<Link
						to="/produtos/busca"
						className="sm:hidden flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
						aria-label="Buscar produtos"
					>
						<Search className="size-5 text-muted-foreground" />
					</Link>

					{/* Chat */}
					<Link
						to="/chat"
						className="relative flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
						aria-label="Mensagens e Atendimento"
					>
						<MessageCircle className="size-5" />
					</Link>

					{/* Ação Condicional: Pedidos do Vendedor OU Carrinho do Consumidor */}
					{isSeller ? (
						<Link
							to="/minha-conta#pedidos"
							className="relative flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
							aria-label="Controle de Pedidos"
						>
							<ClipboardList className="size-5 text-primary" />
						</Link>
					) : (
						<Link
							to="/carrinho"
							className="relative flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
							aria-label="Carrinho de Compras"
						>
							<ShoppingCart className="size-5" />
						</Link>
					)}

					{/* Perfil / Login */}
					<Link
						to={isAuthenticated ? "/minha-conta" : "/login"}
						className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
						aria-label={
							isAuthenticated ? `Conta de ${user?.name}` : "Fazer Login"
						}
					>
						<UserIcon className="size-5" />
					</Link>
				</nav>
			</div>
		</header>
	);
}
