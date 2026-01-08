// File: app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ambil data saat load
  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // Helper Formatter
  const formatMoney = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;
  
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'short'
    });
  };

  const getTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Sedang memuat data dashboard...</div>;
  if (!stats) return <div className="p-10 text-center text-red-500">Gagal memuat data.</div>;

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#343C6A]">Ringkasan Bisnis</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau performa futsal hari ini</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/schedule" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm">
            📅 Lihat Jadwal
          </Link>
          <Link href="/dashboard/transactions/create" className="px-4 py-2 bg-[#2D60FF] text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm shadow-blue-200">
            + Booking Baru
          </Link>
        </div>
      </div>
      
      {/* GRID STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pendapatan" 
          value={formatMoney(stats.revenue)} 
          sub="Semua transaksi lunas"
          color="text-emerald-600" 
          bgIcon="bg-emerald-100"
          icon="💰" 
        />
        <StatCard 
          title="Total Booking" 
          value={stats.bookings} 
          sub="Transaksi masuk"
          color="text-blue-600" 
          bgIcon="bg-blue-100"
          icon="🧾" 
        />
        <StatCard 
          title="Jumlah Lapangan" 
          value={stats.fields} 
          sub="Fasilitas aktif"
          color="text-indigo-600" 
          bgIcon="bg-indigo-100"
          icon="🏟️" 
        />
        <StatCard 
          title="Total Pelanggan" 
          value={stats.users} 
          sub="Member terdaftar"
          color="text-purple-600" 
          bgIcon="bg-purple-100"
          icon="👥" 
        />
      </div>

      {/* TABEL BOOKING TERBARU (LEBIH LENGKAP) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#343C6A]">Aktivitas Booking Terbaru</h2>
          <Link href="/dashboard/transactions" className="text-sm text-blue-600 hover:underline font-medium">
            Lihat Semua &rarr;
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="pb-4 px-4 font-semibold">Pelanggan</th>
                <th className="pb-4 px-4 font-semibold">Jadwal Main</th>
                <th className="pb-4 px-4 font-semibold">Lapangan</th>
                <th className="pb-4 px-4 font-semibold">Total Harga</th>
                <th className="pb-4 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">Belum ada aktivitas booking.</td>
                </tr>
              ) : (
                stats.recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors group">
                    
                    {/* KOLOM 1: PELANGGAN (Hybrid Member/Guest) */}
                    <td className="py-4 px-4">
                      {b.user ? (
                        // Tampilan MEMBER
                        <div>
                          <div className="font-bold text-gray-800 flex items-center gap-2">
                            {b.user.name}
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold uppercase">Member</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{b.user.email}</div>
                        </div>
                      ) : (
                        // Tampilan GUEST
                        <div>
                          <div className="font-bold text-gray-800 flex items-center gap-2">
                            {b.guest_name}
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-bold uppercase">Tamu</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{b.guest_phone || "Tanpa No HP"}</div>
                        </div>
                      )}
                    </td>

                    {/* KOLOM 2: JADWAL (Tanggal & Jam) */}
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-700">
                        {formatDateTime(b.start_time)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        🕒 {getTime(b.start_time)} - {getTime(b.end_time)}
                      </div>
                    </td>

                    {/* KOLOM 3: LAPANGAN */}
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg">
                        {b.field.name}
                      </span>
                    </td>

                    {/* KOLOM 4: HARGA */}
                    <td className="py-4 px-4 font-bold text-emerald-600">
                      {formatMoney(b.total_price)}
                    </td>

                    {/* KOLOM 5: STATUS */}
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                        b.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-200' :
                        b.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-yellow-50 text-yellow-600 border-yellow-200'
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

// Komponen Card Statistik yang dipercantik
function StatCard({ title, value, sub, color, bgIcon, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{title}</p>
        <p className={`text-2xl font-black mt-2 ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 ${bgIcon} rounded-xl flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  );
}