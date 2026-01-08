// File: app/dashboard/bookings/page.tsx
'use client';
import { useState, useEffect } from 'react';

// Opsional: Jika ingin pakai SweetAlert seperti halaman lain, import di sini
// import Swal from 'sweetalert2'; 

export default function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    user_id: '',
    field_id: '',
    start_time: '',
    end_time: ''
  });

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const [resB, resU, resF] = await Promise.all([
        fetch('/api/booking'),
        fetch('/api/user'),
        fetch('/api/lapangan') // Pastikan endpoint ini sesuai backend kamu
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

  // 2. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("✅ Booking Berhasil!"); // Bisa diganti Swal.fire()
        setForm({ user_id: '', field_id: '', start_time: '', end_time: '' });
        fetchData();
      } else {
        const err = await res.json();
        alert("❌ Gagal: " + err.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-[#343C6A]">Manajemen Transaksi Booking</h1>

      {/* --- FORM BOOKING BARU --- */}
      <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700">Buat Reservasi Baru</h2>
        
        {/* Grid: 1 Kolom di HP, 2 Kolom di Tablet, 5 Kolom di Desktop */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Pelanggan</label>
            <select 
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 outline-none"
              value={form.user_id} onChange={(e) => setForm({...form, user_id: e.target.value})} required
            >
              <option value="">-- Pilih User --</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Lapangan</label>
            <select 
              className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 outline-none"
              value={form.field_id} onChange={(e) => setForm({...form, field_id: e.target.value})} required
            >
              <option value="">-- Pilih Lapangan --</option>
              {fields.map((f: any) => <option key={f.id} value={f.id}>{f.name} (Rp {f.price_per_hour.toLocaleString()})</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Mulai</label>
            <input 
              type="datetime-local" 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              value={form.start_time} onChange={(e) => setForm({...form, start_time: e.target.value})} required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Selesai</label>
            <input 
              type="datetime-local" 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              value={form.end_time} onChange={(e) => setForm({...form, end_time: e.target.value})} required
            />
          </div>

          {/* Tombol Full Width di HP */}
          <button 
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white p-2.5 rounded-lg font-bold hover:bg-green-700 transition shadow-md disabled:opacity-50"
          >
            {isSubmitting ? '...' : 'Booking Sekarang'}
          </button>
        </form>
      </div>

      {/* --- TABEL RIWAYAT BOOKING --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
           <h3 className="font-semibold text-gray-700">Data Riwayat Transaksi</h3>
        </div>

        {/* Wrapper Scroll Horizontal untuk HP */}
        <div className="overflow-x-auto">
          {/* Min-Width agar tabel tidak gepeng */}
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Pelanggan</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Lapangan</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Waktu Main</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Total Harga</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr><td colSpan={5} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : bookings.length === 0 ? (
                 <tr><td colSpan={5} className="p-8 text-center text-gray-500">Belum ada riwayat booking.</td></tr>
              ) : (
                bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{b.user?.name || 'Tamu'}</p>
                      <p className="text-xs text-gray-400">{b.user?.email || '-'}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {b.field?.name}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="font-medium">{new Date(b.start_time).toLocaleDateString('id-ID')}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(b.start_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} - {new Date(b.end_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-green-700">
                      Rp {b.total_price.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                        b.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-200' :
                        b.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}