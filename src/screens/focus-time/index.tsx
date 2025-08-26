import { Indicator } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { PlusIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import { Button, Header } from "../../components";
import { InfoMetrics } from "../../components/infoMetrics";
import { api } from "../../services/api";
import styles from "./styles.module.css";

type Timers = {
	focus: number;
	rest: number;
};

type TimerState = "PAUSED" | "FOCUS" | "REST";

type FocusMetrics = {
	_id: [number, number, number];
	count: number;
};

type FocusTime = {
	_id: string;
	timeFrom: string;
	timeTo: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
};

export function FocusTime() {
	const focusInput = useRef<HTMLInputElement>(null);
	const restInput = useRef<HTMLInputElement>(null);
	const [timers, setTimers] = useState<Timers>({ focus: 0, rest: 0 });
	const [timerState, setTimerState] = useState<TimerState>("PAUSED");
	const [timeFrom, setTimeFrom] = useState<Date | null>(null);
	const [focusMetrics, setFocusMetrics] = useState<FocusMetrics[]>([]);
	const [focusTimes, setFocusTimes] = useState<FocusTime[]>([]);
	const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(
		dayjs().startOf("month"),
	);
	const [currentDate, setCurrentDate] = useState<dayjs.Dayjs>(
		dayjs().startOf("day"),
	);

	async function handleEnd() {
		focusTimer.pause();

		await api.post("/focus-time", {
			timeFrom: timeFrom?.toISOString(),
			timeTo: new Date().toISOString(),
		});

		setTimeFrom(null);
	}

	const focusTimer = useTimer({
		expiryTimestamp: new Date(),
		async onExpire() {
			if (timerState !== "PAUSED") {
				await handleEnd();
			}
		},
	});

	const restTimer = useTimer({
		expiryTimestamp: new Date(),
	});

	function addSeconds(date: Date, seconds: number) {
		const time = dayjs(date).add(seconds, "seconds");

		return time.toDate();
	}

	function handleStart() {
		const now = new Date();

		focusTimer.restart(addSeconds(now, timers.focus * 60));

		setTimeFrom(now);
	}

	function handleInput(valueType: "focus" | "rest") {
		if (valueType === "focus") {
			setTimers((oldValue) => ({
				...oldValue,
				focus: Number(focusInput.current?.value),
			}));
		} else if (valueType === "rest") {
			setTimers((oldValue) => ({
				...oldValue,
				rest: Number(restInput.current?.value),
			}));
		}
	}

	function handleFocus() {
		if (timers.focus <= 0 || timers.rest <= 0) {
			return;
		}

		handleStart();

		setTimerState("FOCUS");
	}

	async function handleRest() {
		if (timeFrom) {
			await handleEnd();
		}

		const now = new Date();

		restTimer.restart(addSeconds(now, timers.rest * 60));

		focusTimer.pause();

		setTimerState("REST");
	}

	function handleResume() {
		handleStart();

		restTimer.pause();

		setTimerState("FOCUS");
	}

	function handleCancel() {
		setTimers({ focus: 0, rest: 0 });
		setTimerState("PAUSED");

		focusTimer.pause();
		restTimer.pause();

		if (focusInput.current) {
			focusInput.current.value = "";
		}

		if (restInput.current) {
			restInput.current.value = "";
		}
	}

	async function loadFocusMetrics(currentMonth: string) {
		const { data } = await api.get<FocusMetrics[]>("/focus-time/metrics", {
			params: {
				date: currentMonth,
			},
		});

		setFocusMetrics(data);
	}

	async function loadFocusTimes(currentDate: string) {
		const { data } = await api.get<FocusTime[]>("/focus-time", {
			params: {
				date: currentDate,
			},
		});

		setFocusTimes(data);
	}

	const metricsInfoByDay = useMemo(() => {
		const timesMetrics = focusTimes.map((item) => ({
			timeFrom: dayjs(item.timeFrom),
			timeTo: dayjs(item.timeTo),
		}));

		let totalTimeInMinutes = 0;

		if (timesMetrics.length > 0) {
			for (const { timeFrom, timeTo } of timesMetrics) {
				const diff = timeTo.diff(timeFrom, "minutes");

				totalTimeInMinutes += diff;
			}
		}

		return {
			timesMetrics,
			totalTimeInMinutes,
		};
	}, [focusTimes]);

	const metricsInfoByMonth = useMemo(() => {
		const completedDates: string[] = [];
		let counter: number = 0;

		if (focusMetrics.length > 0) {
			focusMetrics.forEach((item) => {
				const date = dayjs(`${item._id[0]}-${item._id[1]}-${item._id[2]}`)
					.startOf("day")
					.toISOString();

				completedDates.push(date);
				counter += item.count;
			});
		}

		return {
			completedDates,
			counter,
		};
	}, [focusMetrics]);

	function handleSelectMonth(date: string) {
		setCurrentMonth(dayjs(date));
	}

	function handleSelectDay(date: string) {
		setCurrentDate(dayjs(date));
	}

	useEffect(() => {
		loadFocusMetrics(currentMonth.toISOString());
	}, [currentMonth]);

	useEffect(() => {
		loadFocusTimes(currentDate.toISOString());
	}, [currentDate]);

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<Header title="Tempo de foco" />

				<div className={styles.inputs}>
					<div className={styles.input}>
						<PlusIcon />
						<input
							onChange={() => handleInput("focus")}
							name="focus"
							ref={focusInput}
							type="number"
							placeholder="Tempo de foco"
						/>
					</div>
					<div className={styles.input}>
						<PlusIcon />
						<input
							onChange={() => handleInput("rest")}
							name="rest"
							ref={restInput}
							type="number"
							placeholder="Tempo de descanso"
						/>
					</div>
				</div>

				<div className={styles.timer}>
					{timerState === "FOCUS" && <strong>Focar</strong>}
					{timerState === "REST" && <strong>Descansar</strong>}

					{timerState === "PAUSED" && (
						<span>{`${String(timers.focus).padStart(2, "0")}:00`}</span>
					)}
					{timerState === "FOCUS" && (
						<span>{`${String(focusTimer.minutes).padStart(2, "0")}:${String(focusTimer.seconds).padStart(2, "0")}`}</span>
					)}
					{timerState === "REST" && (
						<span>{`${String(restTimer.minutes).padStart(2, "0")}:${String(restTimer.seconds).padStart(2, "0")}`}</span>
					)}
				</div>

				<div className={styles.buttons}>
					{timerState === "PAUSED" && (
						<Button
							disabled={timers.focus <= 0 || timers.rest <= 0}
							onClick={handleFocus}
						>
							Começar
						</Button>
					)}

					{timerState === "FOCUS" && (
						<Button onClick={handleRest}>Iniciar descanso</Button>
					)}

					{timerState === "REST" && (
						<Button onClick={handleResume}>Retomar</Button>
					)}

					<Button onClick={() => handleCancel()} cancelType>
						Cancelar
					</Button>
				</div>
			</div>

			<div className={styles.metrics}>
				<h2>Estatísticas</h2>

				<div className={styles["info-container"]}>
					<InfoMetrics
						value={String(metricsInfoByMonth.counter)}
						label="Ciclos totais"
					/>
					<InfoMetrics
						value={`${metricsInfoByDay.totalTimeInMinutes} minutos`}
						label="Tempo total de foco"
					/>
				</div>

				<div className={styles["calendar-container"]}>
					<Calendar
						getDayProps={(date) => ({
							selected: dayjs(date).isSame(currentDate),
							onClick: () => handleSelectDay(date),
						})}
						onMonthSelect={handleSelectMonth}
						onNextMonth={handleSelectMonth}
						onPreviousMonth={handleSelectMonth}
						renderDay={(date) => {
							const day = dayjs(date).date();
							const isSameDate = metricsInfoByMonth?.completedDates?.some(
								(item) => dayjs(item).isSame(dayjs(date)),
							);

							return (
								<Indicator
									size={8}
									color="var(--color-primary)"
									offset={-2}
									disabled={!isSameDate}
								>
									<div>{day}</div>
								</Indicator>
							);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
