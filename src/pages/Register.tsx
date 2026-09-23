import { useEffect } from "react";
import { useNavigate } from "react-router";
import { RegisterForm } from "@/components/auth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores";

export default function Register() {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	return (
		<div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-8 sm:px-6">
			<Card className="w-full max-w-xl shadow-sm border-border">
				<CardHeader className="text-center sm:text-left space-y-1">
					<CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
						Crie sua conta
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">
						Junte-se à comunidade do Verdear. Compre produtos frescos ou venda
						sua colheita diretamente ao consumidor.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<RegisterForm />
				</CardContent>
			</Card>
		</div>
	);
}
