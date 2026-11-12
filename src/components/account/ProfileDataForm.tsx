import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { ZipCodeInput } from "@/components/ui/ZipCodeInput";
import { maskCep, maskPhone, unmask } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { type UpdateProfileFormData, updateProfileSchema } from "@/schemas";
import {
	authService,
	neighborhoodService,
	type ViaCepAddress,
} from "@/services";
import { useAuthStore } from "@/stores";
import type { Neighborhood, UpdateProfileData } from "@/types";

interface ProfileDataFormProps {
	className?: string;
}

export function ProfileDataForm({ className }: ProfileDataFormProps) {
	const { user, setUser } = useAuthStore();
	const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const isSeller = user?.role === "VENDEDOR";

	const initialNeighborhood =
		typeof user?.neighborhood === "object"
			? user?.neighborhood?.name
			: user?.neighborhood;

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<UpdateProfileFormData>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user?.name || "",
			phone: user?.phone ? maskPhone(user.phone) : "",
			address: user?.address || "",
			neighborhood_id: user?.neighborhood_id || "",
			cep: user?.cep ? maskCep(user.cep) : "",
			street: user?.street || "",
			number: user?.number || "",
			complement: user?.complement || "",
			neighborhood: initialNeighborhood || "",
			city: user?.city || "",
			state: user?.state || "",
			farm_name: user?.seller?.farm_name || "",
			description: user?.seller?.description || "",
		},
	});

	useEffect(() => {
		async function loadNeighborhoods() {
			try {
				const list = await neighborhoodService.getAll();
				setNeighborhoods(list);
			} catch {
				// Segue normalmente mesmo se listagem falhar
			}
		}
		loadNeighborhoods();
	}, []);

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const masked = maskPhone(e.target.value);
		setValue("phone", masked, { shouldValidate: true, shouldDirty: true });
	};

	const handleAddressFound = (viaCep: ViaCepAddress) => {
		setValue("cep", viaCep.cep, { shouldValidate: true, shouldDirty: true });
		setValue("street", viaCep.logradouro, {
			shouldValidate: true,
			shouldDirty: true,
		});
		setValue("neighborhood", viaCep.bairro, {
			shouldValidate: true,
			shouldDirty: true,
		});
		setValue("city", viaCep.localidade, {
			shouldValidate: true,
			shouldDirty: true,
		});
		setValue("state", viaCep.uf, {
			shouldValidate: true,
			shouldDirty: true,
		});
		setValue("address", viaCep.logradouro, {
			shouldValidate: true,
			shouldDirty: true,
		});

		const matchedNeighborhood = neighborhoods.find(
			(n) => n.name.trim().toLowerCase() === viaCep.bairro.trim().toLowerCase(),
		);
		if (matchedNeighborhood) {
			setValue("neighborhood_id", matchedNeighborhood.id, {
				shouldDirty: true,
			});
		}
	};

	const onSubmit = async (data: UpdateProfileFormData) => {
		setServerError(null);
		setSuccessMessage(null);
		try {
			const addressParts = [
				data.street || data.address,
				data.number ? `nº ${data.number}` : null,
				data.complement || null,
				data.neighborhood || null,
				data.city && data.state
					? `${data.city} - ${data.state}`
					: data.city || null,
				data.cep ? `CEP ${data.cep}` : null,
			].filter(Boolean);

			const formattedAddress =
				addressParts.length > 0
					? addressParts.join(", ")
					: data.address
						? data.address.trim()
						: null;

			const payload: UpdateProfileData = {
				name: data.name.trim(),
				phone: data.phone ? unmask(data.phone) : null,
				address: formattedAddress,
				cep: data.cep ? unmask(data.cep) : null,
				street: data.street
					? data.street.trim()
					: data.address
						? data.address.trim()
						: null,
				number: data.number ? data.number.trim() : null,
				complement: data.complement ? data.complement.trim() : null,
				neighborhood: data.neighborhood ? data.neighborhood.trim() : null,
				city: data.city ? data.city.trim() : null,
				state: data.state ? data.state.trim().toUpperCase() : null,
				neighborhood_id:
					data.neighborhood_id && data.neighborhood_id.trim() !== ""
						? data.neighborhood_id
						: null,
				farm_name: isSeller && data.farm_name ? data.farm_name.trim() : null,
				description:
					isSeller && data.description ? data.description.trim() : null,
			};

			const result = await authService.updateProfile(payload);
			setUser(result.user);
			setSuccessMessage(result.message || "Perfil atualizado com sucesso!");
		} catch (err: unknown) {
			const error = err as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			setServerError(
				error.response?.data?.message ||
					"Não foi possível salvar as alterações cadastrais.",
			);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			noValidate
			className={cn("flex flex-col gap-6 w-full", className)}
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

			{successMessage && (
				<div
					role="status"
					className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/15"
				>
					<CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
					<span className="leading-tight">{successMessage}</span>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					id="name"
					label="Nome Completo"
					required
					placeholder="Seu nome"
					containerClassName="md:col-span-2"
					error={errors.name?.message}
					disabled={isSubmitting}
					{...register("name")}
				/>

				<FormInput
					id="phone"
					label="Telefone / WhatsApp"
					placeholder="(00) 00000-0000"
					value={watch("phone") || ""}
					onChange={handlePhoneChange}
					error={errors.phone?.message}
					disabled={isSubmitting}
				/>

				<div className="md:col-span-2 pt-2 border-t border-border/40">
					<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
						<span>Endereço de Entrega / Residência</span>
						<span className="text-xs font-normal text-muted-foreground">
							(Digite o CEP para autopreenchimento)
						</span>
					</h3>
				</div>

				<ZipCodeInput
					id="cep"
					label="CEP"
					containerClassName="md:col-span-1"
					value={watch("cep")}
					onChange={(e) =>
						setValue("cep", e.target.value, {
							shouldValidate: true,
							shouldDirty: true,
						})
					}
					onAddressFound={handleAddressFound}
					error={errors.cep?.message}
					disabled={isSubmitting}
				/>

				<FormInput
					id="street"
					label="Rua / Logradouro"
					placeholder="Ex: Rua das Flores"
					containerClassName="md:col-span-1"
					error={errors.street?.message}
					disabled={isSubmitting}
					{...register("street")}
				/>

				<FormInput
					id="number"
					label="Número"
					placeholder="123"
					containerClassName="md:col-span-1"
					error={errors.number?.message}
					disabled={isSubmitting}
					{...register("number")}
				/>

				<FormInput
					id="complement"
					label="Complemento (Opcional)"
					placeholder="Apto 101, Bloco B"
					containerClassName="md:col-span-1"
					error={errors.complement?.message}
					disabled={isSubmitting}
					{...register("complement")}
				/>

				<FormInput
					id="neighborhood"
					label="Bairro"
					placeholder="Ex: Centro"
					containerClassName="md:col-span-1"
					error={errors.neighborhood?.message}
					disabled={isSubmitting}
					{...register("neighborhood")}
				/>

				<div className="grid grid-cols-3 gap-2 md:col-span-1">
					<FormInput
						id="city"
						label="Cidade"
						placeholder="São Paulo"
						containerClassName="col-span-2"
						error={errors.city?.message}
						disabled={isSubmitting}
						{...register("city")}
					/>
					<FormInput
						id="state"
						label="UF"
						placeholder="SP"
						maxLength={2}
						containerClassName="col-span-1"
						error={errors.state?.message}
						disabled={isSubmitting}
						{...register("state")}
					/>
				</div>

				{isSeller && (
					<>
						<FormInput
							id="farm_name"
							label="Nome da Propriedade / Fazenda"
							placeholder="Ex: Fazenda Boa Esperança"
							containerClassName="md:col-span-2"
							error={errors.farm_name?.message}
							disabled={isSubmitting}
							{...register("farm_name")}
						/>

						<FormTextarea
							id="description"
							label="Descrição da Atividade Rural"
							rows={3}
							placeholder="Descreva suas culturas e processos produtivos..."
							containerClassName="md:col-span-2"
							error={errors.description?.message}
							disabled={isSubmitting}
							{...register("description")}
						/>
					</>
				)}
			</div>

			<div className="flex justify-end pt-2">
				<Button
					type="submit"
					className="h-11 px-6 font-semibold text-sm rounded-xl shadow-xs transition-all w-full sm:w-auto"
					disabled={isSubmitting || !isDirty}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="size-4 animate-spin mr-2" />
							Salvando...
						</>
					) : (
						<>
							<Save className="size-4 mr-2" />
							Salvar Alterações
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
