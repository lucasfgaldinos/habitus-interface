import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { api } from "../services/api";

type UserData = {
	id: string;
	name: string;
	avatarUrl: string;
	token: string;
};

type UserContextProps = {
	getUserData: (githubCode: string) => Promise<void>;
	userData: UserData;
	logout: () => void;
};

type UserProviderProps = {
	children: ReactNode;
};

export const userLocalStorageKey = `${import.meta.env.VITE_LOCALSTORAGE_KEY}:userData`;

const UserContext = createContext<UserContextProps>({} as UserContextProps);

export function UserProvider({ children }: UserProviderProps) {
	const [userData, setUserData] = useState<UserData>({} as UserData);

	function putUserData(data: UserData) {
		setUserData(data);
		localStorage.setItem("habitus:userData", JSON.stringify(data));
	}

	async function getUserData(githubCode: string) {
		const { data } = await api.get<UserData>("/auth/callback", {
			params: { code: githubCode },
		});

		putUserData(data);
	}

	function loadLocalStorageData() {
		const localData = localStorage.getItem(userLocalStorageKey);

		if (localData) {
			setUserData(JSON.parse(localData));
		}
	}

	useEffect(() => {
		loadLocalStorageData();
	}, []);

	function logout() {
		setUserData({} as UserData);

		localStorage.removeItem(userLocalStorageKey);
	}

	return (
		<UserContext.Provider value={{ getUserData, userData, logout }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);

	if (!context) {
		throw new Error("useUser must be used with UserContext.");
	}

	return context;
}
