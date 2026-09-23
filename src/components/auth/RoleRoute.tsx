import { Loader2 } from "lucide-react";
import type * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/stores";
import type { UserRole } from "@/types";

interface RoleRouteProps {
	allowedRoles: UserRole[];
	children?: React.ReactNode;
	redirectTo?: string;
}

export function RoleRoute({
	allowedRoles,
	children,
	redirectTo = "/",
}: RoleRouteProps) {
	const location = useLocation();
	const { user, isAuthenticated, isLoading } = useAuthStore();

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

	if (!user || !allowedRoles.includes(user.role)) {
		return <Navigate to={redirectTo} replace />;
	}

	return children ?? <Outlet />;
}
