import { Loader2 } from "lucide-react";
import type * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/stores";

interface ProtectedRouteProps {
	children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const location = useLocation();
	const { isAuthenticated, isLoading } = useAuthStore();

	if (isLoading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return children ?? <Outlet />;
}
