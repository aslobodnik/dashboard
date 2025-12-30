"use client";

import { useState, useEffect } from "react";
import orders from "../../data/orders.json";

interface Order {
  date: string;
  time?: string;
  restaurant: string;
  total: number;
  items: number;
  type: string;
}

function getTimeSince(dateStr: string, timeStr?: string) {
  // Parse date and time as local
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
  if (hours < 72) return "48 hours. your wallet is cautiously optimistic.";
  if (hours < 168) return "almost a week? who even are you?";
  if (hours < 336) return "two weeks. your bank account weeps with joy.";
  if (hours < 720) return "a month? are you okay? blink twice if you need help.";
  return "legendary. or you forgot your password.";
}

function getAllTimeActivity(orderList: Order[]) {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  // Find the earliest order date
  const sortedOrders = [...orderList].sort((a, b) => a.date.localeCompare(b.date));
  const earliestOrderDate = sortedOrders[0]?.date || new Date().toISOString().split('T')[0];

  // Parse earliest date
  const [startYear, startMonth, startDay] = earliestOrderDate.split("-").map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);

  // Build all days from start to now
  const days: { date: Date; count: number; dateStr: string }[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= now) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    days.push({ date: new Date(currentDate), count: 0, dateStr });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Count orders per day
  orderList.forEach((o) => {
    const day = days.find(d => d.dateStr === o.date);
    if (day) day.count++;
  });

  const totalOrders = days.reduce((sum, d) => sum + d.count, 0);
  const daysWithOrders = days.filter(d => d.count > 0).length;
  const totalDays = days.length;
  const cleanDays = totalDays - daysWithOrders;
  const successRate = Math.round((cleanDays / totalDays) * 100);

  // Calculate total spend
  const totalSpend = orderList.reduce((sum, o) => sum + o.total, 0);

  // Calculate current streak (days without ordering)
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count === 0) streak++;
    else break;
  }

  return { days, totalOrders, daysWithOrders, totalDays, cleanDays, successRate, totalSpend, streak };
}

