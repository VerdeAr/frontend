import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Save, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { cn } from "@/lib/utils";
import {
	type UpdateShippingRateFormData,
	updateShippingRateSchema,
} from "@/schemas";
import { authService } from "@/services";
import { useAuthStore } from "@/stores";

interface SellerShippingFormProps {
	className?: string;
}

export function SellerShippingForm({ className }: SellerShippingFormProps) {
	const { user, setUser } = useAuthStore();
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const initialRate = Number(user?.fixed_shipping_rate ?? 0);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<UpdateShippingRateFormData>({
		resolver: zodResolver(updateShippingRateSchema),
		defaultValues: {
			fixed_shipping_rate: initialRate,
		},
	});

	const onSubmit = async (data: UpdateShippingRateFormData) => {
		setServerError(null);
		setSuccessMessage(null);
		try {
			const result = await authService.updateShipping({
				fixed_shipping_rate: Number(data.fixed_shipping_rate),
			});
			if (user) {
				setUser({
					...user,
					fixed_shipping_rate: result.fixed_shipping_rate,
				});
			}
			setSuccessMessage(
				result.message || "Taxa de frete atualizada com sucesso!",
			);
		} catch (err: unknown) {
			const error = err as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			setServerError(
				error.response?.data?.message ||
					"Não foi possível atualizar o valor do frete.",
			);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			noValidate
			className={cn("flex flex-col gap-6 w-full max-w-lg", className)}
		>
			<div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
				<Truck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
				<p className="text-xs sm:text-sm leading-relaxed">
					Defina o valor fixo cobrado para entregas realizadas na região. Se
					oferecer frete grátis para todos os pedidos, informe{" "}
					<strong>0</strong>.
				</p>
			</div>

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

			<FormInput
				id="fixed_shipping_rate"
				label="Taxa Fixa de Entrega (R$)"
				required
				type="number"
				step="0.01"
				min="0"
				placeholder="0.00"
				helperText="Valor cobrado em compras com opção de entrega selecionada pelo cliente."
				error={errors.fixed_shipping_rate?.message}
				disabled={isSubmitting}
				{...register("fixed_shipping_rate", { valueAsNumber: true })}
			/>

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
							Atualizar Frete
						</>
					)}
				</Button>
			</div>
		</form>
	);
}
