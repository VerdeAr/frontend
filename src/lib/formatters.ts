export function formatBRL(value: number | string | null | undefined): string {
	const numeric = typeof value === "number" ? value : Number(value || 0);
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(Number.isNaN(numeric) ? 0 : numeric);
}

export function formatStock(
	stock: number | string | null | undefined,
	unitSymbol?: string | null,
): string {
	const numeric = typeof stock === "number" ? stock : Number(stock || 0);
	const formatted = Number.isInteger(numeric)
		? numeric.toString()
		: numeric.toFixed(2).replace(".", ",");

	return unitSymbol ? `${formatted} ${unitSymbol}` : formatted;
}
