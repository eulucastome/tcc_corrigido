import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Service {
  id: string
  name: string
  price: number
}

interface Appointment {
  id: string
  date: string
  start_time: string
  status: string
  total_price?: number
  services?: Service[]
  user_name?: string
  client_name?: string
  client_id?: string
}

export default function MeusAgendamentos() {
  // Componente que lista os agendamentos do cliente autenticado.
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  // Estados do modal
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  // Função que busca os agendamentos do cliente no backend.
  async function fetchAppointments() {
    try {
      setLoading(true)
      const res = await api.get('/api/appointments')
      setAppointments(res.data.appointments)
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  // Função que cancela um agendamento existente.
  async function handleCancel() {
    if (!appointmentToCancel) return

    if (!cancelReason.trim()) {
      alert('Informe o motivo do cancelamento.')
      return
    }

    try {
      setCancelingId(appointmentToCancel.id)

      await api.patch(
        `/api/appointments/${appointmentToCancel.id}/cancel`,
        {
          cancellation_reason: cancelReason,
        }
      )

      alert('Agendamento cancelado com sucesso!')

      setShowCancelModal(false)
      setAppointmentToCancel(null)
      setCancelReason('')

      fetchAppointments()
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || 'Erro ao cancelar agendamento')
    } finally {
      setCancelingId(null)
    }
  }

  // Função que faz logout do cliente
  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Meus agendamentos</h2>

      {loading ? (
        <p>Carregando agendamentos...</p>
      ) : appointments.length === 0 ? (
        <p>Nenhum agendamento encontrado.</p>
      ) : null}

      <div className="grid">
        {appointments.map((a) => (
          <div
            key={a.id}
            className="card"
          >
            <p><strong>Data:</strong> {a.date}</p>

            <p><strong>Hora:</strong> {a.start_time}</p>

            <p>
              <strong>Cliente:</strong>{' '}
              {a.user_name ?? a.client_name ?? a.client_id}
            </p>

            <p><strong>Serviços:</strong></p>

            {a.services && a.services.length > 0 ? (
              <ul>
                {a.services.map((s) => (
                  <li key={s.id}>
                    {s.name} - R$ {s.price}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum serviço</p>
            )}

            <p>
              <strong>Status:</strong>{' '}
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  backgroundColor:
                    a.status === 'scheduled'
                      ? '#d4edda'
                      : a.status === 'completed'
                      ? '#cce5ff'
                      : a.status === 'cancelled'
                      ? '#f8d7da'
                      : '#e2e3e5',
                  color:
                    a.status === 'scheduled'
                      ? '#155724'
                      : a.status === 'completed'
                      ? '#004085'
                      : a.status === 'cancelled'
                      ? '#721c24'
                      : '#383d41',
                }}
              >
                {a.status === 'scheduled' && 'Agendado'}
                {a.status === 'completed' && 'Concluído'}
                {a.status === 'cancelled' && 'Cancelado'}
                {a.status === 'blocked' && 'Bloqueado'}
              </span>
            </p>

            <p>
              <strong>Total:</strong>{' '}
              {a.total_price !== undefined
                ? `R$ ${a.total_price.toFixed(2)}`
                : '-'}
            </p>

            {a.status === 'scheduled' && (
              <button
                className="btn btn-danger"
                style={{ marginTop: '1rem' }}
                disabled={cancelingId === a.id}
                onClick={() => {
                  setAppointmentToCancel(a)
                  setCancelReason('')
                  setShowCancelModal(true)
                }}
              >
                {cancelingId === a.id
                  ? 'Cancelando...'
                  : 'Cancelar agendamento'}
              </button>
            )}
          </div>
        ))}
      </div>

      {showCancelModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Cancelar agendamento</h3>

            <p>Informe o motivo do cancelamento:</p>

            <textarea
              rows={4}
              style={{ width: '100%', marginBottom: '1rem' }}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                className="btn"
                onClick={handleCancel}
              >
                Confirmar
              </button>

              <button
                className="btn secondary"
                onClick={() => {
                  setShowCancelModal(false)
                  setAppointmentToCancel(null)
                  setCancelReason('')
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}