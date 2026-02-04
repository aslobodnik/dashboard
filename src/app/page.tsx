"use client";

import { useState, useEffect, useMemo } from "react";
import orders from "../../data/orders.json";

interface Order {
  date: string;
  time?: string;
  restaurant: string;
  total: number;
  items: number;
  type: string;
}

interface DayData {
  date: Date;
  count: number;
  dateStr: string;
}

interface YearActivity {
  year: number;
  days: DayData[];
  totalOrders: number;
  daysWithOrders: number;
  totalDays: number;
  cleanDays: number;
  successRate: number;
  totalSpent: number;
}

function getTimeSince(dateStr: string, timeStr?: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  let hours = 0;
  let minutes = 0;
  if (timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    hours = h;
    minutes = m;
  }
  const orderDate = new Date(year, month - 1, day, hours, minutes);
  const now = new Date();
  const diffMs = now.getTime() - orderDate.getTime();

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const totalHours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return { days, hours: totalHours, minutes: mins, seconds: secs, totalHours };
}

function getMessage(hours: number): string {
  if (hours < 1) return "you literally just ordered. come on.";
  if (hours < 6) return "still digesting the regret.";
  if (hours < 12) return "the shame is still fresh.";
  if (hours < 24) return "not even a full day yet.";
  if (hours < 48) return "one day strong. barely.";
  if (hours < 72) return "48 hours. your metabolism is cautiously optimistic.";
  if (hours < 168) return "almost a week? who even are you?";
  if (hours < 336) return "two weeks. your jeans might actually fit now.";
  if (hours < 720) return "a month? are you okay? blink twice if you need help.";
  return "legendary. or you forgot your password.";
}

function getActivityByYear(orderList: Order[]): YearActivity[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Find earliest year
  const sortedOrders = [...orderList].sort((a, b) => a.date.localeCompare(b.date));
  const earliestYear = sortedOrders[0] ? parseInt(sortedOrders[0].date.split("-")[0]) : currentYear;

  const yearActivities: YearActivity[] = [];

  for (let year = earliestYear; year <= currentYear; year++) {
    // Start of year (or first order date if earliest year)
    const yearStart = new Date(year, 0, 1);
    // End of year (or today if current year)
    const yearEnd = year === currentYear ? now : new Date(year, 11, 31);

    const days: DayData[] = [];
    const currentDate = new Date(yearStart);

    while (currentDate <= yearEnd) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      days.push({ date: new Date(currentDate), count: 0, dateStr });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count orders and spending for this year
    let totalSpent = 0;
    orderList.forEach((o) => {
      if (o.date.startsWith(String(year))) {
        const day = days.find(d => d.dateStr === o.date);
        if (day) day.count++;
        totalSpent += o.total;
      }
    });

    const totalOrders = days.reduce((sum, d) => sum + d.count, 0);
    const daysWithOrders = days.filter(d => d.count > 0).length;
    const totalDays = days.length;
    const cleanDays = totalDays - daysWithOrders;
    const successRate = totalDays > 0 ? Math.round((cleanDays / totalDays) * 100) : 100;

    yearActivities.push({
      year,
      days,
      totalOrders,
      daysWithOrders,
      totalDays,
      cleanDays,
      successRate,
      totalSpent,
    });
  }

  return yearActivities;
}

function getAllTimeStats(orderList: Order[]) {
  const now = new Date();
  const sortedOrders = [...orderList].sort((a, b) => a.date.localeCompare(b.date));
  const earliestOrderDate = sortedOrders[0]?.date || now.toISOString().split('T')[0];

  const [startYear, startMonth, startDay] = earliestOrderDate.split("-").map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);

  const totalDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalOrders = orderList.length;
  const totalSpent = orderList.reduce((sum, o) => sum + o.total, 0);

  // Create a set of days with orders
  const daysWithOrdersSet = new Set(orderList.map(o => o.date));
  const daysWithOrders = daysWithOrdersSet.size;
  const cleanDays = totalDays - daysWithOrders;
  const successRate = Math.round((cleanDays / totalDays) * 100);

  return { totalDays, totalOrders, daysWithOrders, cleanDays, successRate, totalSpent };
}

