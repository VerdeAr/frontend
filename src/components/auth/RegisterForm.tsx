import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertCircle,
	Eye,
	EyeOff,
	Loader2,
	ShoppingBag,
	Sprout,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/ui/form-input";
import { Label } from "@/components/ui/label";
import { ZipCodeInput } from "@/components/ui/ZipCodeInput";
import { maskCnpj, maskCpf, maskPhone, unmask } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { type RegisterFormData, registerFormSchema } from "@/schemas";
import { neighborhoodService, type ViaCepAddress } from "@/services";
import { useAuthStore } from "@/stores";
import type { Neighborhood, RegisterData, UserRole } from "@/types";

interface RegisterFormProps {
	onSuccess?: () => void;
	className?: string;
}

export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
	const navigate = useNavigate();
	const registerUser = useAuthStore((state) => state.register);

	const [selectedRole, setSelectedRole] = useState<UserRole>("CLIENTE");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerFormSchema),
		defaultValues: {
			name: "",
			email: "",
			cpf: "",
			password: "",
			confirm_password: "",
			role: "CLIENTE",
			phone: "",
			address: "",
			neighborhood_id: "",
			cep: "",
			street: "",
			number: "",
			complement: "",
			neighborhood: "",
			city: "",
			state: "",
			farm_name: "",
			cnpj: "",
			description: "",
		},
	});

	useEffect(() => {
		async function loadNeighborhoods() {
			try {
				const list = await neighborhoodService.getAll();
				setNeighborhoods(list);
			} catch {
				// Continua mesmo se a listagem falhar
			}
		}
		loadNeighborhoods();
	}, []);

	const handleRoleChange = (role: UserRole) => {
		setSelectedRole(role);
		setValue("role", role);
	};

	const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const masked = maskCpf(e.target.value);
		setValue("cpf", masked, { shouldValidate: true });
	};

	const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const masked = maskCnpj(e.target.value);
		setValue("cnpj", masked, { shouldValidate: true });
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const masked = maskPhone(e.target.value);
		setValue("phone", masked, { shouldValidate: true });
	};

	const handleAddressFound = (viaCep: ViaCepAddress) => {
		setValue("cep", viaCep.cep, { shouldValidate: true });
		setValue("street", viaCep.logradouro, { shouldValidate: true });
		setValue("neighborhood", viaCep.bairro, { shouldValidate: true });
		setValue("city", viaCep.localidade, { shouldValidate: true });
		setValue("state", viaCep.uf, { shouldValidate: true });
		setValue("address", viaCep.logradouro, { shouldValidate: true });

		const matchedNeighborhood = neighborhoods.find(
			(n) => n.name.trim().toLowerCase() === viaCep.bairro.trim().toLowerCase(),
		);
		if (matchedNeighborhood) {
			setValue("neighborhood_id", matchedNeighborhood.id);
		}
	};

	const onSubmit = async (data: RegisterFormData) => {
		setServerError(null);
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

			const payload: RegisterData = {
				name: data.name.trim(),
				email: data.email.trim(),
				password: data.password,
				cpf: unmask(data.cpf),
				role: data.role,
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
				description:
					data.role === "VENDEDOR" && data.description
						? data.description.trim()
						: null,
				cnpj: data.role === "VENDEDOR" && data.cnpj ? unmask(data.cnpj) : null,
				farm_name:
					data.role === "VENDEDOR" && data.farm_name
						? data.farm_name.trim()
						: null,
			};

			await registerUser(payload);
			if (onSuccess) {
				onSuccess();
			} else {
				navigate("/");
			}
		} catch (err: unknown) {
			const error = err as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			const message =
				error.response?.data?.message ||
				"Não foi possível concluir o cadastro. Verifique os dados.";
			setServerError(message);
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

			{/* Alternador de Perfil */}
			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium text-foreground/90">
					Como você deseja utilizar o Verdear?
				</Label>
				<div className="grid grid-cols-2 gap-2 p-1.5 bg-muted/40 border border-border/50 rounded-2xl">
					<button
						type="button"
						onClick={() => handleRoleChange("CLIENTE")}
						className={cn(
							"h-12 flex items-center justify-center gap-2.5 rounded-xl text-sm font-medium transition-all select-none",
							selectedRole === "CLIENTE"
								? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/60"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<ShoppingBag className="size-4 text-primary" />
						<span>Quero Comprar</span>
					</button>
					<button
						type="button"
						onClick={() => handleRoleChange("VENDEDOR")}
						className={cn(
							"h-12 flex items-center justify-center gap-2.5 rounded-xl text-sm font-medium transition-all select-none",
							selectedRole === "VENDEDOR"
								? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/60"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<Sprout className="size-4 text-emerald-600 dark:text-emerald-400" />
						<span>Quero Vender</span>
					</button>
				</div>
			</div>

			{/* Dados Pessoais / Conta */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					id="name"
					label="Nome Completo"
					required
					placeholder="Seu nome completo"
					containerClassName="md:col-span-2"
					error={errors.name?.message}
					disabled={isSubmitting}
					{...register("name")}
				/>

				<FormInput
					id="email"
					label="E-mail"
					type="email"
					required
					autoComplete="email"
					autoCapitalize="none"
					placeholder="seu@email.com"
					error={errors.email?.message}
					disabled={isSubmitting}
					{...register("email")}
				/>

				<FormInput
					id="cpf"
					label="CPF"
					required
					placeholder="000.000.000-00"
					value={watch("cpf")}
					onChange={handleCpfChange}
					error={errors.cpf?.message}
					disabled={isSubmitting}
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
						setValue("cep", e.target.value, { shouldValidate: true })
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
			</div>

			{/* Seção Produtor Rural */}
			{selectedRole === "VENDEDOR" && (
				<div className="flex flex-col gap-4 p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10 transition-all">
					<div className="flex items-center gap-2 pb-1 border-b border-emerald-500/15">
						<Sprout className="size-5 text-emerald-600 dark:text-emerald-400" />
						<h3 className="text-sm font-semibold text-foreground">
							Informações da Propriedade Rural
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							id="farm_name"
							label="Nome da Propriedade / Sítio"
							required
							placeholder="Ex: Sítio Bela Vista"
							containerClassName="md:col-span-2"
							error={errors.farm_name?.message}
							disabled={isSubmitting}
							{...register("farm_name")}
						/>

						<FormInput
							id="cnpj"
							label="CNPJ (Opcional)"
							placeholder="00.000.000/0000-00"
							containerClassName="md:col-span-2"
							value={watch("cnpj") || ""}
							onChange={handleCnpjChange}
							error={errors.cnpj?.message}
							disabled={isSubmitting}
						/>

						<FormTextarea
							id="description"
							label="Breve Descrição da Produção"
							rows={3}
							placeholder="Conte sobre suas culturas (hortaliças, frutas, laticínios), métodos sustentáveis..."
							containerClassName="md:col-span-2"
							error={errors.description?.message}
							disabled={isSubmitting}
							{...register("description")}
						/>
					</div>
				</div>
			)}

			{/* Senhas */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormInput
					id="password"
					label="Senha"
					required
					type={showPassword ? "text" : "password"}
					autoComplete="new-password"
					placeholder="Mínimo 6 caracteres"
					error={errors.password?.message}
					disabled={isSubmitting}
					rightElement={
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-xl"
							aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
							tabIndex={-1}
						>
							{showPassword ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					}
					{...register("password")}
				/>

				<FormInput
					id="confirm_password"
					label="Confirmar Senha"
					required
					type={showConfirmPassword ? "text" : "password"}
					autoComplete="new-password"
					placeholder="Repita a senha"
					error={errors.confirm_password?.message}
					disabled={isSubmitting}
					rightElement={
						<button
							type="button"
							onClick={() => setShowConfirmPassword((prev) => !prev)}
							className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-xl"
							aria-label={
								showConfirmPassword ? "Ocultar senha" : "Exibir senha"
							}
							tabIndex={-1}
						>
							{showConfirmPassword ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					}
					{...register("confirm_password")}
				/>
			</div>

			<Button
				type="submit"
				className="h-12 w-full mt-2 font-semibold text-sm rounded-xl shadow-xs transition-all"
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="size-4 animate-spin mr-2" />
						Criando sua conta...
					</>
				) : (
					"Cadastrar no Verdear"
				)}
			</Button>

			<div className="text-center text-sm text-muted-foreground">
				Já possui uma conta?{" "}
				<Link
					to="/login"
					className="font-semibold text-primary underline-offset-4 hover:underline"
				>
					Entrar
				</Link>
			</div>
		</form>
	);
}
