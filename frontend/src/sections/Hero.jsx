import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Trophy,
  Users,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      {/* Background */}

      <div className="absolute inset-0">

        <div className="absolute top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

      </div>

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7 }}
          className="text-center"
        >

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-cyan-300">

            <Sparkles size={18} />

            Платформа нового поколения

          </div>

          <h1 className="mt-8 text-6xl font-black leading-tight md:text-8xl">

            Student

            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">

              Productivity

            </span>

          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-slate-400">

            Современная система для контроля продуктивности,
            мотивации и развития учеников.

            Ученики, учителя и администрация —
            всё в одном месте.

          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">

            <Link
              to="/register"
              className="group flex items-center gap-3 rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Начать бесплатно

              <ArrowRight
                size={20}
                className="transition group-hover:translate-x-1"
              />

            </Link>

            <Link
              to="/login"
              className="rounded-2xl border border-slate-700 px-8 py-4 hover:bg-slate-900"
            >
              Войти
            </Link>

          </div>

        </motion.div>

        {/* Statistics */}

        <div className="mt-24 grid w-full gap-8 md:grid-cols-3">

          {[
            {
              icon: Users,
              value: "1000+",
              title: "Учеников"
            },

            {
              icon: GraduationCap,
              value: "50+",
              title: "Учителей"
            },

            {
              icon: Trophy,
              value: "98%",
              title: "Успеваемость"
            }

          ].map((item) => {

            const Icon = item.icon;

            return (

              <motion.div

                whileHover={{ y: -10 }}

                key={item.title}

                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl"

              >

                <Icon
                  className="text-cyan-400"
                  size={42}
                />

                <h2 className="mt-6 text-5xl font-black">

                  {item.value}

                </h2>

                <p className="mt-3 text-lg text-slate-400">

                  {item.title}

                </p>

              </motion.div>

            );

          })}

        </div>

      </div>

    </section>
  );
}