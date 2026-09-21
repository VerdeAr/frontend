import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { CookiesProvider } from "react-cookie";
import { RouterProvider } from "react-router";
import { router } from "./router/routes";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<CookiesProvider>
			<RouterProvider router={router} />
		</CookiesProvider>
	</StrictMode>,
);
