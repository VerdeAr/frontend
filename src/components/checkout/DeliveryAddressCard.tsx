import { AlertCircle, Edit, MapPin, Store, Truck, User } from "lucide-react";
import { Link } from "react-router";
import { maskCep, maskPhone } from "@/lib/masks";
import type { DeliveryType, User as UserType } from "@/types";

export interface DeliveryAddressCardProps {
	user: UserType;
	deliveryType: DeliveryType | null;
}

export function DeliveryAddressCard({
	user,
	deliveryType,
}: DeliveryAddressCardProps) {
	const hasAddress = Boolean(user.address?.trim() || user.street?.trim());
	const neighborhoodName =
		typeof user.neighborhood === "object"
			? user.neighborhood?.name
			: user.neighborhood;

	// Linha principal: Logradouro, Número e Complemento
	const mainAddressLine = user.street
		? [
				user.street,
				user.number ? `nº ${user.number}` : null,
				user.complement || null,
			]
				.filter(Boolean)
				.join(", ")
		: user.address || "";

	// Localidade: Bairro e Cidade - UF
	const cityState =
		user.city && user.state
			? `${user.city} - ${user.state}`
			: user.city || user.state || null;

	const localityParts = [
		neighborhoodName ? `Bairro: ${neighborhoodName}` : null,
		cityState,
	].filter(Boolean);

	const localityLine =
		localityParts.length > 0
			? localityParts.join(" • ")
			: neighborhoodName
				? `Bairro: ${neighborhoodName}`
				: null;

	const cepLine = user.cep ? `CEP: ${maskCep(user.cep)}` : null;
	const formattedPhone = user.phone ? maskPhone(user.phone) : null;

	if (deliveryType === "RETIRADA") {
		return (
			<div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-3">
				<div className="flex items-center gap-2.5 text-foreground font-bold text-base sm:text-lg">
					<div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Store className="size-4" />
					</div>
					<span>Retirada no Local</span>
				</div>

				<p className="text-sm text-muted-foreground">
					Seus produtos serão preparados para retirada diretamente na
					propriedade do produtor rural. As instruções e contato detalhados
					serão apresentados na confirmação do pedido.
				</p>

				<div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
					<User className="size-3.5 text-primary" />
					<span>
						Retirante responsável:{" "}
						<strong className="text-foreground">{user.name}</strong>
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2.5 text-foreground font-bold text-base sm:text-lg">
					<div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Truck className="size-4" />
					</div>
					<span>Endereço de Entrega</span>
				</div>

				<Link
					to="/minha-conta?aba=profile"
					className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline py-1 px-2 rounded-lg hover:bg-primary/5 transition-colors"
				>
					<Edit className="size-3" />
					<span>Editar</span>
				</Link>
			</div>

			{hasAddress ? (
				<div className="flex flex-col gap-2 text-sm">
					<div className="flex items-start gap-2.5 text-foreground">
						<MapPin className="size-4 text-primary shrink-0 mt-0.5" />
						<div className="flex flex-col gap-0.5">
							<p className="font-semibold leading-snug">{mainAddressLine}</p>
							{localityLine && (
								<p className="text-xs text-muted-foreground leading-snug">
									{localityLine}
								</p>
							)}
							{cepLine && (
								<p className="text-xs text-muted-foreground font-mono">
									{cepLine}
								</p>
							)}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-2 text-xs text-muted-foreground border-t border-border/40">
						<span>
							Destinatário:{" "}
							<strong className="text-foreground">{user.name}</strong>
						</span>
						{formattedPhone && (
							<span>
								• Tel:{" "}
								<strong className="text-foreground">{formattedPhone}</strong>
							</span>
						)}
					</div>
				</div>
			) : (
				<div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-amber-800 dark:text-amber-300">
					<AlertCircle className="size-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
					<div className="text-xs space-y-1">
						<p className="font-semibold">Endereço ainda não cadastrado</p>
						<p>
							Para entrega em domicílio, você precisa informar seu endereço
							completo.
						</p>
						<Link
							to="/minha-conta?aba=profile"
							className="inline-block font-bold underline mt-1 text-primary hover:opacity-80"
						>
							Cadastrar endereço agora →
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
