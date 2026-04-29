import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChefHat,
  Bike,
  PackageCheck,
  Flame,
  UtensilsCrossed,
  Clock,
  Check,
  ArrowLeft,
  Rocket,
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

export const Route = createFileRoute("/")({
  component: Index,
});

const TRAVEL_MIN = 15;

type FoodItem = {
  id: string;
  name: string;
  desc: string;
  image: string;
  defaultPrep: number;
  tag: string;
};

const FOODS: FoodItem[] = [
  { id: "biryani", name: "Chicken Biryani", desc: "Aromatic basmati rice with spicy chicken", image: biryani, defaultPrep: 35, tag: "Spicy" },
  { id: "dosa", name: "Masala Dosa", desc: "Crispy South Indian crêpe with potato filling", image: dosa, defaultPrep: 15, tag: "Veg" },
  { id: "paneer", name: "Paneer Butter Masala", desc: "Creamy tomato curry with soft paneer", image: paneer, defaultPrep: 25, tag: "Veg" },
  { id: "friedrice", name: "Veg Fried Rice", desc: "Wok-tossed rice with crunchy vegetables", image: friedrice, defaultPrep: 18, tag: "Veg" },
  { id: "pizza", name: "Cheese Burst Pizza", desc: "Stretchy mozzarella with fresh basil", image: pizza, defaultPrep: 22, tag: "Bestseller" },
  { id: "burger", name: "Crispy Chicken Burger", desc: "Golden fried chicken with fresh lettuce", image: burger, defaultPrep: 20, tag: "New" },
];

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
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}
function defaultDeliveryHHMM() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Schedule = {
  food: FoodItem;
  prep: number;
  startCook: Date;
  outForDelivery: Date;
  delivery: Date;
};

