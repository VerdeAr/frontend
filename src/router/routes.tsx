import { createBrowserRouter } from "react-router";
import RootLayout from "@/components/layout/RootLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
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
			{
				path: "login",
				element: <Login />,
			},
			{
				path: "cadastro",
				element: <Register />,
			},
		],
	},
]);
