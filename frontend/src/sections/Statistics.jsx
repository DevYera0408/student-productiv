import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const productivity = [
  { day: "Пн", value: 72 },
  { day: "Вт", value: 78 },
  { day: "Ср", value: 84 },
  { day: "Чт", value: 88 },
  { day: "Пт", value: 91 },
  { day: "Сб", value: 94 },
  { day: "Вс", value: 97 },
];

const cards = [
  {
    title: "Активных учеников",
    value: "1 247",
    growth: "+18%",
  },
  {
    title: "Выполненных заданий",
    value: "24 890",
    growth: "+31%",
  },
  {
    title: "Средняя продуктивность",
    value: "94%",
    growth: "+12%",
  },
];

export default function Statistics() {
  return (
    <section className="bg-slate-950 py-28">
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
          className="text-center"
        >
          <p className="text-cyan-400 font-semibold uppercase tracking-[0.25em]">
            Аналитика
          </p>

          <h2 className="mt-4 text-5xl font-black text-white">
            Следите за прогрессом
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-slate-400 text-lg">
            Все данные собираются в режиме реального времени и помогают
            принимать правильные решения.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * .15,
                duration: .6,
              }}
              viewport={{ once: true }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl"
            >
              <p className="text-slate-400">
                {card.title}
              </p>

              <h3 className="mt-4 text-5xl font-black text-white">
                {card.value}
              </h3>

              <span className="mt-4 inline-flex rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400">
                {card.growth}
              </span>

            </motion.div>
          ))}

        </div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="mt-14 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl"
        >

          <div className="mb-8 flex items-center justify-between">

            <div>

              <h3 className="text-3xl font-black text-white">
                Продуктивность за неделю
              </h3>

              <p className="mt-2 text-slate-400">
                Средняя активность учеников
              </p>

            </div>

            <div className="rounded-xl bg-cyan-500/10 px-5 py-2 text-cyan-400">
              Live
            </div>

          </div>

          <div className="h-96">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart data={productivity}>

                <defs>

                  <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">

                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.8} />

                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />

                  </linearGradient>

                </defs>

                <CartesianGrid stroke="#1e293b" />

                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                />

                <YAxis
                  stroke="#64748b"
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#06B6D4"
                  strokeWidth={4}
                  fill="url(#color)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

      </div>
    </section>
  );
}
