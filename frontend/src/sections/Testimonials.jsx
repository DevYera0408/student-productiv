import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Айдос Нурланов',
    role: 'Ученик 11 "А" класса',
    school: 'НИШ ФМН Алматы',
    text: 'Благодаря индекс-трекеру продуктивности я смог структурировать подготовку к ЕНТ. Поднял средний балл с 75% до 94% за 2 месяца!',
    rating: 5,
  },
  {
    name: 'Елена Викторовна',
    role: 'Учитель математики',
    school: 'Лицей №165',
    text: 'Платформа позволяет моментально видеть, кому из учеников нужна помощь с домашним заданием. Оценка посещаемости и режим сна — вообще находка.',
    rating: 5,
  },
  {
    name: 'Данияр Ахметов',
    role: 'Ученик 10 "Б" класса',
    school: 'Школа-лицей №8',
    text: 'Геймификация и рейтинг классов превратили обычную учебу в увлекательное соревнование с друзьями. Каждую неделю боремся за 1-е место!',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-slate-950 py-28 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-cyan-400 font-semibold uppercase tracking-[0.25em]">Отзывы</p>
          <h2 className="mt-4 text-5xl font-black text-white">Что говорят наши пользователи</h2>
          <p className="mx-auto mt-6 max-w-2xl text-slate-400">
            Студенты и преподаватели уже используют платформу для достижения высоких результатов.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-cyan-500/30 mb-4" />
                <p className="text-slate-300 leading-relaxed italic">"{t.text}"</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <h4 className="font-bold text-white text-base">{t.name}</h4>
                <p className="text-xs text-cyan-400 font-medium">{t.role}</p>
                <p className="text-xs text-slate-500">{t.school}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
