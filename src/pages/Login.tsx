import { useEffect } from "react";
import { useNavigate } from "react-router";
import { LoginForm } from "@/components/auth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores";

export default function Login() {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	return (
		<div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-8 sm:px-6">
			<Card className="w-full max-w-md shadow-sm border-border">
				<CardHeader className="text-center sm:text-left space-y-1">
					<CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
						Acesse sua conta
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">
						Entre com seu e-mail e senha cadastrados para continuar no Verdear.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</div>
	);
}
