import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AppContainer, SideBar } from "../components";
import { userLocalStorageKey } from "../hooks/use-user";

type PrivateRouteProps = {
	component: ReactNode;
};

export function PrivateRoute({ component }: PrivateRouteProps) {
	const userData = localStorage.getItem(userLocalStorageKey);

	if (!userData) {
		return <Navigate to="/login" />;
	}

	return (
		<AppContainer>
			<SideBar />
			{component}
		</AppContainer>
	);
}
