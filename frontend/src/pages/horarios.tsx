import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

interface Slot {
  time: string
  available: boolean
  blocked: boolean
}

export default function Horarios() {
  // Componente que mostra horários disponíveis para o serviço selecionado.
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const service = location.state?.service // ✅ recebe serviço

  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])

  // Busca horários livres para a data e serviço selecionados.
  //Função que executa a consulta ao backend sempre que a data ou o serviço mudam.
  useEffect(() => {
    if (!date || !serviceId) return

    api
      .get(`/api/appointments/available?date=${date}&service_id=${serviceId}`)
      .then((res) => setSlots(res.data.slots))
      .catch((err) => console.error(err))
  }, [date, serviceId])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h2>Escolha uma data</h2>

      {/* ✅ BLOQUEIA DATAS PASSADAS */}
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            marginBottom: '20px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <h2>Horários disponíveis</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gap: '10px',
        maxWidth: '400px'
      }}>
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available || slot.blocked}
            onClick={() =>
              navigate('/confirmacao', {
                state: {
                  service,
                  serviceId,
                  horario: slot.time,
                  date
                }
              })
            }
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: !slot.available || slot.blocked ? '#f5f5f5' : '#fff',
              color: !slot.available || slot.blocked ? '#999' : '#000',
              cursor: !slot.available || slot.blocked ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  )
}