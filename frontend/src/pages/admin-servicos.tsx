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

  return (
    <div style={{ padding: 20 }}>
      <h1>Serviços</h1>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!editingService && (
        <>
          <h2>Novo Serviço</h2>

          <input
            placeholder="Nome"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <br /><br />

          <input
            placeholder="Descrição"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <br /><br />

          <input
            type="number"
            placeholder="Preço"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          <br /><br />

          <input
            type="number"
            placeholder="Duração em minutos"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({
                ...form,
                duration_minutes: e.target.value
              })
            }
          />

          <br /><br />

          <button onClick={handleCreate}>
            Criar Serviço
          </button>
        </>
      )}

      {editingService && (
        <>
          <h2>Editar Serviço</h2>

          <input
            value={editingService.name}
            onChange={(e) =>
              setEditingService({
                ...editingService,
                name: e.target.value
              })
            }
          />

          <br /><br />

          <input
            value={editingService.description}
            onChange={(e) =>
              setEditingService({
                ...editingService,
                description: e.target.value
              })
            }
          />

          <br /><br />

          <input
            type="number"
            value={editingService.price}
            onChange={(e) =>
              setEditingService({
                ...editingService,
                price: Number(e.target.value)
              })
            }
          />

          <br /><br />

          <input
            type="number"
            value={editingService.duration_minutes}
            onChange={(e) =>
              setEditingService({
                ...editingService,
                duration_minutes: Number(e.target.value)
              })
            }
          />

          <br /><br />

          <button onClick={handleUpdate}>
            Salvar
          </button>

          <button
            onClick={() => setEditingService(null)}
            style={{ marginLeft: 10 }}
          >
            Cancelar
          </button>
        </>
      )}

      <hr />

      <h2>Serviços cadastrados</h2>

      <table width="100%">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Duração</th>
            <th>Ações</th>
          </tr>
        </thead>

        <input
            type="text"
            placeholder="Pesquisar serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}/>
        <tbody>
          {filteredServices.map((service) => (
            <tr key={service.id}>
              <td>{service.name}</td>
              <td>R$ {service.price}</td>
              <td>{service.duration_minutes} min</td>

              <td>
                <button
                  onClick={() =>
                    setEditingService(service)
                  }
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    handleDelete(service.id)
                  }
                  style={{ marginLeft: 10 }}
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