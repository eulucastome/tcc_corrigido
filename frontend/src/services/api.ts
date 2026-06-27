import axios from 'axios'

// Instância Axios para chamadas ao backend.
const api = axios.create({
  baseURL: 'http://localhost:3000',
})

// 🔐 interceptador para enviar token automaticamente em todas as requisições.
//Função que injeta o cabeçalho Authorization com o token JWT antes de cada request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api