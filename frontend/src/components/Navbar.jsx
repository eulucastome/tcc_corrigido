import { Link, useNavigate, useLocation } from 'react-router-dom' // 👈 Adicionado useLocation
import { useState, useEffect } from 'react'
import './Navbar.css' 

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation() // 👈 Instanciando o hook de localização
  
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null) // 👈 Transformado em estado para atualizar a tela

  // 🔄 Toda vez que a rota (URL) mudar, revalida o usuário e o token
  useEffect(() => {
    const userData = localStorage.getItem('user')
    const tokenData = localStorage.getItem('token')

    setToken(tokenData)

    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [location]) // 👈 Atualiza automaticamente sempre que mudar de página!

  // 🚪 Logout
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    navigate('/')
  }

  const isAdmin = user?.role === 'admin'
  const isLogged = !!token

  // Se não estiver logado (como na página de login), a barra some completamente
  if (!isLogged) return null

  return (
    <footer className="navbar">
      <div className="navbar-content">

        {/* 👤 CLIENT */}
        {!isAdmin && (
          <>
            <Link to="/agendamento">Agendar</Link>
            <Link to="/meus-agendamentos">Meus agendamentos</Link>
          </>
        )}

        {/* 🔥 ADMIN */}
        {isAdmin && (
          <>
            <Link to="/dashboard">📊 Dashboard</Link>
            <Link to="/admin-usuarios">👥 Usuários</Link>
            <Link to="/admin-horarios">⏰ Horários</Link>
            <Link to="/admin-servicos">💼 Serviços</Link>
          </>
        )}

        {/* 🚪 Logout */}
        <button onClick={logout}>Sair</button>

      </div>
    </footer>
  )
}