function getTopRestaurants(orderList: Order[], year?: number) {
  const filtered = year
    ? orderList.filter(o => o.date.startsWith(String(year)))
    : orderList;
  const restaurantCounts: Record<string, number> = {};
  filtered.forEach((o) => {
    restaurantCounts[o.restaurant] = (restaurantCounts[o.restaurant] || 0) + 1;
  });
  return Object.entries(restaurantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

function YearGrid({ yearData }: { yearData: YearActivity }) {
  const { days, year } = yearData;

  // Organize into weeks (columns)
  const weeks: DayData[][] = [];
  const firstDayOfWeek = days[0]?.date.getDay() || 0;

  let currentWeek: DayData[] = [];
  // Pad the first week with empty cells
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: new Date(), count: -1, dateStr: `empty-${year}-${i}` });
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: new Date(), count: -1, dateStr: `empty-end-${year}-${currentWeek.length}` });
    }
    weeks.push(currentWeek);
  }

  // Calculate month labels
  const monthLabels: { month: string; weekIndex: number }[] = [];
  let currentMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstRealDay = week.find(d => d.count !== -1);
    if (firstRealDay) {
      const month = firstRealDay.date.getMonth();
      if (month !== currentMonth) {
        monthLabels.push({
          month: firstRealDay.date.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex,
        });
        currentMonth = month;
      }
    }
  });

  return (
    <div className="inline-block min-w-max">
      {/* Month labels */}
      <div className="relative h-3 ml-5 mb-1">
        {monthLabels.map((m, i) => (
          <div
            key={`${year}-month-${i}`}
            className="absolute text-[8px] text-zinc-600 font-mono"
            style={{ left: `${m.weekIndex * 13}px` }}
          >
            {m.month}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] flex-shrink-0">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${year}-day-${i}`} className="h-[10px] sm:h-[11px] flex items-center">
              <span className="text-[7px] text-zinc-600 w-3 text-right font-mono">{d}</span>
            </div>
          ))}
        </div>

        {/* Grid cells */}
        <div className="flex gap-[2px]">
          {weeks.map((week, weekIndex) => (
            <div key={`${year}-week-${weekIndex}`} className="flex flex-col gap-[2px]">
              {week.map((day) => {
                if (day.count === -1) {
                  return <div key={day.dateStr} className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px]" />;
                }
                const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                return (
                  <div key={day.dateStr} className="group relative hover:z-[90]">
                    <div
                      className={`
                        w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[2px] transition-all duration-200
                        ${day.count === 0
                          ? 'bg-emerald-900/30 border border-emerald-900/40'
                          : day.count === 1
                            ? 'bg-red-900/50 border border-red-900/60'
                            : day.count === 2
                              ? 'bg-red-700/60 border border-red-700/50'
                              : 'bg-red-500/80 border border-red-500/60'
                        }
                        ${isToday ? 'ring-1 ring-zinc-400 ring-offset-1 ring-offset-[#09090b]' : ''}
                        group-hover:scale-150 group-hover:z-10
                        ${day.count > 0 ? 'group-hover:shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'group-hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]'}
                      `}
                    />
                    {/* Tooltip */}
                    <div className="
                      absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      opacity-0 group-hover:opacity-100 transition-opacity duration-150
                      pointer-events-none z-[100]
                    ">
                      <div className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 shadow-xl whitespace-nowrap">
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {new Date(day.dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className={`text-[11px] font-medium ${day.count > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {day.count === 0 ? '✓ No orders' : `${day.count} order${day.count > 1 ? 's' : ''}`}
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-700" />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const orderList = orders.orders as Order[];
  const latestOrder = orderList[0];
  const yearActivities = useMemo(() => getActivityByYear(orderList), [orderList]);
  const allTimeStats = useMemo(() => getAllTimeStats(orderList), [orderList]);

  // Default to current year
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);

  const selectedYearData = selectedYear === 'all'
    ? null
    : yearActivities.find(y => y.year === selectedYear);

  const topRestaurants = getTopRestaurants(
    orderList,
    selectedYear === 'all' ? undefined : selectedYear
  );

  const [time, setTime] = useState(() => getTimeSince(latestOrder.date, latestOrder.time));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(getTimeSince(latestOrder.date, latestOrder.time));
    }, 1000);
    return () => clearInterval(interval);
  }, [latestOrder.date, latestOrder.time]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-zinc-600 text-sm uppercase tracking-widest">loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Atmospheric effects */}
      <div className="vignette" />
      <div className="scanlines opacity-30" />

      {/* Header */}
      <header className="relative z-10 pt-8 sm:pt-10 pb-6 sm:pb-8 text-center">
        <div className="inline-flex flex-col items-center gap-2">
          {/* Main title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-red-500/70 text-xs sm:text-sm">◉</span>
            <h1 className="text-xs sm:text-sm uppercase tracking-[0.35em] text-zinc-300 font-medium">
              doordash recovery
            </h1>
            <span className="text-red-500/70 text-xs sm:text-sm">◉</span>
          </div>
          {/* Tagline - improved contrast */}
          <p className="text-[10px] sm:text-xs text-zinc-500 tracking-[0.2em] italic">
            one order at a time
          </p>
        </div>
      </header>

      {/* Main Timer Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
        {time.days >= 1 ? (
          /* 1+ days: Days hero with subordinate ticking clock */
          <>
            <div className="text-center fade-up">
              <div className="timer-digit breathe inline-flex items-baseline">
                <span className="text-[4.5rem] sm:text-[7rem] md:text-[8rem] font-bold text-white leading-none">{time.days}</span>
                <span className="text-zinc-400 text-lg sm:text-2xl md:text-3xl uppercase tracking-[0.2em] ml-3 sm:ml-4 font-medium">
                  {time.days === 1 ? "day" : "days"}
                </span>
              </div>
            </div>
            {/* Subordinate ticking clock */}
            <div className="mt-6 sm:mt-8 text-center">
              <div className="inline-flex items-center text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-400 tracking-tight font-mono">
                <span>{pad(time.hours % 24)}</span>
                <span className="text-red-500/60 colon-pulse mx-1 sm:mx-2">:</span>
                <span>{pad(time.minutes)}</span>
                <span className="text-red-500/60 colon-pulse mx-1 sm:mx-2">:</span>
                <span>{pad(time.seconds)}</span>
              </div>
            </div>
          </>
        ) : (
          /* Under 24 hours: Full dramatic HH:MM:SS */
          <>
            <div className="timer-digit breathe text-center">
              <div className="text-[3rem] sm:text-[5.5rem] md:text-[7rem] lg:text-[9rem] font-bold leading-none tracking-tight flex items-center justify-center">
                <span className="text-white">{pad(time.hours % 24)}</span>
                <span className="text-red-500/80 colon-pulse mx-2 sm:mx-3">:</span>
                <span className="text-white">{pad(time.minutes)}</span>
                <span className="text-red-500/80 colon-pulse mx-2 sm:mx-3">:</span>
                <span className="text-white">{pad(time.seconds)}</span>
              </div>
            </div>
            <div className="flex justify-center gap-[4.5rem] sm:gap-[7rem] md:gap-[9rem] text-zinc-500 text-[10px] sm:text-xs uppercase tracking-[0.25em] mt-3 sm:mt-5">
              <span className="text-center">hours</span>
              <span className="text-center">minutes</span>
              <span className="text-center">seconds</span>
            </div>
          </>
        )}

        {/* Whimsical message */}
        <p className="text-zinc-400 text-sm sm:text-lg md:text-xl mt-10 sm:mt-14 italic text-center max-w-md px-4 fade-up leading-relaxed">
          &ldquo;{getMessage(time.totalHours)}&rdquo;
        </p>

        {/* Last order */}
        <p className="text-zinc-500 text-[11px] sm:text-sm mt-5 sm:mt-6 uppercase tracking-wider">
          last relapse:{" "}
          <span className="text-zinc-400">{latestOrder.restaurant}</span>
          <span className="mx-2 text-zinc-600">·</span>
          <span className="text-red-400/80">${latestOrder.total.toFixed(2)}</span>
        </p>
      </main>

      {/* Stats Footer */}
      <footer className="relative z-10 pb-8 pt-4">
        <div className="max-w-4xl mx-auto px-4">

          {/* Year Tabs */}
          <div className="flex justify-center mb-6 overflow-x-auto px-2">
            <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-1 min-w-max">
              {yearActivities.map((ya) => (
                <button
                  key={ya.year}
                  onClick={() => setSelectedYear(ya.year)}
                  className={`
                    px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-mono transition-all duration-200
                    ${selectedYear === ya.year
                      ? 'bg-zinc-800 text-zinc-200 shadow-inner'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                    }
                  `}
                >
                  {ya.year}
                </button>
              ))}
              <div className="w-px h-5 bg-zinc-700 mx-0.5 sm:mx-1" />
              <button
                onClick={() => setSelectedYear('all')}
                className={`
                  px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-mono transition-all duration-200
                  ${selectedYear === 'all'
                    ? 'bg-zinc-800 text-zinc-200 shadow-inner'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  }
                `}
              >
                ALL
              </button>
            </div>
          </div>

          {/* Stats for selected year/all time */}
          {selectedYear === 'all' ? (
            <div className="text-center mb-6">
              <div className="inline-flex items-baseline gap-1">
                <span className={`text-4xl sm:text-5xl font-bold font-mono ${allTimeStats.successRate >= 70 ? 'text-emerald-400' : allTimeStats.successRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {allTimeStats.successRate}%
                </span>
                <span className="text-zinc-600 text-sm uppercase tracking-wider">success rate</span>
              </div>
              <div className="text-[10px] text-zinc-600 mt-1">
                {allTimeStats.cleanDays.toLocaleString()} of {allTimeStats.totalDays.toLocaleString()} days without ordering
              </div>
              <div className="text-[10px] text-red-400/60 mt-1 font-mono">
                ${allTimeStats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total damage
              </div>
            </div>
          ) : selectedYearData && (
            <div className="text-center mb-6">
              <div className="inline-flex items-baseline gap-1">
                <span className={`text-4xl sm:text-5xl font-bold font-mono ${selectedYearData.successRate >= 70 ? 'text-emerald-400' : selectedYearData.successRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {selectedYearData.successRate}%
                </span>
                <span className="text-zinc-600 text-sm uppercase tracking-wider">success rate</span>
              </div>
              <div className="text-[10px] text-zinc-600 mt-1">
                {selectedYearData.cleanDays} of {selectedYearData.totalDays} days without ordering
              </div>
              <div className="text-[10px] text-red-400/60 mt-1 font-mono">
                ${selectedYearData.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent this year
              </div>
            </div>
          )}

          {/* Activity Grid - by year or summary */}
          <div className="mb-6">
            {selectedYear === 'all' ? (
              /* All years stacked vertically */
              <div className="space-y-4">
                {[...yearActivities].reverse().map((ya) => (
                  <div key={ya.year} className="border border-zinc-800/50 rounded-lg p-3 sm:p-4 bg-zinc-900/20">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <span className="text-sm font-mono text-zinc-400">{ya.year}</span>
                      <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-zinc-600">
                        <span>{ya.totalOrders}</span>
                        <span className="text-red-400/60">${ya.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        <span className={ya.successRate >= 70 ? 'text-emerald-400' : ya.successRate >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                          {ya.successRate}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                      <YearGrid yearData={ya} />
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedYearData && (
              /* Single year grid */
              <div className="flex justify-center pb-2 overflow-x-auto">
                <YearGrid yearData={selectedYearData} />
              </div>
            )}

            {/* Legend */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-900/30 border border-emerald-900/40" />
                <span className="text-[9px] text-zinc-500">no orders</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-[10px] h-[10px] rounded-[2px] bg-red-900/50 border border-red-900/60" />
                <div className="w-[10px] h-[10px] rounded-[2px] bg-red-700/60 border border-red-700/50" />
                <div className="w-[10px] h-[10px] rounded-[2px] bg-red-500/80 border border-red-500/60" />
                <span className="text-[9px] text-zinc-500 ml-0.5">1 → 3+ orders</span>
              </div>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="flex justify-center items-stretch gap-2 sm:gap-3 mb-5">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg px-3 sm:px-4 py-2 text-center">
              <div className="text-lg sm:text-xl font-bold text-zinc-400 font-mono">
                {selectedYear === 'all' ? allTimeStats.totalOrders : selectedYearData?.totalOrders ?? 0}
              </div>
              <div className="text-[8px] sm:text-[9px] text-zinc-600 uppercase tracking-wider">orders</div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg px-3 sm:px-4 py-2 text-center">
              <div className="text-lg sm:text-xl font-bold text-zinc-500 font-mono">
                {selectedYear === 'all' ? allTimeStats.totalDays.toLocaleString() : selectedYearData?.totalDays ?? 0}
              </div>
              <div className="text-[8px] sm:text-[9px] text-zinc-600 uppercase tracking-wider">days tracked</div>
            </div>
          </div>

          {/* Top enablers */}
          <div className="text-center">
            <span className="text-[9px] text-zinc-700 uppercase tracking-wider">
              top enablers{selectedYear !== 'all' ? ` in ${selectedYear}` : ''}:{" "}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {topRestaurants.length > 0
                ? topRestaurants.map(([name, count]) => `${name} (${count})`).join(" · ")
                : 'none yet'
              }
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
