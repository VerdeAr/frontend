import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	FormInput,
	FormSelect,
	FormTextarea,
} from "@/components/ui/form-input";
import { maskPhone, unmask } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { type UpdateProfileFormData, updateProfileSchema } from "@/schemas";
import { authService, neighborhoodService } from "@/services";
import { useAuthStore } from "@/stores";
import type { Neighborhood, UpdateProfileData } from "@/types";

interface ProfileDataFormProps {
	className?: string;
}

export function ProfileDataForm({ className }: ProfileDataFormProps) {
	const { user, setUser } = useAuthStore();
	const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
	const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(true);
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const isSeller = user?.role === "VENDEDOR";

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
			} finally {
				setIsLoadingNeighborhoods(false);
			}
		}
		loadNeighborhoods();
	}, []);

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const masked = maskPhone(e.target.value);
		setValue("phone", masked, { shouldValidate: true, shouldDirty: true });
	};

	const onSubmit = async (data: UpdateProfileFormData) => {
		setServerError(null);
		setSuccessMessage(null);
		try {
			const payload: UpdateProfileData = {
				name: data.name.trim(),
				phone: data.phone ? unmask(data.phone) : null,
				address: data.address ? data.address.trim() : null,
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

				<FormSelect
					id="neighborhood_id"
					label="Bairro"
					error={errors.neighborhood_id?.message}
					disabled={isSubmitting || isLoadingNeighborhoods}
					{...register("neighborhood_id")}
				>
					<option value="" className="bg-background text-foreground">
						{isLoadingNeighborhoods
							? "Carregando bairros..."
							: "Selecione seu bairro"}
					</option>
					{neighborhoods.map((n) => (
						<option
							key={n.id}
							value={n.id}
							className="bg-background text-foreground"
						>
							{n.name} ({n.city})
						</option>
					))}
				</FormSelect>

				<FormInput
					id="address"
					label="Endereço / Logradouro"
					placeholder="Rua, número, complemento"
					containerClassName="md:col-span-2"
					error={errors.address?.message}
					disabled={isSubmitting}
					{...register("address")}
				/>

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
