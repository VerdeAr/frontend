import axios from "axios";

export interface RoutePoint {
	lat: number;
	lng: number;
	label?: string;
}

export interface ShippingCalculationParams {
	origin?: RoutePoint;
	destination?: RoutePoint;
	neighborhoodName?: string;
	destinationAddress?: string;
	baseFee?: number;
	pricePerKm?: number;
}

export interface ShippingCalculationResult {
	baseFee: number;
	pricePerKm: number;
	distanceKm: number;
	durationMinutes: number;
	totalPrice: number;
	origin: RoutePoint;
	destination: RoutePoint;
	routeCoordinates: [number, number][]; // [lat, lng][] para Leaflet Polyline
	isFallback: boolean;
}

// Configurações padrão de frete dinâmico
export const DEFAULT_BASE_FEE = 5.0; // R$ 5,00 de taxa base de manuseio/despacho
export const DEFAULT_PRICE_PER_KM = 1.5; // R$ 1,50 por km rodado

// Coordenadas de referência padrão (Propriedade Rural em Cornélio Procópio / Região Norte do Paraná)
export const DEFAULT_PRODUCER_COORDINATES: RoutePoint = {
	lat: -23.155,
	lng: -50.615,
	label: "Propriedade Rural (Origem)",
};

export const DEFAULT_BUYER_COORDINATES: RoutePoint = {
	lat: -23.1818,
	lng: -50.6475,
	label: "Endereço de Entrega (Destino)",
};

// Coordenadas conhecidas dos bairros de Cornélio Procópio (PR) para localização instantânea
const NEIGHBORHOOD_COORDINATES: Record<string, [number, number]> = {
	centro: [-23.1818, -50.6475],
	"jardim primavera": [-23.1762, -50.638],
	"vila independencia": [-23.1905, -50.655],
	"conjunto habitacional sibim": [-23.171, -50.662],
	"jardim panorama": [-23.195, -50.635],
	"vila nova": [-23.187, -50.641],
	"jardim bandeirantes": [-23.179, -50.66],
	"parque universitario": [-23.167, -50.652],
	"zona rural": [-23.148, -50.608],
};

function normalizeString(str: string): string {
	return str
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim();
}

/**
 * Identifica coordenadas estimadas para um bairro ou endereço.
 */
export function resolveDestinationCoordinates(
	neighborhoodName?: string,
	destinationAddress?: string,
): RoutePoint {
	if (neighborhoodName) {
		const normalized = normalizeString(neighborhoodName);
		for (const [key, coords] of Object.entries(NEIGHBORHOOD_COORDINATES)) {
			if (normalized.includes(key) || key.includes(normalized)) {
				return {
					lat: coords[0],
					lng: coords[1],
					label: neighborhoodName,
				};
			}
		}
	}

	if (destinationAddress) {
		const normalized = normalizeString(destinationAddress);
		for (const [key, coords] of Object.entries(NEIGHBORHOOD_COORDINATES)) {
			if (normalized.includes(key)) {
				return {
					lat: coords[0],
					lng: coords[1],
					label: destinationAddress,
				};
			}
		}
	}

	return {
		...DEFAULT_BUYER_COORDINATES,
		label:
			neighborhoodName || destinationAddress || DEFAULT_BUYER_COORDINATES.label,
	};
}

/**
 * Calcula a distância em KM entre dois pontos pela fórmula de Haversine com fator de correção viária (1.25x).
 */
