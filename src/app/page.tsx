import orders from "../../data/orders.json";

interface Order {
  date: string;
  restaurant: string;
  total: number;
  items: number;
  type: string;
}

function getTimeSince(dateStr: string): { value: number; unit: "hours" | "days" } {
  const orderDate = new Date(dateStr);
  const today = new Date();
  const diffMs = today.getTime() - orderDate.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (hours < 100) {
    return { value: hours, unit: "hours" };
  }
  return { value: Math.floor(hours / 24), unit: "days" };
}

function getStats(orderList: Order[]) {
  const totalSpent = orderList.reduce((sum, o) => sum + o.total, 0);
  const restaurantCounts: Record<string, number> = {};
  orderList.forEach((o) => {
    restaurantCounts[o.restaurant] = (restaurantCounts[o.restaurant] || 0) + 1;
  });
  const topRestaurants = Object.entries(restaurantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return { totalSpent, topRestaurants, orderCount: orderList.length };
}

export default function Home() {
  const orderList = orders.orders as Order[];
  const latestOrder = orderList[0];
  const timeSince = getTimeSince(latestOrder.date);
  const stats = getStats(orderList);

  const getMessage = (value: number, unit: "hours" | "days") => {
    if (unit === "hours") {
      if (value < 1) return "you literally just ordered. come on.";
      if (value < 6) return "still digesting the regret.";
      if (value < 24) return "not even a full day yet.";
      if (value < 48) return "one day strong. barely.";
      return "still in the danger zone.";
    }
    if (value < 7) return "a whole week? impressive... for you.";
    if (value < 14) return "who even are you anymore?";
    if (value < 30) return "your wallet thanks you.";
    return "are you okay? blink twice if you need help.";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <main className="max-w-2xl mx-auto">
        <header className="mb-12">
          <h1 className="text-sm uppercase tracking-widest text-zinc-500 mb-2">
            slobo&apos;s dashboard
          </h1>
          <p className="text-zinc-600 text-xs">
            last updated: {orders.lastUpdated}
          </p>
        </header>

        <section className="mb-16">
          <div className="text-zinc-500 text-sm mb-2">{timeSince.unit} since doordash</div>
          <div className="text-[12rem] font-bold leading-none tracking-tighter text-white">
            {timeSince.value}
          </div>
          <p className="text-zinc-400 text-lg mt-4">{getMessage(timeSince.value, timeSince.unit)}</p>
          <p className="text-zinc-600 text-sm mt-2">
            last order: {latestOrder.restaurant} &middot; ${latestOrder.total.toFixed(2)}
          </p>
        </section>

        <section className="mb-12 grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="text-3xl font-bold text-white">
              ${stats.totalSpent.toFixed(0)}
            </div>
            <div className="text-zinc-500 text-sm">total damage</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="text-3xl font-bold text-white">
              {stats.orderCount}
            </div>
            <div className="text-zinc-500 text-sm">orders</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="text-3xl font-bold text-white">
              ${(stats.totalSpent / stats.orderCount).toFixed(0)}
            </div>
            <div className="text-zinc-500 text-sm">avg order</div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-zinc-500 text-sm mb-4">top spots (aka the problem)</h2>
          <div className="space-y-2">
            {stats.topRestaurants.map(([name, count], i) => (
              <div
                key={name}
                className="flex justify-between items-center bg-zinc-900 rounded-lg p-3"
              >
                <span className="text-zinc-300">
                  <span className="text-zinc-600 mr-2">{i + 1}.</span>
                  {name}
                </span>
                <span className="text-zinc-500">{count} orders</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-zinc-500 text-sm mb-4">recent orders</h2>
          <div className="space-y-2">
            {orderList.slice(0, 10).map((order, i) => (
              <div
                key={`${order.date}-${order.restaurant}-${i}`}
                className="flex justify-between items-center text-sm py-2 border-b border-zinc-900"
              >
                <div>
                  <span className="text-zinc-300">{order.restaurant}</span>
                  <span className="text-zinc-600 ml-2">{order.date}</span>
                </div>
                <span className="text-zinc-400">${order.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 text-center text-zinc-700 text-xs">
          built with regret and claude code
        </footer>
      </main>
    </div>
  );
}
