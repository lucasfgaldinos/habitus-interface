import { Indicator } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { PaperPlaneRightIcon, TrashIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "../../components";
import { InfoMetrics } from "../../components/infoMetrics";
import { api } from "../../services/api";
import styles from "./styles.module.css";

type Habit = {
	_id: string;
	name: string;
	completedDates: string[];
	userId: string;
	createdAt: string;
	updatedAt: string;
};

type HabitMetrics = {
	_id: string;
	name: string;
	completedDates: string[];
};

export function Habits() {
	const [habits, setHabits] = useState<Habit[]>([]);
	const [habitMetrics, setHabitMetrics] = useState<HabitMetrics>(
		{} as HabitMetrics,
	);
	const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
	const newHabitInput = useRef<HTMLInputElement>(null);
	const today = dayjs().startOf("day");

	const metricsInfo = useMemo(() => {
		const numberOfMonthDays = today.endOf("month").get("date");
		const numberOfDays = habitMetrics.completedDates
			? habitMetrics.completedDates.length
			: 0;

		const completedDatesPerMonth = `${numberOfDays}/${numberOfMonthDays}`;

		const completedMonthPercent = `${Math.round((numberOfDays / numberOfMonthDays) * 100)}%`;

		return {
			completedDatesPerMonth,
			completedMonthPercent,
		};
	}, [habitMetrics]);

	async function handleSelectHabit(habit: Habit, currentMonth?: Date) {
		setSelectedHabit(habit);

		const { data } = await api.get<HabitMetrics>(
			`/habit/${habit._id}/metrics`,
			{
				params: {
					date: currentMonth
						? currentMonth.toISOString()
						: today.startOf("month").toISOString(),
				},
			},
		);

		setHabitMetrics(data);
	}

	async function handleSubmit() {
		const input = newHabitInput.current;

		if (input?.value) {
			const { data: createdHabit } = await api.post("/habit", {
				name: input.value,
			});

			input.value = "";

			const newHabits = [...habits, createdHabit];
			setHabits(newHabits);
		}
	}

	async function handleToggle(habit: Habit) {
		await api.patch(`/habit/${habit._id}/toggle`);

		await getHabits();

		handleSelectHabit(habit);
	}

	async function deleteHabit(id: string) {
		await api.delete(`habit/${id}`);

		const newHabits = habits.filter((habit) => {
			return habit._id !== id;
		});

		setHabits(newHabits);

		setSelectedHabit(null);
		setHabitMetrics({} as HabitMetrics);
	}

	async function getHabits() {
		const { data } = await api.get<Habit[]>("/habit");

		setHabits(data);
	}

	async function handleCurrentMonth(date: string) {
		await handleSelectHabit(selectedHabit!, dayjs(date).toDate());
	}

	useEffect(() => {
		getHabits();
	}, []);

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<Header title="Hábitos diários" />

				<div className={styles.input}>
					<input
						ref={newHabitInput}
						type="text"
						placeholder="Digite aqui um novo hábito"
					/>
					<button type="button" onClick={() => handleSubmit()}>
						<PaperPlaneRightIcon />
					</button>
				</div>

				<div className={styles.list}>
					{habits.length > 0 ? (
						habits.map((habit) => (
							<div
								key={habit._id}
								className={clsx(
									styles.habit,
									habit._id === selectedHabit?._id && styles["habit-active"],
								)}
							>
								<p
									role="button"
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSelectHabit(habit);
										}
									}}
									onClick={() => handleSelectHabit(habit)}
								>
									{habit.name}
								</p>
								<div>
									<input
										type="checkbox"
										defaultChecked={habit.completedDates.some(
											(date) => date === today.toISOString(),
										)}
										onChange={() => handleToggle(habit)}
									/>
									<button type="button" onClick={() => deleteHabit(habit._id)}>
										<TrashIcon />
									</button>
								</div>
							</div>
						))
					) : (
						<div>Crie novos hábitos para acompanhar</div>
					)}
				</div>
			</div>

			{selectedHabit ? (
				<div className={styles.metrics}>
					<h2>{selectedHabit.name}</h2>

					<div className={styles["info-container"]}>
						<InfoMetrics
							value={metricsInfo.completedDatesPerMonth}
							label="Dias concluídos"
						/>
						<InfoMetrics
							value={metricsInfo.completedMonthPercent}
							label="Porcentagem"
						/>
					</div>

					<div className={styles["calendar-container"]}>
						<Calendar
							static
							onMonthSelect={handleCurrentMonth}
							onNextMonth={handleCurrentMonth}
							onPreviousMonth={handleCurrentMonth}
							renderDay={(date) => {
								const day = dayjs(date).date();
								const isSameDate = habitMetrics?.completedDates?.some((item) =>
									dayjs(item).isSame(dayjs(date)),
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
			) : (
				<div className={styles["no-metrics"]}>
					Selecione um hábito para ver as métricas.
				</div>
			)}
		</div>
	);
}
