import React, { useEffect, useState } from 'react';
import EmailSettings from './EmailSettings';
import api from '../utils/axios';
import { useStore } from '../store/useStore';

function EditUserModal({ user, onClose, onSave }) {
  const [nombre, setNombre] = useState(user.nombre || user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [isAdmin, setIsAdmin] = useState(!!user.isAdmin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/users/${user.id}`, {
        nombre,
        email,
        isAdmin,
      });
      onSave(res.data);
      onClose();
    } catch (err) {
      setError('No se pudo actualizar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-lime-300">Editar Usuario</h2>
        <label className="block mb-2 text-sm">Nombre</label>
        <input className="w-full mb-4 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700" value={nombre} onChange={e => setNombre(e.target.value)} />
        <label className="block mb-2 text-sm">Email</label>
        <input className="w-full mb-4 px-3 py-2 rounded bg-gray-900 text-white border border-gray-700" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} />
          <span>Administrador</span>
        </label>
        {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
        <div className="flex gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-600 text-white font-bold">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded bg-lime-600 text-white font-bold hover:bg-lime-500 disabled:opacity-60">{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('No se pudo eliminar el usuario');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditSave = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  return (
    <div className="overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-lime-300 flex items-center gap-2">
        <span>👥</span> Usuarios de la Plataforma
      </h3>
      {loading ? (
        <div className="text-gray-400">Cargando usuarios...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-800 text-lime-300">
              <th className="py-2 px-3 text-left">Nombre</th>
              <th className="py-2 px-3 text-left">Email</th>
              <th className="py-2 px-3 text-left">Admin</th>
              <th className="py-2 px-3 text-left">Fecha Registro</th>
              <th className="py-2 px-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/60">
                <td className="py-2 px-3">{u.nombre || u.name}</td>
                <td className="py-2 px-3">{u.email}</td>
                <td className="py-2 px-3">{u.isAdmin ? '✅' : ''}</td>
                <td className="py-2 px-3 text-xs">{u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString() : '-'}</td>
                <td className="py-2 px-3 flex gap-2">
                  <button className="px-3 py-1 rounded bg-lime-600 text-white text-xs font-bold hover:bg-lime-500" onClick={() => setEditUser(u)}>Editar</button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-500 disabled:opacity-60" disabled={deleteLoading === u.id} onClick={() => handleDelete(u.id)}>{deleteLoading === u.id ? 'Eliminando...' : 'Eliminar'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleEditSave} />}
    </div>
  );
}

function MatchesTable() {
  // Placeholder para partidos (puedes implementar igual que UsersTable)
  return (
    <div className="text-gray-400">Próximamente: gestión de partidos.</div>
  );
}

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'users', label: 'Usuarios', icon: '👥' },
  { key: 'matches', label: 'Partidos', icon: '🏟️' },
  { key: 'emails', label: 'Correos', icon: '📧' },
  { key: 'endpoints', label: 'Endpoints', icon: '🔗' },
];

export default function AdminPanel() {
  const { user } = useStore();
  const [section, setSection] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-gray-950 border-r border-gray-800 flex flex-col py-8 px-4 sticky top-0 z-20">
        <div className="mb-10 flex flex-col items-center">
          <img src={user?.avatar} alt="avatar" className="w-16 h-16 rounded-full border-4 border-lime-400 mb-2 object-cover" />
          <div className="font-bold text-lg text-lime-300">{user?.nombre || user?.name}</div>
          <div className="text-xs text-gray-400">Administrador</div>
        </div>
        <nav className="flex flex-col gap-2">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-left ${section === s.key ? 'bg-lime-500/20 text-lime-300' : 'hover:bg-gray-800 text-gray-200'}`}
            >
              <span className="text-xl">{s.icon}</span> {s.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 min-h-screen py-10 px-6 md:px-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-lime-400 drop-shadow-lg">Panel de Administración</h1>
          <div className="flex items-center gap-3">
            <img src={user?.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-lime-400 object-cover" />
            <span className="font-bold text-lime-300">{user?.nombre || user?.name}</span>
            <span className="bg-lime-700 text-white text-xs px-3 py-1 rounded-full ml-2">Admin</span>
          </div>
        </div>
        {/* Secciones */}
        {section === 'dashboard' && (
          <section className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold mb-2 text-lime-300 flex items-center gap-2"><span>🏠</span> Dashboard</h2>
            <p className="text-gray-300 mb-2 text-lg">Bienvenido, administrador. Gestiona usuarios, partidos, correos y más desde un solo lugar.</p>
            <div className="mt-6 text-gray-400 text-sm">Selecciona una sección en el menú lateral para comenzar.</div>
          </section>
        )}
        {section === 'users' && (
          <section className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700 mb-8">
            <UsersTable />
          </section>
        )}
        {section === 'matches' && (
          <section className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700 mb-8">
            <h3 className="text-xl font-bold mb-4 text-lime-300 flex items-center gap-2">
              <span>🏟️</span> Partidos de la Plataforma
            </h3>
            <MatchesTable />
          </section>
        )}
        {section === 'emails' && (
          <section className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700 mb-8">
            <h3 className="text-xl font-bold mb-4 text-lime-300 flex items-center gap-2">
              <span>📧</span> Gestión de Correos
            </h3>
            <EmailSettings />
          </section>
        )}
        {section === 'endpoints' && (
          <section className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700 mb-8">
            <h3 className="text-xl font-bold mb-4 text-lime-300 flex items-center gap-2">
              <span>🔗</span> Endpoints de Administración
            </h3>
            <ul className="space-y-3 text-lime-200 text-sm mb-2">
              <li><b>GET</b> <code>/users</code> — Listar todos los usuarios</li>
              <li><b>GET</b> <code>/users/:id</code> — Ver detalles de un usuario</li>
              <li><b>PATCH</b> <code>/users/:id</code> — Editar usuario</li>
              <li><b>DELETE</b> <code>/users/:id</code> — Eliminar usuario</li>
              <li><b>GET</b> <code>/matches</code> — Listar todos los partidos</li>
              <li><b>DELETE</b> <code>/matches/:id</code> — Eliminar partido</li>
              <li><b>POST</b> <code>/email/send</code> — Enviar correo manual</li>
              {/* Agrega más endpoints según tu backend */}
            </ul>
            <div className="mt-2 text-xs text-gray-400">
              <b>Nota:</b> Usa estos endpoints con precaución. Requieren autenticación de administrador.
            </div>
          </section>
        )}
      </main>
    </div>
  );
} 