import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChefHat,
  Clock,
  UtensilsCrossed,
  Plus,
  Trash2,
  Bike,
  Flame,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

import biryani from "@/assets/biryani.jpg";
import dosa from "@/assets/dosa.jpg";
import paneer from "@/assets/paneer.jpg";
import friedrice from "@/assets/friedrice.jpg";
import pizza from "@/assets/pizza.jpg";
import burger from "@/assets/burger.jpg";
import orangeJuice from "@/assets/orange-juice.jpg";
import watermelonJuice from "@/assets/watermelon-juice.jpg";
import mangoJuice from "@/assets/mango-juice.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const TRAVEL_MIN = 15;

type Category = "Meals" | "Juices";

type FoodItem = {
  id: string;
  name: string;
  image: string;
  price: number; // INR
  prep: number; // minutes
  category: Category;
};

const FOODS: FoodItem[] = [
  { id: "biryani", name: "Chicken Biryani", image: biryani, price: 250, prep: 30, category: "Meals" },
  { id: "dosa", name: "Masala Dosa", image: dosa, price: 120, prep: 15, category: "Meals" },
  { id: "paneer", name: "Paneer Butter Masala", image: paneer, price: 220, prep: 25, category: "Meals" },
  { id: "friedrice", name: "Veg Fried Rice", image: friedrice, price: 180, prep: 20, category: "Meals" },
  { id: "pizza", name: "Pizza", image: pizza, price: 300, prep: 20, category: "Meals" },
  { id: "burger", name: "Burger", image: burger, price: 150, prep: 15, category: "Meals" },
  { id: "orange", name: "Orange Juice", image: orangeJuice, price: 80, prep: 5, category: "Juices" },
  { id: "watermelon", name: "Watermelon Juice", image: watermelonJuice, price: 70, prep: 5, category: "Juices" },
  { id: "mango", name: "Mango Juice", image: mangoJuice, price: 90, prep: 5, category: "Juices" },
];

