import { useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

export default function Agendamento() {
  const [services, setServices] = useState<Service[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/services').then(res => {
      setServices(res.data.services)
    })
  }, [])

  function durationServices(minutes: number): string {
  const hours: number = Math.floor(minutes / 60)
  const mins: number = minutes % 60

  if (hours === 0) {
    return `${mins} min`
  }

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}min`
}

  return (
    <div className="container">
      <h1>Escolha o serviço</h1>

      <div className="grid">
        {services.map(s => (
          <div key={s.id} className="card">
            <div className="card-header">{s.name}</div>
            <div className="card-body mb-2">
              <p>
              <strong>R$ {s.price.toFixed(2)}</strong>
              </p>

              <p>
                Duração: {durationServices(s.duration_minutes)}
              </p>
            </div>
            <div className="card-footer">
              <button
                className="btn"
                onClick={() =>
                  navigate(`/horarios/${s.id}`, {
                    state: { service: s }
                  })
                }
              >
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}