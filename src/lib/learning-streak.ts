const LEARNER_TIME_ZONE = "Asia/Kolkata";

function dayKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: LEARNER_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function previousDay(key: string): string {
  const date = new Date(`${key}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function getLearningStreak(activityDates: Date[], now = new Date()) {
  const activeDays = new Set(activityDates.map(dayKey));
  const today = dayKey(now);

  if (!activeDays.has(today)) return { streak: 0, learnedToday: false };

  let streak = 0;
  let cursor = today;
  while (activeDays.has(cursor)) {
    streak += 1;
    cursor = previousDay(cursor);
  }
  return { streak, learnedToday: true };
}
