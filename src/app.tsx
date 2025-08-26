import { RouterProvider } from "react-router-dom";
import { UserProvider } from "./hooks/use-user";
import { router } from "./routes";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { DatesProvider } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

export function App() {
	return (
		<UserProvider>
			<MantineProvider>
				<DatesProvider settings={{ locale: "pt-BR" }}>
					<RouterProvider router={router} />
				</DatesProvider>
			</MantineProvider>
		</UserProvider>
	);
}
