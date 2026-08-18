import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { getStudents, getStudentEntries, teacherUpdateStudent, createHomework } from '../api/teacher';
import { getHomeworks } from '../api/student';
import {
  Users,
  BookOpen,
  PlusCircle,
  CheckCircle2,
  Edit,
  LogOut,
  Search,
  History
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('students');

  const [students, setStudents] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentEntries, setStudentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    date: new Date().toISOString().split('T')[0],
    avg_grade: 90,
    attendance_mark: 'present',
    homework_checked: true,
    remark: '',
  });

  // Create Homework Modal State
  const [isHwModalOpen, setIsHwModalOpen] = useState(false);
  const [hwForm, setHwForm] = useState({
    class_num: '10',
    class_letter: 'A',
    subject: user?.subject || 'Математика',
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
  });

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const [studentsData, hwData] = await Promise.all([
        getStudents().catch(() => []),
        getHomeworks().catch(() => []),
      ]);
      setStudents(studentsData);
      setHomeworks(hwData);
    } catch (err) {
      console.error('Failed to load teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenEditStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const entries = await getStudentEntries(student.id, 7);
      setStudentEntries(entries);
      setIsEditModalOpen(true);
    } catch {
      alert('Ошибка загрузки записей ученика');
    }
  };

  const handleSaveTeacherUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      await teacherUpdateStudent(selectedStudent.id, updateForm);
      showToast('Отметка учителя успешно сохранена!');
      setIsEditModalOpen(false);
      fetchTeacherData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка сохранения');
    }
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    try {
      await createHomework(hwForm);
      showToast('Домашнее задание написано и отправлено классу!');
      setIsHwModalOpen(false);
      setHwForm({
        class_num: '10',
        class_letter: 'A',
        subject: user?.subject || 'Математика',
        title: '',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
      });
      fetchTeacherData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка создания домашнего задания');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-violet-500 text-white font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900/80 border-r border-slate-800/80 p-6 flex flex-col justify-between shrink-0 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              {user?.name?.[0] || 'T'}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-white text-base truncate">{user?.name || 'Учитель'}</h3>
              <p className="text-xs text-violet-400 font-medium truncate">
                {user?.subject || 'Преподаватель'}
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'students', label: 'Ученики класса', icon: Users },
              { id: 'homework', label: 'Выдача ДЗ', icon: BookOpen },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-violet-400 border border-violet-500/30 shadow-lg shadow-violet-500/5'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-violet-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-3">
          <Button
            onClick={() => setIsHwModalOpen(true)}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-lg shadow-violet-600/20"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Выдать ДЗ</span>
          </Button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white">Панель учителя</h1>
                <p className="text-slate-400 text-sm mt-1">Проверка заданий, отметки и отзывы ученикам</p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по имени..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/40">
                      <th className="p-4 pl-6">Ученик</th>
                      <th className="p-4">Класс</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-right pr-6">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4 pl-6 font-bold text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                              {st.name[0]}
                            </div>
                            {st.name}
                          </td>
                          <td className="p-4 text-slate-400">
                            {st.class_num || '10'}"{st.class_letter || 'A'}"
                          </td>
                          <td className="p-4 text-slate-400">{st.email}</td>
                          <td className="p-4 pr-6 text-right">
                            <Button
                              onClick={() => handleOpenEditStudent(st)}
                              size="sm"
                              className="bg-slate-800 hover:bg-slate-700 text-violet-400 border border-slate-700"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Поставить отметку</span>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">
                          {loading ? 'Загрузка списка учеников...' : 'Ученики не найдены'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white">Выдача домашних заданий</h1>
                <p className="text-slate-400 text-sm mt-1">Публикуйте ДЗ для закрепленных классов</p>
              </div>
              <Button onClick={() => setIsHwModalOpen(true)}>
                <PlusCircle className="w-5 h-5" />
                <span>Создать ДЗ</span>
              </Button>
            </div>

            <div className="grid gap-4">
              {homeworks.length > 0 ? (
                homeworks.map((hw) => (
                  <Card key={hw.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold rounded-lg">
                          {hw.class_num}"{hw.class_letter}" — {hw.subject}
                        </span>
                        <span className="text-xs text-slate-400">Срок: {hw.due_date}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-2">{hw.title}</h3>
                      {hw.description && <p className="text-sm text-slate-400 mt-1">{hw.description}</p>}
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium">
                        Выдано {hw.created_at || 'сегодня'}
                      </span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Домашних заданий пока нет</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* TEACHER UPDATE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Оценка и отзыв: ${selectedStudent?.name || ''}`}
      >
        <form onSubmit={handleSaveTeacherUpdate} className="space-y-4">
          {/* Student recent history snippet */}
          {studentEntries.length > 0 && (
            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-400 mb-2">
                <History className="w-4 h-4" />
                <span>Последняя активность ученика</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                {studentEntries.slice(0, 3).map((e) => (
                  <div key={e.id} className="flex justify-between items-center bg-slate-900/60 px-3 py-1.5 rounded-xl">
                    <span>{e.date}</span>
                    <span className="font-semibold text-cyan-400">Индекс: {e.productivity}%</span>
                    <span>Балл: {e.avg_grade}</span>
                    <span className={e.absent ? 'text-red-400' : e.late ? 'text-amber-400' : 'text-emerald-400'}>
                      {e.absent ? 'Пропуск' : e.late ? 'Опоздал' : 'Был'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Дата</label>
            <input
              type="date"
              value={updateForm.date}
              onChange={(e) => setUpdateForm({ ...updateForm, date: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Оценка за день (1-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={updateForm.avg_grade}
                onChange={(e) => setUpdateForm({ ...updateForm, avg_grade: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Посещаемость</label>
              <select
                value={updateForm.attendance_mark}
                onChange={(e) => setUpdateForm({ ...updateForm, attendance_mark: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="present">Был на уроке</option>
                <option value="late">Опоздал</option>
                <option value="absent">Отсутствовал</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
              <input
                type="checkbox"
                checked={updateForm.homework_checked}
                onChange={(e) => setUpdateForm({ ...updateForm, homework_checked: e.target.checked })}
                className="w-4 h-4 accent-violet-500 rounded"
              />
              <span>Домашнее задание проверено и зачтено</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Замечание / Рекомендация учителя</label>
            <textarea
              rows={3}
              value={updateForm.remark}
              onChange={(e) => setUpdateForm({ ...updateForm, remark: e.target.value })}
              placeholder="Например: Отличная работа у доски! Подтянуть задачи №4."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" className="bg-violet-600 text-white">
              Сохранить отметку
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREATE HW MODAL */}
      <Modal isOpen={isHwModalOpen} onClose={() => setIsHwModalOpen(false)} title="Новое домашнее задание">
        <form onSubmit={handleCreateHomework} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Класс</label>
              <select
                value={hwForm.class_num}
                onChange={(e) => setHwForm({ ...hwForm, class_num: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                {['7', '8', '9', '10', '11'].map((c) => (
                  <option key={c} value={c}>{c} класс</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Буква</label>
              <input
                type="text"
                value={hwForm.class_letter}
                onChange={(e) => setHwForm({ ...hwForm, class_letter: e.target.value.toUpperCase() })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Предмет</label>
            <input
              type="text"
              value={hwForm.subject}
              onChange={(e) => setHwForm({ ...hwForm, subject: e.target.value })}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Тема / Название задания</label>
            <input
              type="text"
              value={hwForm.title}
              onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
              placeholder="Решить уравнения на стр. 112"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Описание / Детали</label>
            <textarea
              rows={3}
              value={hwForm.description}
              onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
              placeholder="Оформить в рабочей тетради, проверить формулы..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Срок сдачи (Дедлайн)</label>
            <input
              type="date"
              value={hwForm.due_date}
              onChange={(e) => setHwForm({ ...hwForm, due_date: e.target.value })}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsHwModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" className="bg-violet-600 text-white">
              Опубликовать ДЗ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
