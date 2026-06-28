import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useState } from 'react'

export default function Confirmacao() {
  // Componente que confirma o agendamento antes de enviar ao backend.
  const { state } = useLocation()
  const navigate = useNavigate()

  const service = state?.service
  const horario = state?.horario
  const date = state?.date

  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [loading, setLoading] = useState(false)

  // Estado auxiliar para gerenciar o efeito visual de hover no botão
  const [isHovered, setIsHovered] = useState(false)

  // Função que formata a data para DD/MM/YYYY
  function formatDate(dateStr: string) {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  // Função que envia o pedido de agendamento para o backend.
  async function handleConfirm() {
    try {
      setLoading(true)

      if (!service || !date || !horario) {
        alert('Dados do agendamento inválidos')
        navigate('/agendamento')
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        alert('Você precisa estar logado para criar um agendamento')
        navigate('/login')
        return
      }

      const response = await api.post(
        '/api/appointments',
        {
          date,
          start_time: horario,
          service_ids: [service.id],
          payment_method: paymentMethod,
          notes: ''
        }
      )

      console.log('✅ Agendamento criado:', response.data)
      alert('Serviço agendado com sucesso!')
      
      navigate('/meus-agendamentos')
    } catch (err: any) {
      console.error('❌ Erro ao criar agendamento:', err.response?.data || err.message)
      alert(err.response?.data?.message || 'Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = {
    padding: 30,
    backgroundColor: 'var(--bg)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    color: 'var(--text-h)',
    maxWidth: 500,
    margin: '40px auto 0 auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  }

  const selectStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    backgroundColor: 'var(--bg)',
    color: 'var(--text-h)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    marginBottom: '2rem'
  }

  const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.95rem'
  }

  return (
    <div style={{ padding: 20, color: 'var(--text-h)' }}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '2rem', fontWeight: 500, textAlign: 'center' }}>Confirmar agendamento</h2>
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={infoRowStyle}>
            <span style={{ opacity: 0.7 }}>Serviço:</span>
            <span style={{ fontWeight: 500 }}>{service?.name}</span>
          </div>
          
          <div style={infoRowStyle}>
            <span style={{ opacity: 0.7 }}>Preço:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>R$ {service?.price?.toFixed(2)}</span>
          </div>

          <div style={infoRowStyle}>
            <span style={{ opacity: 0.7 }}>Data:</span>
            <span style={{ fontWeight: 500 }}>{formatDate(date)}</span>
          </div>

          <div style={infoRowStyle}>
            <span style={{ opacity: 0.7 }}>Horário:</span>
            <span style={{ fontWeight: 500 }}>{horario}</span>
          </div>
        </div>

        {/* Escolha da Forma de Pagamento */}
        <div>
          <h3 style={{ marginBottom: '0.8rem', fontWeight: 500, fontSize: '1.1rem' }}>Forma de pagamento</h3>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={selectStyle}
          >
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de crédito</option>
            <option value="debit_card">Cartão de débito</option>
            <option value="cash">Dinheiro</option>
          </select>

          {/* Botão Principal com Hover e Efeito de Disabled */}
          <button 
            onClick={handleConfirm} 
            disabled={loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: isHovered ? 'transparent' : 'var(--accent)',
              color: isHovered ? 'var(--accent)' : '#fff',
              border: isHovered ? '1px solid var(--accent)' : '1px solid transparent',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}