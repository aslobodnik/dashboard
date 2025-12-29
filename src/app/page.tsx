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

function get30DayActivity(orderList: Order[]) {
  const now = new Date();
  const days: { date: Date; count: number; dateStr: string }[] = [];

  // Build last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    days.push({ date, count: 0, dateStr });
  }

  // Count orders per day
  orderList.forEach((o) => {
    const day = days.find(d => d.dateStr === o.date);
    if (day) day.count++;
  });

  const totalOrders = days.reduce((sum, d) => sum + d.count, 0);
  const daysWithOrders = days.filter(d => d.count > 0).length;
  const maxCount = Math.max(...days.map(d => d.count), 1);

  // Calculate current streak (days without ordering)
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count === 0) streak++;
    else break;
  }

  return { days, totalOrders, daysWithOrders, maxCount, streak };
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
  const activity = get30DayActivity(orderList);
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
          <div className="text-[4rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold leading-none tracking-tight flex items-center justify-center">
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
        <div className="max-w-xl mx-auto px-4">
          {/* Activity Grid - GitHub style */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap max-w-md mx-auto">
              {activity.days.map((day, i) => {
                const intensity = day.count === 0
                  ? 'bg-zinc-900'
                  : day.count === 1
                    ? 'bg-red-900/60'
                    : day.count === 2
                      ? 'bg-red-700/70'
                      : 'bg-red-500';
                const isToday = i === activity.days.length - 1;
                return (
                  <div
                    key={day.dateStr}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm ${intensity} ${isToday ? 'ring-1 ring-zinc-600' : ''}`}
                    title={`${day.dateStr}: ${day.count} order${day.count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-center items-center gap-4 mt-3 text-[10px] sm:text-xs text-zinc-600">
              <span>30 days ago</span>
              <div className="flex items-center gap-1">
                <span className="text-zinc-500">less</span>
                <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900" />
                <div className="w-2.5 h-2.5 rounded-sm bg-red-900/60" />
                <div className="w-2.5 h-2.5 rounded-sm bg-red-700/70" />
                <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                <span className="text-zinc-500">more</span>
              </div>
              <span>today</span>
            </div>
          </div>

          {/* Stats row - simplified */}
          <div className="flex justify-center items-center gap-6 sm:gap-10 mb-4">
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-bold text-red-400">{activity.totalOrders}</span>
              <span className="text-zinc-600 text-[10px] sm:text-xs uppercase tracking-wider ml-2">orders</span>
            </div>
            <div className="text-zinc-700">·</div>
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-bold text-zinc-300">{activity.daysWithOrders}</span>
              <span className="text-zinc-600 text-[10px] sm:text-xs uppercase tracking-wider ml-2">days</span>
            </div>
            <div className="text-zinc-700">·</div>
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">{30 - activity.daysWithOrders}</span>
              <span className="text-zinc-600 text-[10px] sm:text-xs uppercase tracking-wider ml-2">clean</span>
            </div>
          </div>

          {/* Top enablers */}
          <div className="text-center">
            <span className="text-zinc-700 text-[10px] sm:text-xs uppercase tracking-wider">
              top enablers:{" "}
            </span>
            <span className="text-zinc-500 text-[10px] sm:text-xs">
              {topRestaurants.map(([name]) => name).join(" · ")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
