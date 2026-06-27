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

  // Função que formata a data de YYYY-MM-DD para DD/MM/YYYY
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
      navigate('/meus-agendamentos')
    } catch (err: any) {
      console.error('❌ Erro ao criar agendamento:', err.response?.data || err.message)
      alert(err.response?.data?.message || 'Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>Confirmar agendamento</h2>

      <p><strong>Serviço:</strong> {service?.name}</p>
      <p><strong>Preço:</strong> R$ {service?.price?.toFixed(2)}</p>

      <p><strong>Data:</strong> {formatDate(date)}</p>
      <p><strong>Horário:</strong> {horario}</p>

      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Forma de pagamento</h3>
        <select 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ 
            width: '100%',
            padding: '0.75rem',
            marginBottom: '2rem',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            fontSize: '1rem'
          }}
        >
          <option value="pix">PIX</option>
          <option value="credit_card">Cartão de crédito</option>
          <option value="debit_card">Cartão de débito</option>
          <option value="cash">Dinheiro</option>
        </select>

        <button 
          onClick={handleConfirm} 
          disabled={loading}
          className="btn"
          style={{ width: '100%' }}
        >
          {loading ? 'Processando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  )
}