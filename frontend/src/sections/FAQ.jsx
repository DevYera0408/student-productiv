import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Как рассчитывается индекс продуктивности?',
    a: 'Индекс высчитывается по взвешенной формуле: успеваемость (30%), выполнение ДЗ (20%), посещаемость (15%), подготовка к экзаменам/ЕНТ (15%), дополнительная активность (10%) и соблюдение режима/сна (10%).',
  },
  {
    q: 'Может ли учитель изменять мои оценки или ставить отметки?',
    a: 'Да. Учитель имеет доступ к кабинету класса, может верифицировать выполнение ДЗ, ставить проверочные отметки и оставлять комментарии.',
  },
  {
    q: 'Платформа бесплатна для школьников?',
    a: 'Да! Базовый функционал отслеживания продуктивности, расписания и рейтинга полностью бесплатен для учеников.',
  },
  {
    q: 'Как зарегистрировать свою школу или класс?',
    a: 'Создайте аккаунт с ролью "Учитель" или "Администратор", укажите название школы и классы для синхронизации расписания.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="bg-slate-950 py-28 border-t border-slate-900">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <p className="text-cyan-400 font-semibold uppercase tracking-[0.25em]">Часто задаваемые вопросы</p>
          <h2 className="mt-4 text-5xl font-black text-white">Всё, что вам нужно знать</h2>
        </div>

        <div className="mt-16 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-lg text-white hover:text-cyan-400 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-slate-800/40 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
