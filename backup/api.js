import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ??
      (Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join(', ')
        : null) ??
      (status >= 500
        ? 'Algo deu errado no servidor. Tente novamente em instantes.'
        : error.message);

    if (status === 401 && !error.config?.url?.includes('/auth/me')) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject({ ...error, friendlyMessage: message });
  },
);

export default api;
