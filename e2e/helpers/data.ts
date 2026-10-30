import { randomUUID } from "node:crypto";
import { cpf } from "cpf-cnpj-validator";

export interface TestUser {
	name: string;
	email: string;
	password: string;
	/** Apenas dígitos; a máscara é aplicada pelo campo da interface. */
	cpf: string;
	phone: string;
	address: string;
}

export interface TestSeller extends TestUser {
	/** CNPJ numérico válido, apenas dígitos. */
	cnpj: string;
	farmName: string;
	description: string;
}

// O gerador da biblioteca produz CNPJ alfanumérico, que a API ainda não aceita (ela só
// considera dígitos). Por isso o CNPJ numérico válido é gerado aqui.
function generateNumericCnpj(): string {
	const digits = Array.from({ length: 8 }, () =>
		Math.floor(Math.random() * 10),
	).concat([0, 0, 0, 1]);

	const checkDigit = (base: number[], weights: number[]) => {
		const sum = base.reduce(
			(acc, digit, index) => acc + digit * weights[index],
			0,
		);
		const remainder = sum % 11;
		return remainder < 2 ? 0 : 11 - remainder;
	};

	digits.push(checkDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));
	digits.push(checkDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]));

	return digits.join("");
}

/** Sufixo curto e único, para que cada execução use dados novos e o banco não precise ser limpo. */
export function uniqueSuffix(): string {
	return randomUUID().slice(0, 8);
}

/** Cliente com endereço, porque o checkout bloqueia a entrega sem endereço no perfil. */
export function buildCustomer(suffix = uniqueSuffix()): TestUser {
	return {
		name: `Cliente E2E ${suffix}`,
		email: `cliente.${suffix}@teste.verdear.dev`,
		password: "senha-teste-123",
		cpf: cpf.generate(),
		phone: "43999998888",
		address: `Rua das Flores, 123 (${suffix})`,
	};
}

export function buildSeller(suffix = uniqueSuffix()): TestSeller {
	return {
		name: `Vendedor E2E ${suffix}`,
		email: `vendedor.${suffix}@teste.verdear.dev`,
		password: "senha-teste-123",
		cpf: cpf.generate(),
		phone: "43999997777",
		address: `Sítio Bela Vista, km 5 (${suffix})`,
		cnpj: generateNumericCnpj(),
		farmName: `Fazenda E2E ${suffix}`,
		description: "Produtor criado pelos testes E2E",
	};
}
