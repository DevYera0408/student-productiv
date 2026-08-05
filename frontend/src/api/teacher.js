import api from './api';

export const getStudents = async () => {
  const response = await api.get('/students');
  return response.data;
};

export const getStudentEntries = async (studentId, days = 30) => {
  const response = await api.get(`/students/${studentId}/entries?days=${days}`);
  return response.data;
};

export const teacherUpdateStudent = async (studentId, updateData) => {
  const response = await api.put(`/students/${studentId}/teacher-update`, updateData);
  return response.data;
};

export const createHomework = async (hwData) => {
  const response = await api.post('/homeworks', hwData);
  return response.data;
};

export const addScheduleItem = async (itemData) => {
  const response = await api.post('/schedule', itemData);
  return response.data;
};

export const deleteScheduleItem = async (itemId) => {
  const response = await api.delete(`/schedule/${itemId}`);
  return response.data;
};
