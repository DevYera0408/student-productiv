import { motion } from "framer-motion";
import {
  CheckCircle2,
  Calendar,
  Trophy,
  TrendingUp,
  Clock,
} from "lucide-react";

const tasks = [
  {
    title: "Математика",
    progress: 90,
    color: "bg-cyan-500",
  },
  {
    title: "Информатика",
    progress: 75,
    color: "bg-violet-500",
  },
  {
    title: "История Казахстана",
    progress: 60,
    color: "bg-emerald-500",
  },
];

export default function DashboardPreview() {
  return (
    <section className="bg-slate-950 py-28">
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
          className="text-center"
        >
          <p className="font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Dashboard
          </p>

          <h2 className="mt-4 text-5xl font-black text-white">
            Всё управление в одном месте
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-400">
            Следите за продуктивностью, домашними заданиями,
            рейтингом и достижениями из одного современного кабинета.
          </p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="mt-20 overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/70 backdrop-blur-xl"
        >

          <div className="grid lg:grid-cols-[280px_1fr]">

            {/* Sidebar */}

            <aside className="border-r border-slate-800 p-8">

              <div className="mb-10 flex items-center gap-4">

                <div className="h-14 w-14 rounded-full bg-cyan-500" />

                <div>

                  <h3 className="font-bold text-white">
                    Eraly
                  </h3>

                  <p className="text-sm text-slate-400">
                    Student
                  </p>

                </div>

              </div>

              {[
                "Dashboard",
                "Домашние задания",
                "Календарь",
                "Достижения",
                "Настройки",
              ].map((item) => (

                <div
                  key={item}
                  className="mb-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800"
                >
                  {item}
                </div>

              ))}

            </aside>

            {/* Content */}

            <div className="p-8">

              <div className="grid gap-6 md:grid-cols-3">

                <Card
                  icon={<TrendingUp />}
                  value="94%"
                  title="Продуктивность"
                />

                <Card
                  icon={<CheckCircle2 />}
                  value="28"
                  title="Заданий"
                />

                <Card
                  icon={<Trophy />}
                  value="#4"
                  title="Рейтинг"
                />

              </div>

              <div className="mt-10">

                <h3 className="mb-6 text-2xl font-bold text-white">
                  Предметы
                </h3>

                <div className="space-y-5">

                  {tasks.map((task) => (

                    <motion.div
                      key={task.title}
                      whileHover={{ scale: 1.01 }}
                      className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5"
                    >

                      <div className="mb-3 flex justify-between">

                        <span className="text-white">
                          {task.title}
                        </span>

                        <span className="text-cyan-400">
                          {task.progress}%
                        </span>

                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${task.progress}%`,
                          }}
                          transition={{
                            duration: 1,
                          }}
                          className={`h-full ${task.color}`}
                        />

                      </div>

                    </motion.div>

                  ))}

                </div>

              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2">

                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">

                  <div className="flex items-center gap-3 text-white">

                    <Calendar />

                    Сегодня

                  </div>

                  <p className="mt-5 text-slate-400">
                    • Подготовка к ЕНТ
                  </p>

                  <p className="mt-3 text-slate-400">
                    • Решить 20 задач по математике
                  </p>

                  <p className="mt-3 text-slate-400">
                    • Повторить историю Казахстана
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">

                  <div className="flex items-center gap-3 text-white">

                    <Clock />

                    Следующий дедлайн

                  </div>

                  <h3 className="mt-6 text-3xl font-black text-cyan-400">

                    2 часа

                  </h3>

                  <p className="mt-2 text-slate-400">

                    Домашняя работа по информатике

                  </p>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}

function Card({ icon, value, title }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6"
    >
      <div className="text-cyan-400">
        {icon}
      </div>

      <h3 className="mt-4 text-4xl font-black text-white">
        {value}
      </h3>

      <p className="mt-2 text-slate-400">
        {title}
      </p>
    </motion.div>
  );
}
