

export const getTodayISOString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Assuming Monday is the first day of the week
export const getWeekDays = (): Array<{ dateISO: string; dayKey: 'day_mon' | 'day_tue' | 'day_wed' | 'day_thu' | 'day_fri' | 'day_sat' | 'day_sun' }> => {
  const weekDays = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  const startOfWeek = new Date(today);
  // Adjust to Monday
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
  startOfWeek.setDate(diff);

  const dayKeys: Array<'day_mon' | 'day_tue' | 'day_wed' | 'day_thu' | 'day_fri' | 'day_sat' | 'day_sun'> = ['day_mon', 'day_tue', 'day_wed', 'day_thu', 'day_fri', 'day_sat', 'day_sun'];

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push({
      dateISO: day.toISOString().split('T')[0],
      dayKey: dayKeys[i]
    });
  }
  return weekDays;
};
