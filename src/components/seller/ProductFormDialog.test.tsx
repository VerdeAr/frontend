import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductFormDialog } from "@/components/seller/ProductFormDialog";
import { catalogService } from "@/services/catalog.service";
import { sellerProductsService } from "@/services/seller-products.service";
import { uploadService } from "@/services/upload.service";
import type { Product } from "@/types";

vi.mock("@/services/catalog.service", () => ({
	catalogService: {
		getCategories: vi.fn(),
		getMeasurementUnits: vi.fn(),
	},
}));

vi.mock("@/services/seller-products.service", () => ({
	sellerProductsService: {
		createProduct: vi.fn(),
		updateProduct: vi.fn(),
	},
}));

vi.mock("@/services/upload.service", () => ({
	uploadService: {
		validateImage: vi.fn(),
		uploadImage: vi.fn(),
	},
}));

const mockProduct: Product = {
	id: "prod-1",
	seller_id: "seller-1",
	category_id: "cat-1",
	measurement_unit_id: "unit-1",
	name: "Tomate Orgânico",
	price: 8.5,
	stock: 20,
	description: "Tomates frescos colhidos no dia.",
	image_url: "https://cdn.verdear.com.br/produtos/tomate.jpg",
	is_active: true,
	created_at: "2026-11-01T10:00:00Z",
	updated_at: "2026-11-01T10:00:00Z",
};

describe("ProductFormDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.URL.createObjectURL = vi.fn(() => "blob:http://localhost/preview");
		window.URL.revokeObjectURL = vi.fn();
		vi.mocked(catalogService.getCategories).mockResolvedValue([
			{ id: "cat-1", name: "Verduras" },
		]);
		vi.mocked(catalogService.getMeasurementUnits).mockResolvedValue([
			{ id: "unit-1", name: "Quilo", symbol: "kg" },
		]);
	});

	it("renderiza modal de cadastro com área de foto e campos principais", async () => {
		render(
			<ProductFormDialog
				open={true}
				onOpenChange={vi.fn()}
				onSuccess={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Cadastrar Produto" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText(/Nome do Produto/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Área para envio da foto/i }),
		).toBeInTheDocument();
	});

	it("carrega imagem do produto quando em modo de edição", () => {
		render(
			<ProductFormDialog
				open={true}
				onOpenChange={vi.fn()}
				productToEdit={mockProduct}
				onSuccess={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Editar Produto" }),
		).toBeInTheDocument();
		const img = screen.getByRole("img", {
			name: /Prévia da imagem do produto/i,
		});
		expect(img).toHaveAttribute(
			"src",
			"https://cdn.verdear.com.br/produtos/tomate.jpg",
		);
	});

	it("permite upload de nova imagem e salva produto com a URL retornada", async () => {
		const user = userEvent.setup();
		const handleSuccess = vi.fn();
		const handleOpenChange = vi.fn();

		vi.mocked(uploadService.validateImage).mockReturnValue({ valid: true });
		vi.mocked(uploadService.uploadImage).mockResolvedValueOnce(
			"https://cdn.verdear.com.br/produtos/alface-nova.webp",
		);

		vi.mocked(sellerProductsService.createProduct).mockResolvedValueOnce({
			...mockProduct,
			id: "prod-2",
			name: "Alface Americana",
			image_url: "https://cdn.verdear.com.br/produtos/alface-nova.webp",
		});

		render(
			<ProductFormDialog
				open={true}
				onOpenChange={handleOpenChange}
				onSuccess={handleSuccess}
			/>,
		);

		// Preenche campos obrigatórios
		await user.type(
			screen.getByLabelText(/Nome do Produto/i),
			"Alface Americana",
		);
		await user.type(screen.getByLabelText(/Preço Unitário/i), "5.50");
		await user.type(screen.getByLabelText(/Quantidade em Estoque/i), "15");

		// Realiza upload de foto
		const fileInput = screen.getByTestId("image-upload-input");
		const file = new File(["alface-img"], "alface.png", { type: "image/png" });
		fireEvent.change(fileInput, { target: { files: [file] } });

		await waitFor(() => {
			expect(uploadService.uploadImage).toHaveBeenCalled();
		});

		// Submete formulário
		const submitBtn = screen.getByRole("button", {
			name: /Cadastrar Alimento/i,
		});
		await user.click(submitBtn);

		await waitFor(() => {
			expect(sellerProductsService.createProduct).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "Alface Americana",
					image_url: "https://cdn.verdear.com.br/produtos/alface-nova.webp",
				}),
			);
			expect(handleSuccess).toHaveBeenCalled();
			expect(handleOpenChange).toHaveBeenCalledWith(false);
		});
	});

	it("permite exibir campo manual de URL externa", async () => {
		const user = userEvent.setup();

		render(
			<ProductFormDialog
				open={true}
				onOpenChange={vi.fn()}
				onSuccess={vi.fn()}
			/>,
		);

		const toggleBtn = screen.getByRole("button", {
			name: /Ou colar URL de imagem externa/i,
		});
		await user.click(toggleBtn);

		expect(
			screen.getByPlaceholderText("https://exemplo.com/imagem.webp"),
		).toBeInTheDocument();
	});
});
