import axios from 'axios';

const base = process.env.REACT_APP_API_BASE_URL;
if (!base) {
  // hata ayıklamaya yardımcı olur
  // console.warn('REACT_APP_API_BASE_URL not set');
}
const api = axios.create({
  baseURL: `${base}/api`,
});

export default api;
