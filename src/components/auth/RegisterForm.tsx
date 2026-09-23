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
import { Input } from "@/components/ui/input";
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
			className={cn("flex flex-col gap-5 w-full", className)}
		>
			{serverError && (
				<div
					role="alert"
					className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/20"
				>
					<AlertCircle className="size-4 shrink-0 mt-0.5" />
					<span className="leading-tight">{serverError}</span>
				</div>
			)}

			{/* Alternador de Perfil */}
			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">Tipo de Conta</Label>
				<div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
					<button
						type="button"
						onClick={() => handleRoleChange("CLIENTE")}
						className={cn(
							"h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all select-none",
							selectedRole === "CLIENTE"
								? "bg-background text-foreground shadow-xs font-semibold"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<ShoppingBag className="size-4" />
						<span>Consumidor</span>
					</button>
					<button
						type="button"
						onClick={() => handleRoleChange("VENDEDOR")}
						className={cn(
							"h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all select-none",
							selectedRole === "VENDEDOR"
								? "bg-background text-foreground shadow-xs font-semibold"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<Sprout className="size-4 text-emerald-600 dark:text-emerald-400" />
						<span>Produtor Rural</span>
					</button>
				</div>
			</div>

			{/* Dados Básicos */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="flex flex-col gap-1.5 md:col-span-2">
					<Label htmlFor="name" className="text-sm font-medium">
						Nome Completo *
					</Label>
					<Input
						id="name"
						placeholder="Seu nome ou razão social"
						className="h-11 text-sm"
						aria-invalid={!!errors.name}
						disabled={isSubmitting}
						{...register("name")}
					/>
					{errors.name && (
						<span className="text-xs font-medium text-destructive">
							{errors.name.message}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="email" className="text-sm font-medium">
						E-mail *
					</Label>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						autoCapitalize="none"
						placeholder="seu@email.com"
						className="h-11 text-sm"
						aria-invalid={!!errors.email}
						disabled={isSubmitting}
						{...register("email")}
					/>
					{errors.email && (
						<span className="text-xs font-medium text-destructive">
							{errors.email.message}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="cpf" className="text-sm font-medium">
						CPF *
					</Label>
					<Input
						id="cpf"
						placeholder="000.000.000-00"
						className="h-11 text-sm"
						value={watch("cpf")}
						onChange={handleCpfChange}
						aria-invalid={!!errors.cpf}
						disabled={isSubmitting}
					/>
					{errors.cpf && (
						<span className="text-xs font-medium text-destructive">
							{errors.cpf.message}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="phone" className="text-sm font-medium">
						Telefone / WhatsApp
					</Label>
					<Input
						id="phone"
						placeholder="(00) 00000-0000"
						className="h-11 text-sm"
						value={watch("phone") || ""}
						onChange={handlePhoneChange}
						aria-invalid={!!errors.phone}
						disabled={isSubmitting}
					/>
					{errors.phone && (
						<span className="text-xs font-medium text-destructive">
							{errors.phone.message}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="neighborhood_id" className="text-sm font-medium">
						Bairro
					</Label>
					<select
						id="neighborhood_id"
						className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
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
					</select>
					{errors.neighborhood_id && (
						<span className="text-xs font-medium text-destructive">
							{errors.neighborhood_id.message}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5 md:col-span-2">
					<Label htmlFor="address" className="text-sm font-medium">
						Endereço / Logradouro
					</Label>
					<Input
						id="address"
						placeholder="Rua, número, complemento"
						className="h-11 text-sm"
						aria-invalid={!!errors.address}
						disabled={isSubmitting}
						{...register("address")}
					/>
					{errors.address && (
						<span className="text-xs font-medium text-destructive">
							{errors.address.message}
						</span>
					)}
				</div>
			</div>

			{/* Campos Específicos para Produtor Rural */}
			{selectedRole === "VENDEDOR" && (
				<div className="flex flex-col gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
					<div className="flex items-center gap-2">
						<Sprout className="size-5 text-emerald-600 dark:text-emerald-400" />
						<h3 className="text-sm font-semibold text-foreground">
							Dados do Produtor Rural
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex flex-col gap-1.5 md:col-span-2">
							<Label htmlFor="farm_name" className="text-sm font-medium">
								Nome da Propriedade / Fazenda / Sítio *
							</Label>
							<Input
								id="farm_name"
								placeholder="Ex: Sítio Bela Vista"
								className="h-11 text-sm bg-background"
								aria-invalid={!!errors.farm_name}
								disabled={isSubmitting}
								{...register("farm_name")}
							/>
							{errors.farm_name && (
								<span className="text-xs font-medium text-destructive">
									{errors.farm_name.message}
								</span>
							)}
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor="cnpj" className="text-sm font-medium">
								CNPJ (Opcional)
							</Label>
							<Input
								id="cnpj"
								placeholder="00.000.000/0000-00"
								className="h-11 text-sm bg-background"
								value={watch("cnpj") || ""}
								onChange={handleCnpjChange}
								aria-invalid={!!errors.cnpj}
								disabled={isSubmitting}
							/>
							{errors.cnpj && (
								<span className="text-xs font-medium text-destructive">
									{errors.cnpj.message}
								</span>
							)}
						</div>

						<div className="flex flex-col gap-1.5 md:col-span-2">
							<Label htmlFor="description" className="text-sm font-medium">
								Descrição da Produção (Opcional)
							</Label>
							<textarea
								id="description"
								rows={3}
								placeholder="Conte um pouco sobre sua produção agrícola, colheitas sustentáveis e história familiar..."
								className="w-full rounded-lg border border-input bg-background p-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
								disabled={isSubmitting}
								{...register("description")}
							/>
							{errors.description && (
								<span className="text-xs font-medium text-destructive">
									{errors.description.message}
								</span>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Senhas */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="password" className="text-sm font-medium">
						Senha *
					</Label>
					<div className="relative flex items-center">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							autoComplete="new-password"
							placeholder="Mínimo 6 caracteres"
							className="h-11 pr-11 text-sm"
							aria-invalid={!!errors.password}
							disabled={isSubmitting}
							{...register("password")}
						/>
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="absolute right-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-lg"
							aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
							tabIndex={-1}
						>
							{showPassword ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					</div>
					{errors.password && (
						<span className="text-xs font-medium text-destructive">
							{errors.password.message}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="confirm_password" className="text-sm font-medium">
						Confirmar Senha *
					</Label>
					<div className="relative flex items-center">
						<Input
							id="confirm_password"
							type={showConfirmPassword ? "text" : "password"}
							autoComplete="new-password"
							placeholder="Repita a senha"
							className="h-11 pr-11 text-sm"
							aria-invalid={!!errors.confirm_password}
							disabled={isSubmitting}
							{...register("confirm_password")}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword((prev) => !prev)}
							className="absolute right-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-lg"
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
					</div>
					{errors.confirm_password && (
						<span className="text-xs font-medium text-destructive">
							{errors.confirm_password.message}
						</span>
					)}
				</div>
			</div>

			<Button
				type="submit"
				className="h-11 w-full mt-2 font-medium text-sm transition-all"
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
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Entrar
				</Link>
			</div>
		</form>
	);
}
