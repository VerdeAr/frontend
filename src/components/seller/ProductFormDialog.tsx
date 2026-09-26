import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertCircle,
	ImageIcon,
	Loader2,
	Plus,
	Save,
	Sprout,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	FormInput,
	FormSelect,
	FormTextarea,
} from "@/components/ui/form-input";
import { Switch } from "@/components/ui/switch";
import { type ProductFormData, productFormSchema } from "@/schemas";
import { catalogService } from "@/services/catalog.service";
import { sellerProductsService } from "@/services/seller-products.service";
import type { Category, MeasurementUnit, Product } from "@/types";

export interface ProductFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	productToEdit?: Product | null;
	onSuccess: (savedProduct: Product) => void;
}

export function ProductFormDialog({
	open,
	onOpenChange,
	productToEdit,
	onSuccess,
}: ProductFormDialogProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnit[]>(
		[],
	);
	const [serverError, setServerError] = useState<string | null>(null);

	const isEditing = Boolean(productToEdit);

	const {
		register,
		handleSubmit,
		reset,
		control,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<ProductFormData>({
		resolver: zodResolver(productFormSchema),
		defaultValues: {
			name: "",
			price: 0,
			stock: 0,
			category_id: "",
			measurement_unit_id: "",
			description: "",
			image_url: "",
			is_active: true,
		},
	});

	// Observa URL de imagem para exibir preview dinâmico
	const imageUrlWatch = watch("image_url");

	// Carrega categorias e unidades de medida para alimentar os selects
	useEffect(() => {
		let isMounted = true;
		async function loadOptions() {
			try {
				const [cats, units] = await Promise.all([
					catalogService.getCategories(),
					catalogService.getMeasurementUnits(),
				]);
				if (isMounted) {
					setCategories(cats);
					setMeasurementUnits(units);
				}
			} catch (err) {
				console.error("Erro ao carregar opções para cadastro de produto:", err);
			}
		}
		if (open) {
			loadOptions();
		}
		return () => {
			isMounted = false;
		};
	}, [open]);

	// Hidrata ou reseta o formulário quando o modal abre ou altera o produto
	useEffect(() => {
		if (open) {
			setServerError(null);
			if (productToEdit) {
				reset({
					name: productToEdit.name,
					price: Number(productToEdit.price),
					stock: Number(productToEdit.stock),
					category_id: productToEdit.category_id || "",
					measurement_unit_id: productToEdit.measurement_unit_id || "",
					description: productToEdit.description || "",
					image_url: productToEdit.image_url || "",
					is_active: productToEdit.is_active,
				});
			} else {
				reset({
					name: "",
					price: 0,
					stock: 0,
					category_id: "",
					measurement_unit_id: "",
					description: "",
					image_url: "",
					is_active: true,
				});
			}
		}
	}, [open, productToEdit, reset]);

	const onSubmit = async (data: ProductFormData) => {
		try {
			setServerError(null);

			const payload = {
				name: data.name.trim(),
				price: Number(data.price),
				stock: Number(data.stock),
				category_id: data.category_id || null,
				measurement_unit_id: data.measurement_unit_id || null,
				description: data.description?.trim() || null,
				image_url: data.image_url?.trim() || null,
				is_active: data.is_active,
			};

			let savedProduct: Product;
			if (isEditing && productToEdit) {
				savedProduct = await sellerProductsService.updateProduct(
					productToEdit.id,
					payload,
				);
			} else {
				savedProduct = await sellerProductsService.createProduct(payload);
			}

			onSuccess(savedProduct);
			onOpenChange(false);
		} catch (err) {
			console.error("Erro ao salvar produto:", err);
			setServerError(
				"Não foi possível salvar os dados do produto. Verifique os campos e tente novamente.",
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7">
				<DialogHeader className="mb-4">
					<div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
						<Sprout className="size-5" />
						<span className="text-xs font-semibold uppercase tracking-wider">
							{isEditing ? "Atualizar Anúncio" : "Novo Alimento Fresco"}
						</span>
					</div>
					<DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
						{isEditing ? "Editar Produto" : "Cadastrar Produto"}
					</DialogTitle>
					<DialogDescription className="text-xs sm:text-sm text-muted-foreground">
						{isEditing
							? "Altere preço, estoque ou informações deste produto rural."
							: "Preencha as informações para disponibilizar este alimento no catálogo do Verdear."}
					</DialogDescription>
				</DialogHeader>

				{/* Erro de Servidor */}
				{serverError && (
					<div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center gap-2.5 mb-2">
						<AlertCircle className="size-4 shrink-0" />
						<span>{serverError}</span>
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					{/* Nome do Produto */}
					<FormInput
						label="Nome do Produto"
						placeholder="Ex: Alface Crespa Hidropônica"
						required
						error={errors.name?.message}
						{...register("name")}
					/>

					{/* Preço Unitário e Estoque */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<FormInput
							type="number"
							step="0.01"
							min="0"
							label="Preço Unitário (R$)"
							placeholder="0.00"
							required
							error={errors.price?.message}
							{...register("price", { valueAsNumber: true })}
						/>

						<FormInput
							type="number"
							step="1"
							min="0"
							label="Quantidade em Estoque"
							placeholder="0"
							required
							error={errors.stock?.message}
							{...register("stock", { valueAsNumber: true })}
						/>
					</div>

					{/* Categoria e Unidade de Medida */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<FormSelect
							label="Categoria"
							error={errors.category_id?.message}
							{...register("category_id")}
						>
							<option value="">Selecione uma categoria...</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</FormSelect>

						<FormSelect
							label="Unidade de Medida"
							error={errors.measurement_unit_id?.message}
							{...register("measurement_unit_id")}
						>
							<option value="">Selecione a unidade...</option>
							{measurementUnits.map((unit) => (
								<option key={unit.id} value={unit.id}>
									{unit.symbol ? `${unit.symbol} (${unit.name})` : unit.name}
								</option>
							))}
						</FormSelect>
					</div>

					{/* URL da Imagem com Preview */}
					<div className="flex flex-col gap-2">
						<FormInput
							type="url"
							label="URL da Imagem (Opcional)"
							placeholder="https://exemplo.com/imagem.webp"
							leftIcon={ImageIcon}
							error={errors.image_url?.message}
							{...register("image_url")}
						/>
						{imageUrlWatch && !errors.image_url && (
							<div className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/30 border border-border/40">
								<img
									src={imageUrlWatch}
									alt="Prévia do produto"
									className="size-12 rounded-xl object-cover bg-background shrink-0"
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
								/>
								<span className="text-xs text-muted-foreground truncate">
									Prévia da foto vinculada
								</span>
							</div>
						)}
					</div>

					{/* Descrição */}
					<FormTextarea
						label="Descrição do Produto (Opcional)"
						placeholder="Conte mais sobre o modo de cultivo, sabor, data de colheita ou recomendações..."
						rows={3}
						error={errors.description?.message}
						{...register("description")}
					/>

					{/* Switch de Ativação Imediata */}
					<div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-3.5">
						<div className="space-y-0.5">
							<span className="text-xs sm:text-sm font-semibold text-foreground block">
								Disponibilizar na loja imediatamente
							</span>
							<span className="text-[11px] sm:text-xs text-muted-foreground block">
								Você pode pausar a exibição do produto a qualquer momento.
							</span>
						</div>
						<Controller
							name="is_active"
							control={control}
							render={({ field }) => (
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
									aria-label="Disponibilizar na loja imediatamente"
								/>
							)}
						/>
					</div>

					{/* Rodapé com Ações */}
					<DialogFooter className="mt-4 pt-4 border-t border-border/40 flex-row gap-2 justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className="h-11 rounded-2xl px-5 text-sm font-medium"
						>
							Cancelar
						</Button>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-11 rounded-2xl px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs gap-2"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									<span>Salvando...</span>
								</>
							) : isEditing ? (
								<>
									<Save className="size-4" />
									<span>Salvar Alterações</span>
								</>
							) : (
								<>
									<Plus className="size-4" />
									<span>Cadastrar Alimento</span>
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
