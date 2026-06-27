import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'

interface DashboardData {
  period: string
  startDate: string
  endDate: string
  total_revenue: number
  total_appointments: number
  cancelled_count: number
  average_ticket: number
  by_day: any[]
  by_client: any[]
  top_services: any[]
  appointments?: Array<{
    id: string
    date: string
    start_time: string
    end_time: string
    status: string
    total_price: number
    services: Array<{ name: string; price: number }>
  }>
}

export default function Dashboard() {
  // Componente do dashboard que mostra métricas financeiras e filtros.
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPeriod = searchParams.get('period') || 'monthly'
  const initialStartDate = searchParams.get('startDate') || ''
  const initialEndDate = searchParams.get('endDate') || ''
  const initialClientId = searchParams.get('client_id') || ''

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState(initialPeriod) // weekly, monthly, yearly, custom
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [selectedClient, setSelectedClient] = useState(initialClientId)
  const [allClients, setAllClients] = useState<Array<{ id: string | null; name: string }>>([])

  const applyQueryParams = (params: { period: string; startDate?: string; endDate?: string; selectedClient?: string }) => {
    const next = new URLSearchParams()
    next.set('period', params.period)

    if (params.period === 'custom') {
      if (params.startDate) next.set('startDate', params.startDate)
      if (params.endDate) next.set('endDate', params.endDate)
      if (params.selectedClient) next.set('client_id', params.selectedClient)
    }

    setSearchParams(next, { replace: true })
  }

  // Função que busca os dados do dashboard do backend.
  async function fetchDashboard(overrides: { period?: string; startDate?: string; endDate?: string; selectedClient?: string } = {}) {
    try {
      setLoading(true)

      const currentPeriod = overrides.period ?? period
      const currentStart = overrides.startDate ?? startDate
      const currentEnd = overrides.endDate ?? endDate
      const currentClient = overrides.selectedClient ?? selectedClient

      let url = `/api/dashboard/${currentPeriod}`

      // Para período customizado com filtros
      if (currentPeriod === 'custom' && currentStart && currentEnd) {
        url = `/api/dashboard/filter?startDate=${currentStart}&endDate=${currentEnd}`
        if (currentClient) url += `&client_id=${currentClient}`
      }

      const res = await api.get(url)
      setData(res.data)

      // Extrai lista de clientes
      if (res.data.by_client) {
        const clients = res.data.by_client.map((c: any) => ({ id: c.client_id || null, name: c.client }))
        setAllClients(clients)
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (period !== 'custom') {
      fetchDashboard()
    } else if (startDate && endDate) {
      fetchDashboard()
    }
  }, [period])

  // Função que aplica filtros personalizados no dashboard.
  const handleFilter = () => {
    if (period === 'custom' && startDate && endDate) {
      applyQueryParams({ period, startDate, endDate, selectedClient })
      fetchDashboard()
    } else {
      alert('Selecione período e datas')
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <h1>📊 Dashboard - Relatório Financeiro</h1>

      {/* Filtros */}
      <div style={{
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        border: '1px solid #ddd'
      }}>
        <h3>Filtros</h3>

        <div style={{ marginBottom: 15 }}>
          <label style={{ marginRight: 10 }}>
            <input
              type="radio"
              value="weekly"
              checked={period === 'weekly'}
              onChange={() => {
                setPeriod('weekly')
                applyQueryParams({ period: 'weekly' })
              }}
            />
            Semanal
          </label>
          <label style={{ marginRight: 10 }}>
            <input
              type="radio"
              value="monthly"
              checked={period === 'monthly'}
              onChange={() => {
                setPeriod('monthly')
                applyQueryParams({ period: 'monthly' })
              }}
            />
            Mensal
          </label>
          <label style={{ marginRight: 10 }}>
            <input
              type="radio"
              value="yearly"
              checked={period === 'yearly'}
              onChange={() => {
                setPeriod('yearly')
                applyQueryParams({ period: 'yearly' })
              }}
            />
            Anual
          </label>
          <label>
            <input
              type="radio"
              value="custom"
              checked={period === 'custom'}
              onChange={() => {
                setPeriod('custom')
                applyQueryParams({ period: 'custom' })
              }}
            />
            Período customizado
          </label>
        </div>

        {period === 'custom' && (
          <div style={{ marginBottom: 15 }}>
            <div style={{ marginBottom: 10 }}>
              <label>
                De:{' '}
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const value = e.target.value
                    setStartDate(value)
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>
                Até:{' '}
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const value = e.target.value
                    setEndDate(value)
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>
                Cliente:{' '}
                <select
                  value={selectedClient}
                  onChange={(e) => {
                    const value = e.target.value
                    setSelectedClient(value)
                  }}
                >
                  <option value="">Todos</option>
                  {allClients.map((client) => (
                    <option key={client.id ?? client.name} value={client.id ?? ''}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button onClick={handleFilter} disabled={loading}>
              {loading ? 'Carregando...' : 'Filtrar'}
            </button>
          </div>
        )}
      </div>

      {/* Cards principais */}
      {data && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 15,
            marginBottom: 30
          }}>
            <div style={{
              padding: 20,
              backgroundColor: '#e8f5e9',
              borderRadius: 8,
              border: '1px solid #4caf50'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: 12 }}>Receita Total</p>
              <h2 style={{ margin: '10px 0 0 0', color: '#2e7d32' }}>
                R$ {data.total_revenue.toFixed(2)}
              </h2>
            </div>

            <div style={{
              padding: 20,
              backgroundColor: '#e3f2fd',
              borderRadius: 8,
              border: '1px solid #2196f3'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: 12 }}>Total de Atendimentos</p>
              <h2 style={{ margin: '10px 0 0 0', color: '#1565c0' }}>
                {data.total_appointments}
              </h2>
            </div>

            <div style={{
              padding: 20,
              backgroundColor: '#fff3e0',
              borderRadius: 8,
              border: '1px solid #ff9800'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: 12 }}>Ticket Médio</p>
              <h2 style={{ margin: '10px 0 0 0', color: '#e65100' }}>
                R$ {data.average_ticket.toFixed(2)}
              </h2>
            </div>

            <div style={{
              padding: 20,
              backgroundColor: '#fce4ec',
              borderRadius: 8,
              border: '1px solid #e91e63'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: 12 }}>Cancelamentos</p>
              <h2 style={{ margin: '10px 0 0 0', color: '#c2185b' }}>
                {data.cancelled_count}
              </h2>
            </div>
          </div>

          {/* Tabela de receita por cliente */}
          {data.by_client && data.by_client.length > 0 && (
            <div style={{
              marginBottom: 30,
              padding: 20,
              backgroundColor: '#fff',
              borderRadius: 8,
              border: '1px solid #ddd'
            }}>
              <h3>💰 Receita por Cliente</h3>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      Cliente
                    </th>
                    <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                      Receita
                    </th>
                    <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                      Atendimentos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_client.map((client: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 10 }}>{client.client}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>
                        R$ {client.revenue.toFixed(2)}
                      </td>
                      <td style={{ padding: 10, textAlign: 'right' }}>
                        {client.appointments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Serviços mais vendidos */}
          {data.top_services && data.top_services.length > 0 && (
            <div style={{
              marginBottom: 30,
              padding: 20,
              backgroundColor: '#fff',
              borderRadius: 8,
              border: '1px solid #ddd'
            }}>
              <h3>🏆 Serviços Mais Vendidos</h3>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      Serviço
                    </th>
                    <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                      Quantidade
                    </th>
                    <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                      Receita
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_services.map((service: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 10 }}>{service.name}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>
                        {service.quantity}
                      </td>
                      <td style={{ padding: 10, textAlign: 'right' }}>
                        R$ {parseFloat(service.revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Receita por dia */}
          {data.by_day && data.by_day.length > 0 && (
            <div style={{
              padding: 20,
              backgroundColor: '#fff',
              borderRadius: 8,
              border: '1px solid #ddd'
            }}>
              <h3>📈 Receita por Dia</h3>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      Data
                    </th>
                    <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                      Receita
                    </th>
                    <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                      Atendimentos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_day.map((day: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 10 }}>
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: 10, textAlign: 'right' }}>
                        R$ {day.revenue.toFixed(2)}
                      </td>
                      <td style={{ padding: 10, textAlign: 'right' }}>
                        {day.appointments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Lista de agendamentos e serviços quando filtra por cliente */}
          {period === 'custom' && selectedClient && data.appointments && data.appointments.length > 0 && (
            <div style={{
              marginTop: 30,
              padding: 20,
              backgroundColor: '#fff',
              borderRadius: 8,
              border: '1px solid #ddd'
            }}>
              <h3>📋 Agendamentos do cliente</h3>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Data</th>
                    <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Horário</th>
                    <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                    <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total</th>
                    <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Serviços</th>
                  </tr>
                </thead>
                <tbody>
                  {data.appointments.map((appt) => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 10 }}>{new Date(appt.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: 10 }}>{appt.start_time} - {appt.end_time}</td>
                      <td style={{ padding: 10 }}>{appt.status}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>R$ {parseFloat(String(appt.total_price)).toFixed(2)}</td>
                      <td style={{ padding: 10 }}>
                        {appt.services.map((service, idx) => (
                          <div key={idx} style={{ marginBottom: 4 }}>
                            {service.name} - R$ {parseFloat(String(service.price)).toFixed(2)}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
