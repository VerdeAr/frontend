import { Lock, Sprout, Truck, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
	PasswordChangeForm,
	ProfileDataForm,
	SellerShippingForm,
} from "@/components/account";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";

type AccountTab = "profile" | "security" | "shipping";

export default function AccountSettingsPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const [activeTab, setActiveTab] = useState<AccountTab>("profile");

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	if (!isAuthenticated || !user) {
		return null;
	}

	const isSeller = user.role === "VENDEDOR";

	const tabs = [
		{
			id: "profile" as AccountTab,
			label: "Dados Cadastrais",
			icon: UserIcon,
		},
		{
			id: "security" as AccountTab,
			label: "Segurança e Senha",
			icon: Lock,
		},
		...(isSeller
			? [
					{
						id: "shipping" as AccountTab,
						label: "Frete e Entrega",
						icon: Truck,
					},
				]
			: []),
	];

	return (
		<div className="relative min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6 lg:px-8">
			{/* Subtle Ambient Glow */}
			<div
				className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-80 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl"
				aria-hidden="true"
			/>

			<div className="mx-auto max-w-4xl flex flex-col gap-8">
				{/* Account Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
					<div className="flex items-center gap-4">
						<div className="size-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xl select-none shadow-xs">
							{user.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
								{user.name}
							</h1>
							<p className="text-sm text-muted-foreground">{user.email}</p>
						</div>
					</div>

					<div className="flex items-center gap-2 self-start sm:self-auto">
						<span
							className={cn(
								"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none",
								isSeller
									? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
									: "bg-muted text-muted-foreground border border-border/60",
							)}
						>
							{isSeller ? (
								<>
									<Sprout className="size-3.5" />
									Produtor Rural
								</>
							) : (
								"Consumidor"
							)}
						</span>
					</div>
				</div>

				{/* Tabs Navigation (Mobile Scrollable) */}
				<div className="flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto no-scrollbar">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"h-11 px-4 flex items-center gap-2 text-sm font-medium border-b-2 transition-all select-none whitespace-nowrap -mb-px",
									isActive
										? "border-primary text-foreground font-semibold"
										: "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
								)}
							>
								<Icon className={cn("size-4", isActive && "text-primary")} />
								<span>{tab.label}</span>
							</button>
						);
					})}
				</div>

				{/* Tab Content Panel (Decoupled Form Subcomponents) */}
				<div className="bg-card/50 backdrop-blur-sm sm:border sm:border-border/60 sm:rounded-3xl sm:p-8 sm:shadow-xs">
					{activeTab === "profile" && <ProfileDataForm />}
					{activeTab === "security" && <PasswordChangeForm />}
					{activeTab === "shipping" && isSeller && <SellerShippingForm />}
				</div>
			</div>
		</div>
	);
}
