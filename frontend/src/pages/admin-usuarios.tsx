import { useEffect, useState } from 'react'
import api from '../services/api'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role?: string
  active?: boolean
}

export default function AdminUsuarios() {
  // Componente administrativo que lista, edita e exclui usuários.
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [search, setSearch] = useState('')  

  // Função que busca a lista de usuários do backend.
  async function fetchUsers() {
    try {
      setLoading(true)
      const res = await api.get('/api/users')
      setUsers(res.data.users || [])
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Função que atualiza os dados de um usuário existente.
  async function handleUpdate() {
    if (!editingUser) return

    setError('')
    setMessage('')

    if (!editingUser.name || !editingUser.email) {
      setError('Nome e e-mail são obrigatórios.')
      return
    }

    try {
      setLoading(true)
      await api.patch(`/api/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        active: editingUser.active,
      })

      setMessage('Usuário atualizado com sucesso.')
      setEditingUser(null)
      fetchUsers()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao atualizar usuário')
    } finally {
      setLoading(false)
    }
  }

  // Função que exclui um usuário existente.
  async function handleDelete(id: string) {
    if (!window.confirm('Deseja realmente excluir este usuário?')) return

    try {
      setLoading(true)
      await api.delete(`/api/users/${id}`)
      setMessage('Usuário excluído com sucesso.')
      fetchUsers()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao excluir usuário')
    } finally {
      setLoading(false)
    }
  }

  //Funçao que filtra os usuarios, utilizando o estado de busca (search) para encontrar usuários por nome, email ou telefone.
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', marginBottom: 40 }}>
      <h1>👥 Administração de Usuários</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div style={{ marginBottom: 30 }}>
        {editingUser && (
          <div style={{ padding: 20, background: '#fff', borderRadius: 8, border: '1px solid #ddd' }}>
            <h2>Editar usuário</h2>
            <input
              placeholder="Nome"
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              style={{ width: '100%', marginBottom: 10, padding: 10 }}
            />
            <input
              placeholder="E-mail"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              style={{ width: '100%', marginBottom: 10, padding: 10 }}
            />
            <input
              placeholder="Telefone"
              value={editingUser.phone || ''}
              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
              style={{ width: '100%', marginBottom: 10, padding: 10 }}
            />
            <label style={{ display: 'block', marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={!!editingUser.active}
                onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })}
              />{' '}
              Conta ativa
            </label>
            <button
              onClick={handleUpdate}
              disabled={loading}
              style={{ width: '100%', padding: 12, background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button
              onClick={() => setEditingUser(null)}
              disabled={loading}
              style={{ width: '100%', padding: 12, marginTop: 10, background: '#e0e0e0', border: 'none', borderRadius: 4 }}
            >
              Cancelar edição
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: 20, background: '#fff', borderRadius: 8, border: '1px solid #ddd' }}>
        <h2>Usuários cadastrados</h2>
        <input
          type="text"
          placeholder="Pesquisar por nome, email ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
          width: '100%',
          padding: 10,
          marginBottom: 20,
          border: '1px solid #ccc',
          borderRadius: 4}}
          />
        {loading && <p>Carregando...</p>}
        {!loading && filteredUsers.length === 0 && <p>Nenhum usuário encontrado.</p>}
        {!loading && filteredUsers.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 10, textAlign: 'left' }}>Nome</th>
                <th style={{ padding: 10, textAlign: 'left' }}>E-mail</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Telefone</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Role</th>
                <th style={{ padding: 10, textAlign: 'center' }}>Ativo</th>
                <th style={{ padding: 10, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 10 }}>{user.name}</td>
                  <td style={{ padding: 10 }}>{user.email}</td>
                  <td style={{ padding: 10 }}>{user.phone || '—'}</td>
                  <td style={{ padding: 10 }}>{user.role || 'client'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{user.active ? 'Sim' : 'Não'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <button onClick={() => setEditingUser(user)} style={{ marginRight: 10 }}>Editar</button>
                    <button onClick={() => handleDelete(user.id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4 }}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
