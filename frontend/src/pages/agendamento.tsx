import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
}

export default function Agendamento() {
  const [services, setServices] = useState<Service[]>([])
  const navigate = useNavigate()

  // Estado auxiliar para gerenciar qual botão está com hover ativo
  const [hoveredBtnId, setHoveredBtnId] = useState<string | null>(null)

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

  const cardStyle = {
    padding: 20,
    backgroundColor: 'var(--bg)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    color: 'var(--text-h)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    position: 'relative' as const
  }

  return (
    /* ✅ Div de escape para isolar e anular o layout 'flex-direction: column' do #root */
    <div style={{ width: '100%', display: 'block' }}>
      
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', color: 'var(--text-h)', marginBottom: 60 }}>
        <h1 style={{ fontWeight: 500, marginBottom: '2rem', textAlign: 'center' }}>Escolha o serviço</h1>

        {/* Container da Grade Responsiva */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {services.map(s => (
            <div key={s.id} style={cardStyle}>
              
              {/* Header / Título do Serviço */}
              <div style={{ fontWeight: 600, fontSize: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                {s.name}
              </div>

              {/* Conteúdo / Corpo do Card */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-h)', fontWeight: 600 }}>
                  R$ {s.price.toFixed(2)}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
                  🕒 Duração: {durationServices(s.duration_minutes)}
                </p>
              </div>

              {/* Ações / Botão Agendar */}
              <div style={{ marginTop: 10 }}>
                <button
                  onMouseEnter={() => setHoveredBtnId(s.id)}
                  onMouseLeave={() => setHoveredBtnId(null)}
                  onClick={() =>
                    navigate(`/horarios/${s.id}`, {
                      state: { service: s }
                    })
                  }
                  style={{
                    padding: '0.6rem 1rem',
                    backgroundColor: hoveredBtnId === s.id ? 'transparent' : 'var(--accent)',
                    color: hoveredBtnId === s.id ? 'var(--accent)' : '#fff',
                    border: hoveredBtnId === s.id ? '1px solid var(--accent)' : '1px solid transparent',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    width: '100%',
                    display: 'block',
                    textAlign: 'center'
                  }}
                >
                  Agendar
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}