// File: app/dashboard/bookings/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    user_id: '',
    field_id: '',
    start_time: '',
    end_time: ''
  });

  // Load semua data yang dibutuhkan form
  const fetchData = async () => {
    try {
      const [resB, resU, resF] = await Promise.all([
        fetch('/api/booking'),
        fetch('/api/user'),
        fetch('/api/lapangan')
      ]);
      
      setBookings(await resB.json());
      setUsers(await resU.json());
      setFields(await resF.json());
    } catch (error) {
      console.error("Gagal memuat data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Booking Berhasil!");
      setForm({ user_id: '', field_id: '', start_time: '', end_time: '' });
      fetchData();
    } else {
      const err = await res.json();
      alert("Gagal: " + err.error);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Manajemen Transaksi Booking</h1>

      {/* Form Booking Baru */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Buat Reservasi Baru</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Pelanggan</label>
            <select 
              className="w-full p-2 border rounded bg-white"
              value={form.user_id} onChange={(e) => setForm({...form, user_id: e.target.value})} required
            >
              <option value="">Pilih User</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lapangan</label>
            <select 
              className="w-full p-2 border rounded bg-white"
              value={form.field_id} onChange={(e) => setForm({...form, field_id: e.target.value})} required
            >
              <option value="">Pilih Lapangan</option>
              {fields.map((f: any) => <option key={f.id} value={f.id}>{f.name} (Rp {f.price_per_hour}/jam)</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mulai</label>
            <input 
              type="datetime-local" className="w-full p-2 border rounded"
              value={form.start_time} onChange={(e) => setForm({...form, start_time: e.target.value})} required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Selesai</label>
            <input 
              type="datetime-local" className="w-full p-2 border rounded"
              value={form.end_time} onChange={(e) => setForm({...form, end_time: e.target.value})} required
            />
          </div>

          <button className="bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700 transition">
            Booking Sekarang
          </button>
        </form>
      </div>

      {/* Tabel Riwayat Booking */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Pelanggan</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Lapangan</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Waktu</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Total Harga</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b: any) => (
              <tr key={b.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{b.user?.name}</p>
                  <p className="text-xs text-gray-400">{b.user?.email}</p>
                </td>
                <td className="p-4 text-gray-700">{b.field?.name}</td>
                <td className="p-4 text-sm">
                  {new Date(b.start_time).toLocaleString('id-ID')} - {new Date(b.end_time).toLocaleTimeString('id-ID')}
                </td>
                <td className="p-4 font-bold text-green-700">
                  Rp {b.total_price.toLocaleString('id-ID')}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {b.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && !loading && <p className="p-8 text-center text-gray-500">Belum ada riwayat booking.</p>}
      </div>
    </div>
  );
}