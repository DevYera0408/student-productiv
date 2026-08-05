import { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="bg-slate-950 py-28 relative">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-10 md:p-14 backdrop-blur-xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-white">Остались вопросы или предложения?</h2>
            <p className="mt-4 text-slate-400">
              Свяжитесь с нами для подключения вашего учебного заведения или поддержки.
            </p>

            {submitted ? (
              <div className="mt-8 p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center gap-3">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-semibold text-lg">Спасибо! Ваше сообщение успешно отправлено.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ваш email"
                    required
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Сообщение или запрос на демо..."
                    required
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition resize-none"
                  />
                </div>
                <Button type="submit" className="w-full py-3.5">
                  <Send className="w-4 h-4" />
                  <span>Отправить сообщение</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
