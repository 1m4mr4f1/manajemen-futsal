// File: app/dashboard/users/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2

// Definisi tipe data User
type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'customer';
  created_at: string;
};

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'customer'
  });

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Gagal ambil data user", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. Submit Form (Create User)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        // Reset form jika sukses
        setForm({ name: '', email: '', username: '', password: '', role: 'customer' });
        fetchUsers(); // Refresh tabel

        // --- SWEETALERT SUKSES ---
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'User baru telah berhasil didaftarkan.',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });

      } else {
        // --- SWEETALERT ERROR (Validasi Backend) ---
        const err = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Gagal Registrasi',
          text: err.error || "Gagal membuat user",
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      // --- SWEETALERT ERROR (System) ---
      Swal.fire({
        icon: 'error',
        title: 'Error Sistem',
        text: 'Terjadi kesalahan koneksi atau server.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-3xl font-bold text-[#343C6A]">Manajemen Pengguna</h1>
      
      {/* --- FORM REGISTRASI USER --- */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-6 text-gray-700">Registrasi Pengguna Baru</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baris 1: Nama & Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
            <input 
              type="text" required placeholder="Contoh: Budi Santoso"
              className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all"
              value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input 
              type="email" required placeholder="budi@example.com"
              className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all"
              value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>

          {/* Baris 2: Username & Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Username</label>
            <input 
              type="text" required placeholder="budi_123"
              className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all"
              value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Password</label>
            <input 
              type="password" required placeholder="********"
              className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all"
              value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
            />
          </div>

          {/* Baris 3: Role & Button */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Role Akses</label>
            <select 
              className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none cursor-pointer"
              value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}
            >
              <option value="customer">Customer (Pelanggan)</option>
              <option value="admin">Admin (Pengelola)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              disabled={isSubmitting}
              className="w-full bg-[#2D60FF] hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses...' : '+ Tambah User'}
            </button>
          </div>
        </form>
      </div>

      {/* --- TABEL LIST USER --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-[#343C6A]">Daftar Pengguna Terdaftar</h2>
        
        {isLoading ? (
          <p className="text-center text-gray-500 py-10">Memuat data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-100">
                  <th className="pb-3 px-4 font-medium">User Info</th>
                  <th className="pb-3 px-4 font-medium">Username</th>
                  <th className="pb-3 px-4 font-medium">Role</th>
                  <th className="pb-3 px-4 font-medium">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    {/* Nama & Email */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-700">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </td>
                    
                    {/* Username (Style Badge Abu) */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                        @{user.username}
                      </span>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Tanggal Join */}
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">Belum ada user terdaftar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}