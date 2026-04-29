import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChefHat, Bike, PackageCheck, Clock, Flame, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Index,
});

const TRAVEL_MIN = 15;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function todayAt(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  // If the chosen time already passed today, schedule for tomorrow
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

function defaultDeliveryHHMM() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Result = {
  food: string;
  prep: number;
  startCook: Date;
  outForDelivery: Date;
  delivery: Date;
};

function Index() {
  const [food, setFood] = useState("Margherita Pizza");
  const [prep, setPrep] = useState(20);
  const [delivery, setDelivery] = useState(defaultDeliveryHHMM());
  const [result, setResult] = useState<Result | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const deliveryDate = todayAt(delivery);
    const startCook = new Date(deliveryDate.getTime() - (prep + TRAVEL_MIN) * 60 * 1000);
    const outForDelivery = new Date(deliveryDate.getTime() - TRAVEL_MIN * 60 * 1000);
    setResult({ food, prep, startCook, outForDelivery, delivery: deliveryDate });
  }

  const countdown = useMemo(() => {
    if (!result) return null;
    const diff = Math.max(0, result.delivery.getTime() - now);
    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return { h, m, s, done: diff === 0 };
  }, [result, now]);

  const stage = useMemo(() => {
    if (!result) return 0;
    if (now < result.startCook.getTime()) return 0; // waiting
    if (now < result.outForDelivery.getTime()) return 1; // cooking
    if (now < result.delivery.getTime()) return 2; // out for delivery
    return 3; // delivered
  }, [result, now]);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-bg)" }}>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
        <header className="mb-10 text-center">
          <div
            className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-warm)]"
            style={{ background: "var(--gradient-warm)" }}
          >
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Right-Time Food Delivery
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">
            Tell us when you want to eat. We'll tell you exactly when to start cooking so it
            arrives hot and fresh — never early, never late.
          </p>
        </header>

        <Card
          className="border-0 p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <form onSubmit={handleCalculate} className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="food" className="mb-2 block">Food item</Label>
              <Input
                id="food"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                placeholder="e.g. Margherita Pizza"
                required
              />
            </div>
            <div>
              <Label htmlFor="prep" className="mb-2 block">Preparation time (min)</Label>
              <Input
                id="prep"
                type="number"
                min={1}
                value={prep}
                onChange={(e) => setPrep(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="delivery" className="mb-2 block">Delivery time</Label>
              <Input
                id="delivery"
                type="time"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Travel time fixed at <span className="font-semibold text-foreground">{TRAVEL_MIN} min</span>
              </p>
              <Button
                type="submit"
                size="lg"
                className="text-primary-foreground shadow-[var(--shadow-warm)] hover:opacity-95"
                style={{ background: "var(--gradient-warm)" }}
              >
                <Flame className="mr-2 h-4 w-4" /> Calculate
              </Button>
            </div>
          </form>
        </Card>

        {result && (
          <section className="mt-8 grid gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <ResultTile
                label="Start cooking at"
                value={formatTime(result.startCook)}
                icon={<ChefHat className="h-5 w-5" />}
                accent
              />
              <ResultTile
                label="Out for delivery"
                value={formatTime(result.outForDelivery)}
                icon={<Bike className="h-5 w-5" />}
              />
              <ResultTile
                label="Delivery scheduled"
                value={formatTime(result.delivery)}
                icon={<PackageCheck className="h-5 w-5" />}
              />
            </div>

            <Card className="border-0 p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Countdown to delivery</p>
                  <p className="mt-1 text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                    {countdown && !countdown.done
                      ? `${pad(countdown.h)}:${pad(countdown.m)}:${pad(countdown.s)}`
                      : "Delivered 🎉"}
                  </p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent sm:inline-flex">
                  <Clock className="h-4 w-4" />
                  {result.food}
                </div>
              </div>

              <Timeline stage={stage} />

              <p className="mt-6 text-center text-sm font-medium text-accent">
                Food will arrive hot and fresh
              </p>
            </Card>
          </section>
        )}

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Smart scheduling: <code>Start = Delivery − (Prep + Travel)</code>
        </footer>
      </main>
    </div>
  );
}

function ResultTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card
      className="border-0 p-5"
      style={{
        boxShadow: "var(--shadow-card)",
        background: accent ? "var(--gradient-warm)" : undefined,
      }}
    >
      <div
        className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wide ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}
      >
        {icon}
        {label}
      </div>
      <p
        className={`mt-2 text-2xl font-bold tabular-nums ${accent ? "text-primary-foreground" : "text-foreground"}`}
      >
        {value}
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

  // Progress fill: 0 → 0%, 1 → 33%, 2 → 66%, 3 → 100%
  const pct = stage === 0 ? 0 : stage === 1 ? 33 : stage === 2 ? 66 : 100;

  return (
    <div className="relative">
      <div className="absolute left-5 right-5 top-5 h-1 rounded-full bg-muted" />
      <div
        className="absolute left-5 top-5 h-1 rounded-full transition-all duration-700"
        style={{ width: `calc(${pct}% - ${pct === 0 ? 0 : 10}px)`, background: "var(--gradient-warm)" }}
      />
      <ol className="relative grid grid-cols-3 gap-2">
        {steps.map((s) => (
          <li key={s.label} className="flex flex-col items-center text-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                s.active
                  ? "border-transparent text-primary-foreground shadow-[var(--shadow-warm)]"
                  : "border-border bg-background text-muted-foreground"
              }`}
              style={s.active ? { background: "var(--gradient-warm)" } : undefined}
            >
              {s.icon}
            </div>
            <span
              className={`mt-2 text-xs font-medium sm:text-sm ${s.active ? "text-foreground" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
