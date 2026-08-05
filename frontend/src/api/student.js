import api from './api';

export const upsertEntry = async (entryData) => {
  const response = await api.post('/entries', entryData);
  return response.data;
};

export const getMyEntries = async (days = 7) => {
  const response = await api.get(`/entries/mine?days=${days}`);
  return response.data;
};

export const getSchedule = async (classNum, classLetter) => {
  let url = '/schedule';
  const params = new URLSearchParams();
  if (classNum) params.append('class_num', classNum);
  if (classLetter) params.append('class_letter', classLetter);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await api.get(url);
  return response.data;
};

export const getHomeworks = async () => {
  const response = await api.get('/homeworks');
  return response.data;
};

export const toggleHomework = async (homeworkId) => {
  const response = await api.post(`/homeworks/${homeworkId}/toggle`);
  return response.data;
};

export const getRanking = async (days = 7) => {
  const response = await api.get(`/ranking?days=${days}`);
  return response.data;
};
