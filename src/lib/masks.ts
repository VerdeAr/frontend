export function maskCpf(value: string): string {
	return value
		.replace(/\D/g, "")
		.slice(0, 11)
		.replace(/(\d{3})(\d)/, "$1.$2")
		.replace(/(\d{3})(\d)/, "$1.$2")
		.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCnpj(value: string): string {
	return value
		.replace(/\D/g, "")
		.slice(0, 14)
		.replace(/(\d{2})(\d)/, "$1.$2")
		.replace(/(\d{3})(\d)/, "$1.$2")
		.replace(/(\d{3})(\d)/, "$1/$2")
		.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value: string): string {
	const clean = value.replace(/\D/g, "").slice(0, 11);
	if (clean.length > 10) {
		return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
	}
	if (clean.length > 6) {
		return clean.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
	}
	if (clean.length > 2) {
		return clean.replace(/(\d{2})(\d{0,5})/, "($1) $2");
	}
	return clean;
}

export function unmask(value: string): string {
	return value.replace(/\D/g, "");
}
