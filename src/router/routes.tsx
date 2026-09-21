import { createBrowserRouter } from "react-router";
import RootLayout from "@/components/layout/RootLayout";
import Home from "@/pages/Home";
import { homeLoader } from "./loaders";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <Home />,
				loader: homeLoader,
			},
		],
	},
]);
