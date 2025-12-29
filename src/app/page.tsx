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

function get30DayStats(orderList: Order[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentOrders = orderList.filter((o) => {
    const [year, month, day] = o.date.split("-").map(Number);
    const orderDate = new Date(year, month - 1, day);
    return orderDate >= thirtyDaysAgo;
  });

  const totalSpent = recentOrders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = recentOrders.length;

  return {
    totalSpent,
    orderCount,
    avgPerOrder: orderCount > 0 ? totalSpent / orderCount : 0,
  };
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
  const stats30d = get30DayStats(orderList);
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
      <header className="relative z-10 pt-8 pb-4 text-center">
        <h1 className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-zinc-600 font-medium">
          doordash recovery tracker
        </h1>
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
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center reveal reveal-delay-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-400">
                ${stats30d.totalSpent.toFixed(0)}
              </div>
              <div className="text-zinc-600 text-[10px] sm:text-xs uppercase tracking-wider mt-1">
                last 30 days
              </div>
            </div>
            <div className="text-center reveal reveal-delay-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-300">
                {stats30d.orderCount}
              </div>
              <div className="text-zinc-600 text-[10px] sm:text-xs uppercase tracking-wider mt-1">
                incidents
              </div>
            </div>
            <div className="text-center reveal reveal-delay-3">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-300">
                ${stats30d.avgPerOrder.toFixed(0)}
              </div>
              <div className="text-zinc-600 text-[10px] sm:text-xs uppercase tracking-wider mt-1">
                per incident
              </div>
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
