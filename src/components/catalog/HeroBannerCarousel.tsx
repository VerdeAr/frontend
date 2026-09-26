import { ChevronLeft, ChevronRight, ShoppingBag, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BannerSlide {
	id: number;
	image: string;
	title: string;
	subtitle: string;
	ctaText: string;
	ctaLink: string;
	badge: string;
}

const slides: BannerSlide[] = [
	{
		id: 1,
		image: "/images/banner1.webp",
		badge: "Colheita Fresca do Dia",
		title: "Alimentos Frescos Direto da Horta",
		subtitle:
			"Compre frutas, verduras e laticínios artesanais colhidos por produtores da nossa região.",
		ctaText: "Ver Produtos",
		ctaLink: "#produtos",
	},
	{
		id: 2,
		image: "/images/banner2.webp",
		badge: "Agricultura Familiar",
		title: "Apoie os Pequenos Produtores",
		subtitle:
			"Cada compra fortalece a economia rural local e garante comida saudável na sua mesa.",
		ctaText: "Conhecer Produtores",
		ctaLink: "#produtos",
	},
	{
		id: 3,
		image: "/images/banner3.webp",
		badge: "100% Sustentável",
		title: "Sem Agrotóxicos e com Amor",
		subtitle:
			"Práticas agroecológicas que respeitam a terra, a água e a saúde de toda a sua família.",
		ctaText: "Explorar Ofertas",
		ctaLink: "#produtos",
	},
];

interface HeroBannerCarouselProps {
	className?: string;
}

export function HeroBannerCarousel({ className }: HeroBannerCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	useEffect(() => {
		if (isPaused) return;

		const timer = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % slides.length);
		}, 5500);

		return () => clearInterval(timer);
	}, [isPaused]);

	const prevSlide = () => {
		setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
	};

	const nextSlide = () => {
		setCurrentIndex((prev) => (prev + 1) % slides.length);
	};

	return (
		<section
			className={cn(
				"relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm bg-muted/40 aspect-video sm:aspect-21/9 min-h-60 sm:min-h-85 max-h-115 select-none group",
				className,
			)}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			aria-label="Carrossel de Destaques"
		>
			{/* Slides */}
			{slides.map((slide, index) => {
				const isActive = index === currentIndex;
				return (
					<div
						key={slide.id}
						className={cn(
							"absolute inset-0 transition-opacity duration-700 ease-in-out",
							isActive
								? "opacity-100 z-10"
								: "opacity-0 z-0 pointer-events-none",
						)}
					>
						{/* Background Image */}
						<img
							src={slide.image}
							alt={slide.title}
							className="h-full w-full object-cover"
							loading={index === 0 ? "eager" : "lazy"}
						/>

						{/* Gradient Overlay for Readability */}
						<div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />

						{/* Content */}
						<div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-xl sm:max-w-2xl text-white">
							<span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-emerald-500/90 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 shadow-xs">
								<Sprout className="size-3.5" />
								{slide.badge}
							</span>

							<h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-1.5 sm:mb-3 text-balance">
								{slide.title}
							</h2>

							<p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 font-normal leading-relaxed">
								{slide.subtitle}
							</p>

							<div>
								<a
									href={slide.ctaLink}
									className={cn(
										buttonVariants({ size: "lg" }),
										"h-11 sm:h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all gap-2 inline-flex items-center justify-center",
									)}
								>
									<ShoppingBag className="size-4" />
									{slide.ctaText}
								</a>
							</div>
						</div>
					</div>
				);
			})}

			{/* Manual Navigation Arrows */}
			<button
				type="button"
				onClick={prevSlide}
				className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
				aria-label="Slide anterior"
			>
				<ChevronLeft className="size-5" />
			</button>

			<button
				type="button"
				onClick={nextSlide}
				className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
				aria-label="Próximo slide"
			>
				<ChevronRight className="size-5" />
			</button>

			{/* Dots Indicator */}
			<div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
				{slides.map((slide, idx) => (
					<button
						key={slide.id}
						type="button"
						onClick={() => setCurrentIndex(idx)}
						className={cn(
							"h-2 rounded-full transition-all duration-300",
							idx === currentIndex
								? "w-6 bg-emerald-400"
								: "w-2 bg-white/50 hover:bg-white/80",
						)}
						aria-label={`Ir para slide ${idx + 1}`}
					/>
				))}
			</div>
		</section>
	);
}
