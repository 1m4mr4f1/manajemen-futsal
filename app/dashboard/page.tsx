// File: app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="p-8 text-center text-gray-500">Memuat statistik...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Ringkasan Bisnis</h1>
      
      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Pendapatan" value={`Rp ${stats.revenue.toLocaleString('id-ID')}`} color="text-green-600" icon="💰" />
        <StatCard title="Total Booking" value={stats.bookings} color="text-blue-600" icon="🗓️" />
        <StatCard title="Jumlah Lapangan" value={stats.fields} color="text-indigo-600" icon="🏟️" />
        <StatCard title="Total Pelanggan" value={stats.users} color="text-purple-600" icon="👥" />
      </div>

      {/* Tabel Aktivitas Terbaru */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Booking Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b">
                <th className="pb-3 px-2">Pelanggan</th>
                <th className="pb-3 px-2">Lapangan</th>
                <th className="pb-3 px-2">Harga</th>
                <th className="pb-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b: any) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{b.user.name}</td>
                  <td className="py-3 px-2">{b.field.name}</td>
                  <td className="py-3 px-2 font-bold text-green-700">Rp {b.total_price.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-2 italic text-gray-400 text-sm">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase">{title}</p>
        <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
      </div>
    </div>
  );
}