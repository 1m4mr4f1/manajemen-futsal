// File: app/dashboard/users/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '' });

  const fetchUsers = async () => {
    const res = await fetch('/api/user');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: '', email: '' });
      fetchUsers();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Pelanggan</h1>
      
      {/* Form Tambah User */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input 
            type="text" placeholder="Nama Lengkap" required
            className="flex-1 p-2 border rounded"
            value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
          />
          <input 
            type="email" placeholder="Email (Unik)" required
            className="flex-1 p-2 border rounded"
            value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
          />
          <button className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
            Daftar User
          </button>
        </form>
      </div>

      {/* Tabel List User */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nama</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">ID Pelanggan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{user.role}</span></td>
                <td className="p-4 text-xs font-mono text-gray-400">{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}