function getTopRestaurants(orderList: Order[]) {
  const restaurantCounts: Record<string, number> = {};
  orderList.forEach((o) => {
    restaurantCounts[o.restaurant] = (restaurantCounts[o.restaurant] || 0) + 1;
  });
  return Object.entries(restaurantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

export default function Home() {
  const orderList = orders.orders as Order[];
  const latestOrder = orderList[0];
  const activity = getAllTimeActivity(orderList);
  const topRestaurants = getTopRestaurants(orderList);

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
      <header className="relative z-10 pt-6 sm:pt-8 pb-4 text-center">
        <div className="inline-flex flex-col items-center">
          {/* Main title with better contrast */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-red-500/60 text-sm sm:text-base">◉</span>
            <h1 className="text-[11px] sm:text-sm uppercase tracking-[0.3em] text-zinc-400 font-medium">
              doordash recovery
            </h1>
            <span className="text-red-500/60 text-sm sm:text-base">◉</span>
          </div>
          {/* Whimsical tagline */}
          <p className="text-[9px] sm:text-[10px] text-zinc-600 tracking-widest mt-1 italic">
            one order at a time
          </p>
        </div>
      </header>

      {/* Main Timer Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        {/* Days counter if applicable */}
        {time.days > 0 && (
          <div className="mb-4 fade-up">
            <span className="text-6xl sm:text-8xl font-bold text-white timer-digit">{time.days}</span>
            <span className="text-zinc-500 text-lg sm:text-xl uppercase tracking-widest ml-3">
              {time.days === 1 ? "day" : "days"}
            </span>
          </div>
        )}

        {/* Giant HH:MM:SS Counter */}
        <div className="timer-digit breathe text-center">
          <div className="text-[3.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-bold leading-none tracking-tight flex items-center justify-center">
            <span className="text-white">{pad(time.hours % 24)}</span>
            <span className="text-red-500 colon-pulse mx-1 sm:mx-2">:</span>
            <span className="text-white">{pad(time.minutes)}</span>
            <span className="text-red-500 colon-pulse mx-1 sm:mx-2">:</span>
            <span className="text-white">{pad(time.seconds)}</span>
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-center gap-8 sm:gap-16 md:gap-24 text-zinc-600 text-[10px] sm:text-xs uppercase tracking-[0.3em] mt-2 sm:mt-4">
          <span className="w-16 sm:w-24 text-center">hours</span>
          <span className="w-16 sm:w-24 text-center">minutes</span>
          <span className="w-16 sm:w-24 text-center">seconds</span>
        </div>

        {/* Whimsical message */}
        <p className="text-zinc-400 text-base sm:text-xl md:text-2xl mt-8 sm:mt-12 italic text-center max-w-lg fade-up">
          &ldquo;{getMessage(time.totalHours)}&rdquo;
        </p>

        {/* Last order */}
        <p className="text-zinc-600 text-xs sm:text-sm mt-4 uppercase tracking-wider">
          last relapse:{" "}
          <span className="text-zinc-500">{latestOrder.restaurant}</span>
          <span className="mx-2 text-zinc-700">·</span>
          <span className="text-red-400/70">${latestOrder.total.toFixed(2)}</span>
        </p>
      </main>

      {/* Stats Footer */}
      <footer className="relative z-10 pb-8 pt-4">
        <div className="max-w-3xl mx-auto px-4">

          {/* Primary stat - Success Rate */}
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-1">
              <span className={`text-4xl sm:text-5xl font-bold font-mono ${activity.successRate >= 70 ? 'text-emerald-400' : activity.successRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {activity.successRate}%
              </span>
              <span className="text-zinc-600 text-sm uppercase tracking-wider">success rate</span>
            </div>
            <div className="text-[10px] text-zinc-600 mt-1">
              {activity.cleanDays} of {activity.totalDays} days without ordering
            </div>
          </div>

          {/* Activity Grid - Full history */}
          <div className="mb-6">
            {/* Section header with date range */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-700" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-mono">
                {activity.days[0]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' — '}
                {activity.days[activity.days.length - 1]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-700" />
            </div>

            {/* Grid container */}
            <div className="flex justify-center pb-2">
              <div className="inline-flex gap-3 relative">
                {/* Day labels */}
                <div className="flex flex-col gap-[3px] pt-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="h-[11px] sm:h-[13px] flex items-center">
                      <span className="text-[8px] text-zinc-600 w-3 text-right font-mono">{d}</span>
                    </div>
                  ))}
                </div>

                {/* Weekly columns */}
                <div className="relative">
                  {/* Month labels */}
                  <div className="flex gap-[2px] mb-1 h-3">
                    {(() => {
                      const monthLabels: { month: string; colSpan: number; weekIndex: number }[] = [];
                      let currentMonth = -1;
                      let weekCount = 0;

                      // Calculate weeks
                      const weeks: typeof activity.days[] = [];
                      const firstDayOfWeek = activity.days[0]?.date.getDay() || 0;
                      let currentWeek: typeof activity.days = [];
                      for (let i = 0; i < firstDayOfWeek; i++) {
                        currentWeek.push({ date: new Date(), count: -1, dateStr: `empty-${i}` });
                      }
                      activity.days.forEach((day) => {
                        currentWeek.push(day);
                        if (currentWeek.length === 7) {
                          weeks.push(currentWeek);
                          currentWeek = [];
                        }
                      });
                      if (currentWeek.length > 0) {
                        while (currentWeek.length < 7) {
                          currentWeek.push({ date: new Date(), count: -1, dateStr: `empty-end-${currentWeek.length}` });
                        }
                        weeks.push(currentWeek);
                      }

                      weeks.forEach((week, i) => {
                        const firstRealDay = week.find(d => d.count !== -1);
                        if (firstRealDay) {
                          const month = firstRealDay.date.getMonth();
                          if (month !== currentMonth) {
                            if (currentMonth !== -1) {
                              monthLabels[monthLabels.length - 1].colSpan = weekCount;
                            }
                            monthLabels.push({
                              month: firstRealDay.date.toLocaleDateString('en-US', { month: 'short' }),
                              colSpan: 0,
                              weekIndex: i
                            });
                            currentMonth = month;
                            weekCount = 1;
                          } else {
                            weekCount++;
                          }
                        }
                      });
                      if (monthLabels.length > 0) {
                        monthLabels[monthLabels.length - 1].colSpan = weekCount;
                      }

                      return (
                        <div className="flex">
                          {monthLabels.map((m, i) => (
                            <div
                              key={i}
                              className="text-[8px] text-zinc-600 font-mono"
                              style={{ width: `${m.colSpan * 13 + (m.colSpan - 1) * 2}px` }}
                            >
                              {m.month}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Grid cells organized by week */}
                  <div className="flex gap-[2px]">
                    {(() => {
                      // Organize into weeks (columns)
                      const weeks: typeof activity.days[] = [];
                      const firstDayOfWeek = activity.days[0]?.date.getDay() || 0;

                      // Pad the first week with empty cells
                      let currentWeek: typeof activity.days = [];
                      for (let i = 0; i < firstDayOfWeek; i++) {
                        currentWeek.push({ date: new Date(), count: -1, dateStr: `empty-${i}` });
                      }

                      activity.days.forEach((day) => {
                        currentWeek.push(day);
                        if (currentWeek.length === 7) {
                          weeks.push(currentWeek);
                          currentWeek = [];
                        }
                      });

                      // Push remaining days
                      if (currentWeek.length > 0) {
                        while (currentWeek.length < 7) {
                          currentWeek.push({ date: new Date(), count: -1, dateStr: `empty-end-${currentWeek.length}` });
                        }
                        weeks.push(currentWeek);
                      }

                      return weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[2px]">
                          {week.map((day) => {
                            if (day.count === -1) {
                              return <div key={day.dateStr} className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" />;
                            }
                            const isToday = day.dateStr === activity.days[activity.days.length - 1]?.dateStr;
                            const hasOrders = day.count > 0;
                            return (
                              <div key={day.dateStr} className="group relative hover:z-[90]">
                                <div
                                  className={`
                                    w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-[2px] transition-all duration-200
                                    ${day.count === 0
                                      ? 'bg-emerald-900/30 border border-emerald-900/40'
                                      : day.count === 1
                                        ? 'bg-red-900/50 border border-red-900/60 activity-cell-glow-1'
                                        : day.count === 2
                                          ? 'bg-red-700/60 border border-red-700/50 activity-cell-glow-2'
                                          : 'bg-red-500/80 border border-red-500/60 activity-cell-glow-3'
                                    }
                                    ${isToday ? 'ring-1 ring-zinc-400 ring-offset-1 ring-offset-[#09090b]' : ''}
                                    group-hover:scale-150 group-hover:z-10
                                    ${hasOrders ? 'group-hover:shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'group-hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]'}
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
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center items-center gap-4 mt-3">
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
              <div className="text-lg sm:text-xl font-bold text-red-400 font-mono">${activity.totalSpend.toFixed(0)}</div>
              <div className="text-[8px] sm:text-[9px] text-zinc-600 uppercase tracking-wider">total damage</div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg px-3 sm:px-4 py-2 text-center">
              <div className="text-lg sm:text-xl font-bold text-zinc-400 font-mono">{activity.totalOrders}</div>
              <div className="text-[8px] sm:text-[9px] text-zinc-600 uppercase tracking-wider">orders</div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg px-3 sm:px-4 py-2 text-center">
              <div className="text-lg sm:text-xl font-bold text-zinc-500 font-mono">{activity.totalDays}</div>
              <div className="text-[8px] sm:text-[9px] text-zinc-600 uppercase tracking-wider">days tracked</div>
            </div>
          </div>

          {/* Top enablers */}
          <div className="text-center">
            <span className="text-[9px] text-zinc-700 uppercase tracking-wider">
              most ordered from:{" "}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {topRestaurants.map(([name, count]) => `${name} (${count})`).join(" · ")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
