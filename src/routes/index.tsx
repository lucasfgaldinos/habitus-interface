import { createBrowserRouter } from "react-router-dom";
import { Auth, Habits, Login } from "../screens";
import { FocusTime } from "../screens/focus-time";
import { PrivateRoute } from "./private-route";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <PrivateRoute component={<Habits />} />,
	},
	{
		path: "/focus-time",
		element: <PrivateRoute component={<FocusTime />} />,
	},
	{
		path: "/",
		element: <PrivateRoute component={<Habits />} />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/auth",
		element: <Auth />,
	},
]);
