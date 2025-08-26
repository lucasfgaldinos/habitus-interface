import { ListChecksIcon, SignOutIcon, TimerIcon } from "@phosphor-icons/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/use-user";
import styles from "./styles.module.css";

export function SideBar() {
	const { userData, logout } = useUser();
	const navigate = useNavigate();
	const { pathname } = useLocation();

	function handleLogout() {
		logout();

		navigate("/login");
	}

	return (
		<div className={styles.container}>
			<div className={styles.menu}>
				<div className={styles.image}>
					<img src={userData.avatarUrl} alt={userData.name} />
				</div>

				<div className={styles.links}>
					<Link to="/" className={pathname === "/" ? styles.active : undefined}>
						<ListChecksIcon />
					</Link>

					<Link
						to="/focus-time"
						className={pathname === "/focus-time" ? styles.active : undefined}
					>
						<TimerIcon />
					</Link>
				</div>

				<div className={styles.logout}>
					<button type="button" onClick={handleLogout}>
						<SignOutIcon />
					</button>
				</div>
			</div>
		</div>
	);
}
