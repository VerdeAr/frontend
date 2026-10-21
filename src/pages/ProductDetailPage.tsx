import { useLoaderData } from "react-router";
import type { ProductDetailLoaderData } from "@/router/loaders";

export default function ProductDetailPage() {
	const { product, error } = useLoaderData<ProductDetailLoaderData>();

	return (
		<div className="container mx-auto px-4 py-8">
			{error ? (
				<p>{error}</p>
			) : (
				<h1 className="text-xl font-bold">{product?.name}</h1>
			)}
		</div>
	);
}
