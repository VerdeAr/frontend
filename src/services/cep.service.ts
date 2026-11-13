import axios from "axios";

export interface ViaCepAddress {
	cep: string;
	logradouro: string;
	complemento: string;
	bairro: string;
	localidade: string;
	uf: string;
	ibge?: string;
	gia?: string;
	ddd?: string;
	siafi?: string;
}

interface ViaCepRawResponse {
	cep?: string;
	logradouro?: string;
	complemento?: string;
	bairro?: string;
	localidade?: string;
	uf?: string;
	ibge?: string;
	gia?: string;
	ddd?: string;
	siafi?: string;
	erro?: boolean | string;
}

export const cepService = {
	/**
	 * Consulta endereço a partir de um CEP na API pública do ViaCEP.
	 * Retorna null em caso de CEP inexistente, formato inválido ou falha de rede.
	 */
	async getAddressByCep(cep: string): Promise<ViaCepAddress | null> {
		const cleanCep = cep.replace(/\D/g, "");
		if (cleanCep.length !== 8) {
			return null;
		}

		try {
			const response = await axios.get<ViaCepRawResponse>(
				`https://viacep.com.br/ws/${cleanCep}/json/`,
				{ timeout: 8000 },
			);

			if (response.data.erro === true || response.data.erro === "true") {
				return null;
			}

			if (!response.data.cep) {
				return null;
			}

			return {
				cep: response.data.cep,
				logradouro: response.data.logradouro || "",
				complemento: response.data.complemento || "",
				bairro: response.data.bairro || "",
				localidade: response.data.localidade || "",
				uf: response.data.uf || "",
				ibge: response.data.ibge,
				gia: response.data.gia,
				ddd: response.data.ddd,
				siafi: response.data.siafi,
			};
		} catch {
			return null;
		}
	},
};
