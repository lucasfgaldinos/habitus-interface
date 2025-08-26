import clsx from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

type ButtonProps = ComponentProps<"button"> & {
	cancelType?: boolean;
};

export function Button({
	children,
	disabled,
	cancelType,
	...props
}: ButtonProps) {
	return (
		<button
			{...props}
			className={clsx(
				styles.container,
				cancelType ? styles.cancel : undefined,
				disabled ? styles.disabled : undefined,
			)}
		>
			{children}
		</button>
	);
}
