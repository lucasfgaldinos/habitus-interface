import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../hooks/use-user";
import styles from "./styles.module.css";

export function Auth() {
	const navigate = useNavigate();
	const searchParams = useSearchParams();
	const { getUserData } = useUser();

	async function handleAuth() {
		await getUserData(String(searchParams[0].get("code")));

		navigate("/");
	}

	useEffect(() => {
		handleAuth();
	}, []);

	return (
		<div className={styles.container}>
			<div>
				<h1>Autenticando</h1>
				<div className={styles.loading} />
			</div>
		</div>
	);
}