export function calculateGeodesicDistanceKm(
	from: RoutePoint,
	to: RoutePoint,
): number {
	const earthRadiusKm = 6371;
	const dLat = ((to.lat - from.lat) * Math.PI) / 180;
	const dLng = ((to.lng - from.lng) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((from.lat * Math.PI) / 180) *
			Math.cos((to.lat * Math.PI) / 180) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const straightDistance = earthRadiusKm * c;

	// Aplica fator de sinuosidade médio de rodovias e vias urbanas (25%)
	const drivingDistance = straightDistance * 1.25;
	return Math.max(1, Math.round(drivingDistance * 10) / 10);
}

/**
 * Gera rota interpolada entre a origem e o destino quando a API externa não estiver disponível.
 */
function generateFallbackRoute(
	origin: RoutePoint,
	destination: RoutePoint,
): [number, number][] {
	const points: [number, number][] = [];
	const steps = 6;

	for (let i = 0; i <= steps; i++) {
		const progress = i / steps;
		// Pequena deflexão para simular curva da estrada
		const curveDeviation =
			i > 0 && i < steps ? Math.sin(progress * Math.PI) * 0.003 : 0;

		const lat =
			origin.lat + (destination.lat - origin.lat) * progress + curveDeviation;
		const lng =
			origin.lng + (destination.lng - origin.lng) * progress + curveDeviation;
		points.push([lat, lng]);
	}

	return points;
}

interface OrsDirectionsResponse {
	features?: Array<{
		geometry?: {
			coordinates?: [number, number][]; // [lon, lat]
		};
		properties?: {
			summary?: {
				distance?: number; // metros
				duration?: number; // segundos
			};
		};
	}>;
}

export const shippingService = {
	/**
	 * Calcula o frete dinâmico baseado na rota de condução via OpenRouteService API
	 * Fórmula: Taxa Base + (Distância em KM * Preço por KM)
	 */
	async calculateShipping(
		params: ShippingCalculationParams = {},
	): Promise<ShippingCalculationResult> {
		const origin = params.origin || DEFAULT_PRODUCER_COORDINATES;
		const destination =
			params.destination ||
			resolveDestinationCoordinates(
				params.neighborhoodName,
				params.destinationAddress,
			);

		const baseFee =
			typeof params.baseFee === "number" && params.baseFee >= 0
				? params.baseFee
				: DEFAULT_BASE_FEE;
		const pricePerKm =
			typeof params.pricePerKm === "number" && params.pricePerKm > 0
				? params.pricePerKm
				: DEFAULT_PRICE_PER_KM;

		const apiKey =
			import.meta.env.VITE_ORS_API_KEY ||
			import.meta.env.VITE_OPENROUTESERVICE_API_KEY;

		if (apiKey) {
			try {
				// OpenRouteService espera coordenadas no formato [longitude, latitude]
				const response = await axios.post<OrsDirectionsResponse>(
					"https://api.openrouteservice.org/v2/directions/driving-car/geojson",
					{
						coordinates: [
							[origin.lng, origin.lat],
							[destination.lng, destination.lat],
						],
					},
					{
						headers: {
							Authorization: apiKey,
							"Content-Type": "application/json",
						},
						timeout: 5000,
					},
				);

				const feature = response.data.features?.[0];
				const summary = feature?.properties?.summary;
				const geometryCoords = feature?.geometry?.coordinates;

				if (summary?.distance && geometryCoords && geometryCoords.length > 0) {
					const distanceKm = Math.round((summary.distance / 1000) * 10) / 10;
					const durationMinutes = Math.round((summary.duration || 0) / 60);

					// Converte coordenadas GeoJSON [lon, lat] para [lat, lon] do Leaflet
					const routeCoordinates: [number, number][] = geometryCoords.map(
						([lon, lat]) => [lat, lon],
					);

					// Aplica a fórmula oficial do frete dinâmico: Taxa Base + (Distância * Preço por KM)
					const totalPrice =
						Math.round((baseFee + distanceKm * pricePerKm) * 100) / 100;

					return {
						baseFee,
						pricePerKm,
						distanceKm,
						durationMinutes,
						totalPrice,
						origin,
						destination,
						routeCoordinates,
						isFallback: false,
					};
				}
			} catch (error) {
				console.warn(
					"OpenRouteService indisponível ou limite atingido. Utilizando estimativa por coordenadas:",
					error,
				);
			}
		}

		// Fallback resiliente: estimativa com Haversine e traçado de linha
		const distanceKm = calculateGeodesicDistanceKm(origin, destination);
		const durationMinutes = Math.round((distanceKm / 40) * 60) + 5; // Estimativa média de 40 km/h em vias rurais/urbanas
		const totalPrice =
			Math.round((baseFee + distanceKm * pricePerKm) * 100) / 100;
		const routeCoordinates = generateFallbackRoute(origin, destination);

		return {
			baseFee,
			pricePerKm,
			distanceKm,
			durationMinutes,
			totalPrice,
			origin,
			destination,
			routeCoordinates,
			isFallback: true,
		};
	},
};