function Index() {
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [prep, setPrep] = useState<number>(20);
  const [delivery, setDelivery] = useState<string>(defaultDeliveryHHMM());
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  function handleSelect(f: FoodItem) {
    setSelected(f);
    setPrep(f.defaultPrep);
    document.getElementById("schedule-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const deliveryDate = todayAt(delivery);
    const startCook = new Date(deliveryDate.getTime() - (prep + TRAVEL_MIN) * 60 * 1000);
    const outForDelivery = new Date(deliveryDate.getTime() - TRAVEL_MIN * 60 * 1000);
    setSchedule({ food: selected, prep, startCook, outForDelivery, delivery: deliveryDate });
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }

  if (schedule) {
    return <ResultDashboard schedule={schedule} onBack={() => setSchedule(null)} />;
  }

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
            Right-Time <span style={{ color: "var(--accent)" }}>Food Delivery</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">
            Pick your dish, set your delivery time. We'll start cooking at the perfect moment so it arrives hot and fresh.
          </p>
        </header>

        {/* Food grid */}
        <section className="mb-12">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">What's on your mind?</h2>
            <span className="text-sm text-muted-foreground">{FOODS.length} dishes</span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FOODS.map((f) => {
              const active = selected?.id === f.id;
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
                      className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow"
                      style={{ background: "var(--gradient-warm)" }}
                    >
                      {f.tag}
                    </span>
                    {active && (
                      <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-foreground">{f.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{f.desc}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> ~{f.defaultPrep} min
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleSelect(f)}
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

        {/* Schedule card */}
        <section id="schedule-card">
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
                <h2 className="text-xl font-bold text-foreground">Schedule your meal</h2>
                <p className="text-sm text-muted-foreground">
                  Travel time fixed at <span className="font-semibold text-foreground">{TRAVEL_MIN} min</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSchedule} className="grid gap-5 sm:grid-cols-3">
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
                        <p className="truncate text-xs text-muted-foreground">{selected.desc}</p>
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
                <Label htmlFor="prep" className="mb-2 block">Preparation Time (min)</Label>
                <Input
                  id="prep"
                  type="number"
                  min={1}
                  value={prep}
                  onChange={(e) => setPrep(Number(e.target.value))}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="delivery" className="mb-2 block">Delivery Time</Label>
                <Input
                  id="delivery"
                  type="time"
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="flex items-end">
                <div className="w-full rounded-xl bg-secondary/60 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Travel</p>
                  <p className="text-lg font-bold text-foreground">{TRAVEL_MIN} min</p>
                </div>
              </div>

              <div className="sm:col-span-3">
                <Button
                  type="submit"
                  disabled={!selected}
                  size="lg"
                  className="h-14 w-full rounded-2xl text-base font-bold text-accent-foreground shadow-[var(--shadow-warm)] transition-transform hover:scale-[1.01] hover:opacity-95 disabled:opacity-50"
                  style={{ background: "var(--gradient-warm)" }}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Schedule Right-Time Delivery
                </Button>
              </div>
            </form>
          </Card>
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Smart scheduling: <code>Start Cooking = Delivery − (Prep + Travel)</code>
        </footer>
      </main>
    </div>
  );
}

function ResultDashboard({ schedule, onBack }: { schedule: Schedule; onBack: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = useMemo(() => {
    const diff = Math.max(0, schedule.delivery.getTime() - now);
    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return { h, m, s, done: diff === 0 };
  }, [schedule, now]);

  const stage = useMemo(() => {
    if (now < schedule.startCook.getTime()) return 0;
    if (now < schedule.outForDelivery.getTime()) return 1;
    if (now < schedule.delivery.getTime()) return 2;
    return 3;
  }, [schedule, now]);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-bg)" }}>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to menu
        </button>

        {/* Hero summary card */}
        <Card
          className="overflow-hidden rounded-3xl border-0 p-0"
          style={{ boxShadow: "var(--shadow-primary)" }}
        >
          <div className="grid sm:grid-cols-2">
            <div className="relative aspect-[4/3] sm:aspect-auto">
              <img
                src={schedule.food.image}
                alt={schedule.food.name}
                width={768}
                height={768}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span
                className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-accent-foreground shadow-lg"
                style={{ background: "var(--gradient-warm)" }}
              >
                <Flame className="h-3.5 w-3.5" /> Scheduled
              </span>
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Your order
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
                  {schedule.food.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{schedule.food.desc}</p>
              </div>
              <div className="rounded-2xl bg-secondary/70 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Countdown to delivery
                </p>
                <p
                  className="mt-1 text-4xl font-extrabold tabular-nums sm:text-5xl"
                  style={{ color: "var(--primary)" }}
                >
                  {countdown.done
                    ? "Delivered 🎉"
                    : `${pad(countdown.h)}:${pad(countdown.m)}:${pad(countdown.s)}`}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Time tiles */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <TimeTile
            label="Start cooking at"
            value={formatTime(schedule.startCook)}
            sub={`${schedule.prep} min prep`}
            icon={<ChefHat className="h-5 w-5" />}
            highlight
          />
          <TimeTile
            label="Out for delivery"
            value={formatTime(schedule.outForDelivery)}
            sub={`${TRAVEL_MIN} min ride`}
            icon={<Bike className="h-5 w-5" />}
          />
          <TimeTile
            label="Delivery scheduled"
            value={formatTime(schedule.delivery)}
            sub="Hot & fresh"
            icon={<PackageCheck className="h-5 w-5" />}
          />
        </div>

        {/* Timeline */}
        <Card
          className="mt-6 rounded-2xl border-0 p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="mb-6 text-lg font-bold text-foreground">Live progress</h2>
          <Timeline stage={stage} />
          <p className="mt-6 text-center text-sm font-semibold" style={{ color: "var(--accent)" }}>
            ✓ Food will arrive hot and fresh
          </p>
        </Card>
      </main>
    </div>
  );
}

function TimeTile({
  label,
  value,
  sub,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card
      className="rounded-2xl border-0 p-5"
      style={{
        boxShadow: highlight ? "var(--shadow-warm)" : "var(--shadow-card)",
        background: highlight ? "var(--gradient-warm)" : undefined,
      }}
    >
      <div
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${
          highlight ? "text-accent-foreground/90" : "text-muted-foreground"
        }`}
      >
        {icon}
        {label}
      </div>
      <p
        className={`mt-2 text-3xl font-extrabold tabular-nums ${
          highlight ? "text-accent-foreground" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-xs ${highlight ? "text-accent-foreground/80" : "text-muted-foreground"}`}
      >
        {sub}
      </p>
    </Card>
  );
}

function Timeline({ stage }: { stage: number }) {
  const steps = [
    { label: "Cooking", icon: <ChefHat className="h-5 w-5" />, active: stage >= 1 },
    { label: "Out for delivery", icon: <Bike className="h-5 w-5" />, active: stage >= 2 },
    { label: "Delivered", icon: <PackageCheck className="h-5 w-5" />, active: stage >= 3 },
  ];
  const pct = stage === 0 ? 0 : stage === 1 ? 50 : stage === 2 ? 100 : 100;

  return (
    <div className="relative px-5">
      <div className="absolute left-10 right-10 top-5 h-1 rounded-full bg-muted" />
      <div
        className="absolute left-10 top-5 h-1 rounded-full transition-all duration-700"
        style={{ width: `calc((100% - 5rem) * ${pct / 100})`, background: "var(--gradient-primary)" }}
      />
      <ol className="relative grid grid-cols-3 gap-2">
        {steps.map((s) => (
          <li key={s.label} className="flex flex-col items-center text-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                s.active
                  ? "border-transparent text-primary-foreground shadow-[var(--shadow-primary)]"
                  : "border-border bg-background text-muted-foreground"
              }`}
              style={s.active ? { background: "var(--gradient-primary)" } : undefined}
            >
              {s.icon}
            </div>
            <span
              className={`mt-2 text-xs font-semibold sm:text-sm ${
                s.active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
