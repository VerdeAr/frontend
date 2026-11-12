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
import {
	FormInput,
	FormSelect,
	FormTextarea,
} from "@/components/ui/form-input";
import { Label } from "@/components/ui/label";
import { maskCnpj, maskCpf, maskPhone, unmask } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { type RegisterFormData, registerFormSchema } from "@/schemas";
import { neighborhoodService } from "@/services";
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
	const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(true);
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
			} finally {
				setIsLoadingNeighborhoods(false);
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

	const onSubmit = async (data: RegisterFormData) => {
		setServerError(null);
		try {
			const payload: RegisterData = {
				name: data.name.trim(),
				email: data.email.trim(),
				password: data.password,
				cpf: unmask(data.cpf),
				role: data.role,
				phone: data.phone ? unmask(data.phone) : null,
				address: data.address ? data.address.trim() : null,
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
							: "Selecione seu bairro (opcional)"}
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
