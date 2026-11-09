import L from "leaflet";
import { Clock, Navigation, Truck } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
	MapContainer,
	Marker,
	Polyline,
	Popup,
	TileLayer,
	useMap,
} from "react-leaflet";
import { cn } from "@/lib/utils";
import type { RoutePoint } from "@/services/shipping.service";

export interface DeliveryRouteMapProps {
	origin?: RoutePoint;
	destination?: RoutePoint;
	routeCoordinates?: [number, number][];
	distanceKm?: number;
	durationMinutes?: number;
	className?: string;
	showInfoOverlay?: boolean;
}

// Marcador estilizado da Origem (Produtor Rural)
const originIcon = L.divIcon({
	className: "custom-origin-marker",
	html: `
		<div style="
			background: linear-gradient(135deg, #059669, #10b981);
			width: 34px;
			height: 34px;
			border-radius: 50%;
			border: 2.5px solid #ffffff;
			box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
			font-size: 16px;
		">
			🌱
		</div>
	`,
	iconSize: [34, 34],
	iconAnchor: [17, 34],
	popupAnchor: [0, -34],
});

// Marcador estilizado do Destino (Comprador)
const destinationIcon = L.divIcon({
	className: "custom-dest-marker",
	html: `
		<div style="
			background: linear-gradient(135deg, #2563eb, #3b82f6);
			width: 34px;
			height: 34px;
			border-radius: 50%;
			border: 2.5px solid #ffffff;
			box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
			font-size: 16px;
		">
			📍
		</div>
	`,
	iconSize: [34, 34],
	iconAnchor: [17, 34],
	popupAnchor: [0, -34],
});

// Componente interno para enquadrar automaticamente a rota na tela
function BoundsFitter({ points }: { points: [number, number][] }) {
	const map = useMap();

	useEffect(() => {
		if (points.length < 2) return;
		try {
			const bounds = L.latLngBounds(points);
			map.fitBounds(bounds, {
				padding: [35, 35],
				maxZoom: 15,
			});
		} catch {
			// Enquadramento silencioso se mapa ainda estiver inicializando
		}
	}, [map, points]);

	return null;
}

export function DeliveryRouteMap({
	origin,
	destination,
	routeCoordinates,
	distanceKm,
	durationMinutes,
	className,
	showInfoOverlay = true,
}: DeliveryRouteMapProps) {
	// Monta pontos de apoio e centro do mapa
	const originPos: [number, number] = useMemo(
		() => [origin?.lat ?? -23.155, origin?.lng ?? -50.615],
		[origin?.lat, origin?.lng],
	);

	const destPos: [number, number] = useMemo(
		() => [destination?.lat ?? -23.1818, destination?.lng ?? -50.6475],
		[destination?.lat, destination?.lng],
	);

	const effectiveRoute = useMemo(() => {
		if (routeCoordinates && routeCoordinates.length >= 2) {
			return routeCoordinates;
		}
		return [originPos, destPos];
	}, [routeCoordinates, originPos, destPos]);

	const centerLat = (originPos[0] + destPos[0]) / 2;
	const centerLng = (originPos[1] + destPos[1]) / 2;

	return (
		<div
			className={cn(
				"relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-muted/20 shadow-xs",
				className || "h-64 sm:h-72",
			)}
		>
			<MapContainer
				center={[centerLat, centerLng]}
				zoom={12}
				scrollWheelZoom={false}
				className="h-full w-full z-0"
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				<BoundsFitter points={effectiveRoute} />

				{/* Marcador de Origem (Propriedade Rural) */}
				<Marker position={originPos} icon={originIcon}>
					<Popup>
						<div className="text-xs font-sans">
							<strong className="block text-emerald-700">Origem:</strong>
							<span>{origin?.label || "Propriedade Rural"}</span>
						</div>
					</Popup>
				</Marker>

				{/* Marcador de Destino (Comprador) */}
				<Marker position={destPos} icon={destinationIcon}>
					<Popup>
						<div className="text-xs font-sans">
							<strong className="block text-blue-700">Destino:</strong>
							<span>{destination?.label || "Endereço de Entrega"}</span>
						</div>
					</Popup>
				</Marker>

				{/* Linha da Rota Traçada */}
				<Polyline
					positions={effectiveRoute}
					pathOptions={{
						color: "#10b981",
						weight: 4,
						opacity: 0.85,
						dashArray: "8, 6",
					}}
				/>
			</MapContainer>

			{/* Overlay informativo da rota (Distância e Duração) */}
			{showInfoOverlay &&
				(distanceKm !== undefined || durationMinutes !== undefined) && (
					<div className="absolute top-3 left-3 z-1000 flex flex-wrap items-center gap-2 rounded-xl bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-md border border-border/60">
						<div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
							<Truck className="size-3.5" />
							<span>Rota de Entrega</span>
						</div>

						{distanceKm !== undefined && (
							<div className="flex items-center gap-1 text-muted-foreground border-l border-border/60 pl-2">
								<Navigation className="size-3" />
								<span>{distanceKm} km</span>
							</div>
						)}

						{durationMinutes !== undefined && (
							<div className="flex items-center gap-1 text-muted-foreground border-l border-border/60 pl-2">
								<Clock className="size-3" />
								<span>~{durationMinutes} min</span>
							</div>
						)}
					</div>
				)}

			{/* Legenda rápida inferior */}
			<div className="absolute bottom-2 right-2 z-1000 hidden sm:flex items-center gap-3 rounded-lg bg-background/85 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-xs border border-border/50">
				<div className="flex items-center gap-1">
					<span className="size-2 rounded-full bg-emerald-500" />
					<span>Origem (Produtor)</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="size-2 rounded-full bg-blue-500" />
					<span>Destino</span>
				</div>
			</div>
		</div>
	);
}
