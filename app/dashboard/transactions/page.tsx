// File: app/dashboard/transactions/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2

// Tipe Data
type Booking = {
  id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  user: { name: string; email: string } | null;
  guest_name?: string;
  guest_phone?: string;
  field: { name: string };
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil Data
  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/booking');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Gagal ambil data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 2. Handle Status Change (Toast Notification)
  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic Update (Ubah UI duluan biar cepat)
    const oldData = [...transactions];
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      const res = await fetch(`/api/booking/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error();

      // Toast Sukses
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      Toast.fire({
        icon: 'success',
        title: `Status berhasil diubah jadi ${newStatus.toUpperCase()}`
      });

    } catch (err) {
      // Rollback jika gagal
      setTransactions(oldData);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengupdate status transaksi.',
      });
    }
  };

  // 3. Handle Delete (Confirm Dialog)
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Transaksi?',
      text: "Data riwayat ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/booking/${id}`, { method: 'DELETE' });
        
        // Hapus dari state UI
        setTransactions(prev => prev.filter(t => t.id !== id));
        
        Swal.fire(
          'Terhapus!',
          'Data transaksi telah dihapus.',
          'success'
        );
      } catch (err) {
        Swal.fire('Error!', 'Gagal menghapus data.', 'error');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#343C6A]">Riwayat Transaksi</h1>
        <a href="/dashboard/transactions/create" className="bg-[#2D60FF] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200">
          <span>+</span> Booking Manual
        </a>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {isLoading ? (
          <p className="text-center py-10 text-gray-500">Memuat transaksi...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-4 px-4 font-semibold">Pelanggan</th>
                  <th className="pb-4 px-4 font-semibold">Jadwal Main</th>
                  <th className="pb-4 px-4 font-semibold">Lapangan</th>
                  <th className="pb-4 px-4 font-semibold">Total Harga</th>
                  <th className="pb-4 px-4 font-semibold text-center">Status</th>
                  <th className="pb-4 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada transaksi.</td></tr>
                ) : (
                  transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                      
                      {/* --- KOLOM PELANGGAN --- */}
                      <td className="py-4 px-4">
                        {trx.user ? (
                          // Jika Member
                          <div>
                            <div className="font-bold text-gray-800 flex items-center gap-2">
                              {trx.user.name}
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold uppercase">Member</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{trx.user.email}</div>
                          </div>
                        ) : (
                          // Jika Guest
                          <div>
                            <div className="font-bold text-gray-800 flex items-center gap-2">
                              {trx.guest_name}
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-bold uppercase">Tamu</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{trx.guest_phone || "-"}</div>
                          </div>
                        )}
                      </td>

                      {/* --- KOLOM JADWAL --- */}
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="font-medium">{formatDate(trx.start_time).split('pukul')[0]}</div>
                        <div className="text-xs text-gray-400 mt-1">
                           {new Date(trx.start_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} 
                           {' - '} 
                           {new Date(trx.end_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg">
                          {trx.field.name}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-emerald-600">
                        Rp {trx.total_price.toLocaleString('id-ID')}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                          trx.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-200' :
                          trx.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                          'bg-yellow-50 text-yellow-600 border-yellow-200'
                        }`}>
                          {trx.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {trx.status === 'pending' && (
                            <>
                              <button onClick={() => handleStatusChange(trx.id, 'confirmed')} title="Konfirmasi Lunas" className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition border border-green-200">✓</button>
                              <button onClick={() => handleStatusChange(trx.id, 'cancelled')} title="Batalkan" className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition border border-orange-200">✕</button>
                            </>
                          )}
                          <button onClick={() => handleDelete(trx.id)} title="Hapus Data" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition ml-2 border border-gray-200">🗑️</button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}