type ScheduledOrder = {
  uid: string;
  food: FoodItem;
  delivery: Date;
  startCook: Date;
  outForDelivery: Date;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function todayAt(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() < Date.now() - 6 * 60 * 60 * 1000) d.setDate(d.getDate() + 1);
  return d;
}
function hhmmFromDate(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function Index() {
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [delivery, setDelivery] = useState<string>("");
  const [orders, setOrders] = useState<ScheduledOrder[]>([]);
  const [now, setNow] = useState<number>(() => Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const prep = selected?.prep ?? 0;
  const minDeliveryDate = useMemo(
    () => (selected ? new Date(now + (prep + TRAVEL_MIN) * 60_000) : null),
    [selected, prep, now],
  );
  const minDeliveryHHMM = minDeliveryDate ? hhmmFromDate(minDeliveryDate) : "";
  const selectedDeliveryDate = useMemo(
    () => (delivery ? todayAt(delivery) : null),
    [delivery],
  );
  const isValid =
    !!selected &&
    !!selectedDeliveryDate &&
    !!minDeliveryDate &&
    selectedDeliveryDate.getTime() >= minDeliveryDate.getTime();

  function handleSelect(f: FoodItem) {
    setSelected(f);
    setError(null);
    const min = new Date(Date.now() + (f.prep + TRAVEL_MIN) * 60_000);
    setDelivery(hhmmFromDate(min));
    setTimeout(
      () =>
        document
          .getElementById("schedule-card")
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      50,
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !selectedDeliveryDate || !minDeliveryDate) return;
    if (selectedDeliveryDate.getTime() < minDeliveryDate.getTime()) {
      setError(
        `Invalid time. Earliest available is ${formatTime(minDeliveryDate)}.`,
      );
      return;
    }
    const d = selectedDeliveryDate;
    const order: ScheduledOrder = {
      uid: `${selected.id}-${Date.now()}`,
      food: selected,
      delivery: d,
      startCook: new Date(d.getTime() - (selected.prep + TRAVEL_MIN) * 60_000),
      outForDelivery: new Date(d.getTime() - TRAVEL_MIN * 60_000),
    };
    setOrders((o) => [...o, order].sort((a, b) => a.delivery.getTime() - b.delivery.getTime()));
    setSelected(null);
    setDelivery("");
    setError(null);
    setTimeout(
      () => document.getElementById("orders")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  }

  function removeOrder(uid: string) {
    setOrders((o) => o.filter((x) => x.uid !== uid));
  }

  const total = orders.reduce((s, o) => s + o.food.price, 0);

  const meals = FOODS.filter((f) => f.category === "Meals");
  const juices = FOODS.filter((f) => f.category === "Juices");

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-bg)" }}>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-primary)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Right-Time <span style={{ color: "var(--accent)" }}>Delivery</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">
            Schedule multiple dishes — each at its own delivery time. We handle the timing.
          </p>
        </header>

        {/* Meals */}
        <FoodSection
          title="Meals"
          items={meals}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
        />

        {/* Juices */}
        <FoodSection
          title="Juices"
          items={juices}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
        />

        {/* Schedule card */}
        <section id="schedule-card" className="mb-12">
          <Card
            className="overflow-hidden rounded-2xl border-0 p-6 sm:p-8"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Add to schedule</h2>
                <p className="text-sm text-muted-foreground">
                  Travel time fixed at <span className="font-semibold text-foreground">{TRAVEL_MIN} min</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="grid gap-5 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Label className="mb-2 block">Selected Food</Label>
                <div
                  className="flex items-center gap-3 rounded-xl border bg-secondary/60 p-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  {selected ? (
                    <>
                      <img
                        src={selected.image}
                        alt={selected.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{selected.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {rupees(selected.price)} · prep {selected.prep} min
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Tap a dish above to auto-fill your selection.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Prep Time (auto)</Label>
                <div
                  className="flex h-11 items-center justify-between rounded-xl border bg-muted/40 px-3 text-sm text-foreground"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="font-semibold tabular-nums">
                    {selected ? `${prep} min` : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">locked</span>
                </div>
              </div>
              <div>
                <Label htmlFor="delivery" className="mb-2 block">Delivery Time</Label>
                <Input
                  id="delivery"
                  type="time"
                  value={delivery}
                  min={minDeliveryHHMM || undefined}
                  onChange={(e) => {
                    setDelivery(e.target.value);
                    setError(null);
                  }}
                  disabled={!selected}
                  className="h-11 rounded-xl"
                  required
                />
                {selected && minDeliveryDate && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Earliest:{" "}
                    <span className="font-semibold text-foreground">
                      {formatTime(minDeliveryDate)}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex items-end">
                <div className="w-full rounded-xl bg-secondary/60 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Travel</p>
                  <p className="text-lg font-bold text-foreground">{TRAVEL_MIN} min</p>
                </div>
              </div>

              {selected && delivery && (
                <div className="sm:col-span-3">
                  {isValid ? (
                    <div
                      className="rounded-xl border px-4 py-3 text-sm font-semibold"
                      style={{
                        borderColor: "color-mix(in oklab, var(--primary) 40%, transparent)",
                        background: "color-mix(in oklab, var(--primary) 10%, transparent)",
                        color: "var(--primary)",
                      }}
                    >
                      ✅ Perfect! Will arrive at {formatTime(selectedDeliveryDate!)}.
                    </div>
                  ) : (
                    <div
                      className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
                      role="alert"
                    >
                      ⚠️ {error ??
                        `Earliest available is ${
                          minDeliveryDate ? formatTime(minDeliveryDate) : "—"
                        }.`}
                    </div>
                  )}
                </div>
              )}

              <div className="sm:col-span-3">
                <Button
                  type="submit"
                  disabled={!selected || !isValid}
                  size="lg"
                  className="h-14 w-full rounded-2xl text-base font-bold text-accent-foreground shadow-[var(--shadow-warm)] transition-transform hover:scale-[1.01] hover:opacity-95 disabled:opacity-50"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add to Schedule
                </Button>
              </div>
            </form>
          </Card>
        </section>

        {/* Scheduled orders */}
        <section id="orders" className="mb-10">
          <div className="mb-5 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-foreground" />
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">Scheduled Orders</h2>
            </div>
            <span className="text-sm text-muted-foreground">{orders.length} item{orders.length === 1 ? "" : "s"}</span>
          </div>

          {orders.length === 0 ? (
            <Card
              className="rounded-2xl border-0 p-8 text-center text-muted-foreground"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              No orders yet. Pick a dish and add it to your schedule.
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((o) => (
                <Card
                  key={o.uid}
                  className="overflow-hidden rounded-2xl border-0 p-0"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <img
                      src={o.food.image}
                      alt={o.food.name}
                      loading="lazy"
                      className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-20"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-foreground">
                            {o.food.name}
                          </h3>
                          <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                            {rupees(o.food.price)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeOrder(o.uid)}
                          aria-label="Remove order"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <TimeChip icon={<Flame className="h-3.5 w-3.5" />} label="Cook" time={formatTime(o.startCook)} />
                        <TimeChip icon={<Bike className="h-3.5 w-3.5" />} label="Out" time={formatTime(o.outForDelivery)} />
                        <TimeChip icon={<PackageCheck className="h-3.5 w-3.5" />} label="Deliver" time={formatTime(o.delivery)} highlight />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Total */}
              <Card
                className="flex items-center justify-between rounded-2xl border-0 p-5"
                style={{ boxShadow: "var(--shadow-primary)", background: "var(--gradient-primary)" }}
              >
                <span className="text-base font-semibold text-primary-foreground">Total</span>
                <span className="text-2xl font-extrabold text-primary-foreground">{rupees(total)}</span>
              </Card>
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          <code>Start Cooking = Delivery − (Prep + {TRAVEL_MIN}m Travel)</code>
        </footer>
      </main>
    </div>
  );
}

function FoodSection({
  title,
  items,
  selectedId,
  onSelect,
}: {
  title: string;
  items: FoodItem[];
  selectedId: string | null;
  onSelect: (f: FoodItem) => void;
}) {
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
        <span className="text-sm text-muted-foreground">{items.length} items</span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => {
          const active = selectedId === f.id;
          return (
            <Card
              key={f.id}
              className="group relative overflow-hidden rounded-2xl border-0 p-0 transition-all duration-300 hover:-translate-y-1"
              style={{
                boxShadow: active ? "var(--shadow-primary)" : "var(--shadow-card)",
                outline: active ? "2px solid var(--primary)" : "none",
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={f.image}
                  alt={f.name}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-accent-foreground shadow"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  {rupees(f.price)}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-foreground">{f.name}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> ~{f.prep} min
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onSelect(f)}
                    className={
                      active
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }
                  >
                    {active ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function TimeChip({
  icon,
  label,
  time,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border px-2 py-2"
      style={{
        borderColor: "var(--border)",
        background: highlight ? "color-mix(in oklab, var(--primary) 10%, transparent)" : "var(--secondary)",
        color: highlight ? "var(--primary)" : "var(--foreground)",
      }}
    >
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
        {icon} {label}
      </span>
      <span className="mt-0.5 text-sm font-bold tabular-nums">{time}</span>
    </div>
  );
}
