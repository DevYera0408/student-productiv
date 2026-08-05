import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyEntries, upsertEntry, getSchedule, getHomeworks, toggleHomework, getRanking } from '../api/student';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  BarChart3,
  Trophy,
  PlusCircle,
  CheckCircle2,
  Clock,
  Star,
  Award,
  Zap,
  TrendingUp,
  User,
  LogOut,
  Flame,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import ProductivityChart from '../components/charts/ProductivityChart';
import AttendanceChart from '../components/charts/AttendanceChart';
import ProgressChart from '../components/charts/ProgressChart';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [entries, setEntries] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  // Daily Entry Modal state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryForm, setEntryForm] = useState({
    avg_grade: 85,
    lessons_count: 6,
    tasks_done: 5,
    homework_done: true,
    prep_time_min: 60,
    ent_prep_min: 45,
    reading_min: 30,
    sleep_hours: 8,
    mood: 4,
    wellbeing: 4,
    attended: true,
    late: false,
    absent: false,
  });
  const [savingEntry, setSavingEntry] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  const [selectedDay, setSelectedDay] = useState(0); // 0=Monday

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [entriesData, scheduleData, hwData, rankData] = await Promise.all([
        getMyEntries(7).catch(() => []),
        getSchedule(user?.class_num, user?.class_letter).catch(() => []),
        getHomeworks().catch(() => []),
        getRanking(7).catch(() => []),
      ]);
      setEntries(entriesData);
      setSchedule(scheduleData);
      setHomeworks(hwData);
      setRanking(rankData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    setSavingEntry(true);
    try {
      const updated = await upsertEntry(entryForm);
      showToast('Запись за сегодня успешно сохранена!');
      setIsEntryModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка сохранения записи');
    } finally {
      setSavingEntry(false);
    }
  };

  const handleToggleHw = async (id) => {
    try {
      await toggleHomework(id);
      setHomeworks((prev) =>
        prev.map((hw) => (hw.id === id ? { ...hw, completed: !hw.completed } : hw))
      );
      showToast('Статус задания обновлен!');
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics calculations
  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const latestScore = latestEntry ? latestEntry.productivity : 88;
  const latestStars = latestEntry ? latestEntry.stars : 4;
  const userRankIndex = ranking.findIndex((r) => r.student_id === user?.id);
  const rankPosition = userRankIndex !== -1 ? userRankIndex + 1 : '#3';

  // Attendance breakdown
  const attendedCount = entries.filter((e) => e.attended && !e.late).length || 5;
  const lateCount = entries.filter((e) => e.late).length || 1;
  const absentCount = entries.filter((e) => e.absent).length || 0;

  // Chart data
  const productivityChartData = entries.map((e) => ({
    date: new Date(e.date).toLocaleDateString('ru-RU', { weekday: 'short' }),
    productivity: e.productivity,
  }));

  const filteredSchedule = schedule.filter((item) => item.day_of_week === selectedDay);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900/80 border-r border-slate-800/80 p-6 flex flex-col justify-between shrink-0 backdrop-blur-xl">
        <div>
          {/* User Profile Header */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-white text-base truncate">{user?.name || 'Ученик'}</h3>
              <p className="text-xs text-cyan-400 font-medium truncate">
                {user?.class_num ? `${user.class_num}"${user.class_letter}" класс` : 'Ученик'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
              { id: 'schedule', label: 'Расписание', icon: Calendar },
              { id: 'homework', label: 'Домашние задания', icon: BookOpen },
              { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
              { id: 'leaderboard', label: 'Рейтинг', icon: Trophy },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-3">
          <Button
            onClick={() => setIsEntryModalOpen(true)}
            variant="primary"
            className="w-full py-3 shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Заполнить день</span>
          </Button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Выйти из системы</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white">Добро пожаловать, {user?.name}!</h1>
                <p className="text-slate-400 text-sm mt-1">Отличный день для повышения показателей учебы.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Серия: <strong className="text-amber-400">4 дня подряд</strong>
                </span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Продуктивность</p>
                    <h3 className="text-4xl font-black text-cyan-400 mt-2">{latestScore}%</h3>
                  </div>
                  <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-amber-400">
                  {[...Array(latestStars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                  <span className="text-xs text-slate-400 ml-2 font-medium">({latestStars}/5 звезд)</span>
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Рейтинг в школе</p>
                    <h3 className="text-4xl font-black text-amber-400 mt-2">#{rankPosition}</h3>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">Топик класса 10"А"</p>
              </Card>

              <Card>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Посещаемость</p>
                    <h3 className="text-4xl font-black text-emerald-400 mt-2">96%</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">18 посещений за месяц</p>
              </Card>

              <Card>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Задания ДЗ</p>
                    <h3 className="text-4xl font-black text-violet-400 mt-2">
                      {homeworks.filter((h) => h.completed).length} / {homeworks.length}
                    </h3>
                  </div>
                  <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">Выполнено к урокам</p>
              </Card>
            </div>

            {/* Charts & Quick Tasks Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Динамика продуктивности</h3>
                    <p className="text-xs text-slate-400">График изменений за последнюю неделю</p>
                  </div>
                  <span className="text-xs text-cyan-400 font-semibold px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                    +12% к прошлой неделе
                  </span>
                </div>
                <ProductivityChart data={productivityChartData} />
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Домашние задания</h3>
                  <button onClick={() => setActiveTab('homework')} className="text-xs text-cyan-400 hover:underline">
                    Все ({homeworks.length})
                  </button>
                </div>
                <div className="space-y-3">
                  {homeworks.slice(0, 4).map((hw) => (
                    <div
                      key={hw.id}
                      onClick={() => handleToggleHw(hw.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        hw.completed
                          ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                            hw.completed ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-600'
                          }`}
                        >
                          {hw.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${hw.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                            {hw.title}
                          </p>
                          <p className="text-xs text-slate-400">{hw.subject}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Daily Remarks from Teacher */}
            {latestEntry?.teacher_remark && (
              <div className="p-6 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-start gap-4">
                <div className="p-3 bg-violet-500/20 rounded-2xl text-violet-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Замечание / Отзыв преподавателя</h4>
                  <p className="text-slate-300 text-sm mt-1">{latestEntry.teacher_remark}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white">Расписание уроков</h1>
              <p className="text-slate-400 text-sm mt-1">Класс {user?.class_num || '10'}"{user?.class_letter || 'A'}"</p>
            </div>

            {/* Day Switcher */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
              {daysOfWeek.map((day, idx) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(idx)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer ${
                    selectedDay === idx
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {filteredSchedule.length > 0 ? (
                filteredSchedule.map((item) => (
                  <Card key={item.id} className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400">
                        {item.lesson_num}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{item.subject}</h4>
                        <p className="text-xs text-slate-400">Учитель: {item.teacher_name || 'Преподаватель'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-300 block">{item.time_slot || '08:30 - 09:15'}</span>
                      <span className="text-xs text-cyan-400 font-medium">Кабинет {item.room || '301'}</span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">На выбранный день уроки не назначены</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HOMEWORK TAB */}
        {activeTab === 'homework' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white">Домашние задания</h1>
                <p className="text-slate-400 text-sm mt-1">Отмечайте выполненные задания к урокам</p>
              </div>
            </div>

            <div className="grid gap-4">
              {homeworks.map((hw) => (
                <Card key={hw.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleHw(hw.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-1 transition cursor-pointer ${
                        hw.completed ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-600 hover:border-cyan-400'
                      }`}
                    >
                      {hw.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg">
                          {hw.subject}
                        </span>
                        <span className="text-xs text-slate-400">Срок: {hw.due_date}</span>
                      </div>
                      <h3 className={`text-lg font-bold mt-2 ${hw.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {hw.title}
                      </h3>
                      {hw.description && <p className="text-sm text-slate-400 mt-1">{hw.description}</p>}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        hw.completed
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}
                    >
                      {hw.completed ? 'Сдано' : 'В процессе'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black text-white">Аналитика и успеваемость</h1>
              <p className="text-slate-400 text-sm mt-1">Детальный разбор показателей и посещаемости</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <h3 className="text-lg font-bold text-white mb-4">Статистика посещаемости</h3>
                <AttendanceChart attended={attendedCount} late={lateCount} absent={absentCount} />
              </Card>

              <Card>
                <h3 className="text-lg font-bold text-white mb-4">Распределение успеваемости</h3>
                <ProgressChart />
              </Card>
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white">Рейтинг учеников школы</h1>
              <p className="text-slate-400 text-sm mt-1">Топ лидеров по индексу продуктивности за 7 дней</p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/40">
                      <th className="p-4 pl-6">Место</th>
                      <th className="p-4">Ученик</th>
                      <th className="p-4">Класс</th>
                      <th className="p-4">Индекс</th>
                      <th className="p-4 pr-6 text-right">Звезды</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {ranking.map((row, index) => {
                      const isMe = row.student_id === user?.id;
                      return (
                        <tr
                          key={row.student_id}
                          className={`transition ${isMe ? 'bg-cyan-500/10 font-bold' : 'hover:bg-slate-800/40'}`}
                        >
                          <td className="p-4 pl-6">
                            <span
                              className={`inline-flex w-8 h-8 items-center justify-center rounded-xl font-black text-xs ${
                                index === 0
                                  ? 'bg-amber-400 text-slate-950'
                                  : index === 1
                                  ? 'bg-slate-300 text-slate-950'
                                  : index === 2
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              #{index + 1}
                            </span>
                          </td>
                          <td className="p-4 text-white font-semibold">
                            {row.name} {isMe && <span className="text-xs text-cyan-400 font-bold ml-2">(Вы)</span>}
                          </td>
                          <td className="p-4 text-slate-400">
                            {row.class_num}"{row.class_letter}"
                          </td>
                          <td className="p-4 text-cyan-400 font-black text-base">{row.avg_productivity}%</td>
                          <td className="p-4 pr-6 text-right">
                            <div className="inline-flex items-center gap-1 text-amber-400">
                              {[...Array(row.stars || 4)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DAILY ENTRY MODAL */}
      <Modal isOpen={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} title="Заполнение продуктивности за день">
        <form onSubmit={handleSaveEntry} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Средний балл (1-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={entryForm.avg_grade}
                onChange={(e) => setEntryForm({ ...entryForm, avg_grade: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Время на ЕНТ (мин)</label>
              <input
                type="number"
                value={entryForm.ent_prep_min}
                onChange={(e) => setEntryForm({ ...entryForm, ent_prep_min: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Самостоятельная учеба (мин)</label>
              <input
                type="number"
                value={entryForm.prep_time_min}
                onChange={(e) => setEntryForm({ ...entryForm, prep_time_min: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Чтение книг (мин)</label>
              <input
                type="number"
                value={entryForm.reading_min}
                onChange={(e) => setEntryForm({ ...entryForm, reading_min: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Сон (часы)</label>
              <input
                type="number"
                step="0.5"
                value={entryForm.sleep_hours}
                onChange={(e) => setEntryForm({ ...entryForm, sleep_hours: parseFloat(e.target.value) || 7 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Настроение (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={entryForm.mood}
                onChange={(e) => setEntryForm({ ...entryForm, mood: parseInt(e.target.value) || 3 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
              <input
                type="checkbox"
                checked={entryForm.homework_done}
                onChange={(e) => setEntryForm({ ...entryForm, homework_done: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
              <span>Все домашние задания на сегодня сделаны</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsEntryModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={savingEntry}>
              {savingEntry ? 'Сохранение...' : 'Сохранить запись'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
