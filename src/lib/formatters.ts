import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export function formatDate(
	dateString: string | Date | null | undefined,
): string {
	if (!dateString) return "";
	const date =
		typeof dateString === "string" ? new Date(dateString) : dateString;
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(date);
}

// Horário curto exibido no balão da mensagem (ex.: 14:32)
export function formatChatTime(
	dateString: string | Date | null | undefined,
): string {
	if (!dateString) return "";
	return format(new Date(dateString), "HH:mm", { locale: ptBR });
}

// Data da última mensagem na caixa de entrada: hora se hoje, "Ontem" ou dd/MM/yy
export function formatChatListDate(
	dateString: string | Date | null | undefined,
): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	if (isToday(date)) return format(date, "HH:mm", { locale: ptBR });
	if (isYesterday(date)) return "Ontem";
	return format(date, "dd/MM/yy", { locale: ptBR });
}
