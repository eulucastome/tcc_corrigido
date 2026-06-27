import { useEffect, useState } from 'react'
import api from '../services/api'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

export default function AdminServicos() {
  const [services, setServices] = useState<Service[]>([])
  const [editingService, setEditingService] = useState<Service | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: ''
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function loadServices() {
    try {
      const response = await api.get('/api/services')
      setServices(response.data.services)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar serviços')
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  async function handleCreate() {
    try {
      setError('')
      setMessage('')

      await api.post('/api/services', {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes)
      })

      setMessage('Serviço criado com sucesso')

      setForm({
        name: '',
        description: '',
        price: '',
        duration_minutes: ''
      })

      loadServices()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao criar serviço')
    }
  }

  async function handleUpdate() {
    if (!editingService) return

    try {
      await api.put(`/api/services/${editingService.id}`, editingService)

      setMessage('Serviço atualizado com sucesso')
      setEditingService(null)

      loadServices()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao atualizar serviço')
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      'Deseja realmente excluir este serviço?'
    )

    if (!confirmDelete) return

    try {
      await api.delete(`/api/services/${id}`)

      setMessage('Serviço excluído com sucesso')

      loadServices()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao excluir serviço')
    }
  }
  
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  )

  // Estilos reutilizáveis
  const inputStyle = {
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box' as const
  }

  const primaryButtonStyle = {
    padding: '10px 15px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Serviços</h1>

      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {/* Bloco Superior: Formulários */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        {!editingService && (
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Novo Serviço</h2>

            <input
              placeholder="Nome"
              value={form.name}
              style={inputStyle}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Descrição"
              value={form.description}
              style={inputStyle}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <input
              type="number"
              placeholder="Preço"
              value={form.price}
              style={inputStyle}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              type="number"
              placeholder="Duração em minutos"
              value={form.duration_minutes}
              style={inputStyle}
              onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
            />

            <button onClick={handleCreate} style={primaryButtonStyle}>
              Criar Serviço
            </button>
          </div>
        )}

        {editingService && (
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Editar Serviço</h2>

            <input
              value={editingService.name}
              style={inputStyle}
              onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
            />

            <input
              value={editingService.description}
              style={inputStyle}
              onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
            />

            <input
              type="number"
              value={editingService.price}
              style={inputStyle}
              onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
            />

            <input
              type="number"
              value={editingService.duration_minutes}
              style={inputStyle}
              onChange={(e) => setEditingService({ ...editingService, duration_minutes: Number(e.target.value) })}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleUpdate} style={{ ...primaryButtonStyle, flex: 1 }}>
                Salvar
              </button>
              <button
                onClick={() => setEditingService(null)}
                style={{ padding: '10px 15px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <hr />

      {/* Bloco Inferior: Listagem e Pesquisa Centralizadas */}
      {/* 1. Título Centralizado */}
      <h2 style={{ textAlign: 'center', marginTop: 30, marginBottom: 15 }}>Serviços cadastrados</h2>

      {/* 2. Barra de pesquisa Centralizada */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 25 }}>
        <input
          type="text"
          placeholder="🔍 Pesquisar serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '400px' }} // Mantive o padrão elegante de 400px igual ao form
        />
      </div>

      <table width="100%" style={{ borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Preço</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Duração</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.map((service) => (
            <tr key={service.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}>{service.name}</td>
              <td style={{ padding: '12px' }}>R$ {service.price.toFixed(2)}</td>
              <td style={{ padding: '12px' }}>{service.duration_minutes} min</td>

              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button
                  onClick={() => setEditingService(service)}
                  style={{ padding: '6px 12px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(service.id)}
                  style={{ 
                    marginLeft: 10, 
                    padding: '6px 12px', 
                    backgroundColor: '#d32f2f', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}