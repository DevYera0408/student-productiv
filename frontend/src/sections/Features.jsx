import { motion } from "framer-motion";
import {
  Brain,
  Trophy,
  BookOpen,
  BarChart3,
  Bell,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-помощник",
    description:
      "Интеллектуальные рекомендации по учебе, анализ продуктивности и персональные советы.",
  },
  {
    icon: Trophy,
    title: "Система достижений",
    description:
      "Получайте достижения, повышайте рейтинг и мотивируйте учеников учиться лучше.",
  },
  {
    icon: BookOpen,
    title: "Домашние задания",
    description:
      "Все задания, дедлайны и предметы находятся в одном месте.",
  },
  {
    icon: BarChart3,
    title: "Аналитика",
    description:
      "Красивые графики успеваемости, посещаемости и продуктивности.",
  },
  {
    icon: Bell,
    title: "Уведомления",
    description:
      "Напоминания о дедлайнах, новых заданиях и важных событиях.",
  },
  {
    icon: ShieldCheck,
    title: "Безопасность",
    description:
      "JWT-авторизация, разграничение ролей и защищённый доступ.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-950 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-cyan-400 font-semibold uppercase tracking-[0.25em]">
            Возможности
          </p>

          <h2 className="mt-4 text-5xl font-black text-white">
            Всё для эффективной учебы
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-400">
            Student Productivity объединяет учеников, учителей и администрацию
            в единой современной платформе.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.6,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl transition"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500 group-hover:text-black">
                  <Icon size={30} />
                </div>

                <h3 className="mt-8 text-2xl font-bold text-white">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}