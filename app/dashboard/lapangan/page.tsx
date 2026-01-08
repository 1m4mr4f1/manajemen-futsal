// File: app/dashboard/lapangan/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2

// Tipe data untuk TypeScript
type Field = {
  id: string;
  name: string;
  type: string;
  price_per_hour: number;
};

export default function LapanganPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Form
  const [form, setForm] = useState({ name: '', type: 'Vinyl', price: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data saat halaman dibuka
  const fetchFields = async () => {
    try {
      const res = await fetch('/api/fields');
      const data = await res.json();
      setFields(data);
    } catch (err) {
      console.error("Gagal ambil data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // 2. Handle Submit Form Tambah (Update dengan SweetAlert)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          price_per_hour: form.price
        })
      });
      
      if (res.ok) {
        setForm({ name: '', type: 'Vinyl', price: '' }); // Reset form
        fetchFields(); // Refresh tabel
        
        // --- ALERT SUKSES ---
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Lapangan baru berhasil ditambahkan.',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true
        });
      }
    } catch (err) {
      // --- ALERT ERROR ---
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menyimpan data.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Hapus (Update dengan Konfirmasi SweetAlert)
  const handleDelete = async (id: string) => {
    // Tampilkan Dialog Konfirmasi
    const result = await Swal.fire({
      title: 'Hapus Lapangan?',
      text: "Data lapangan ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Merah untuk bahaya
      cancelButtonColor: '#3085d6', // Biru untuk batal
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    // Jika user klik "Ya, Hapus!"
    if (result.isConfirmed) {
      try {
        await fetch(`/api/fields/${id}`, { method: 'DELETE' });
        fetchFields(); // Refresh tabel
        
        // Notifikasi Sukses Hapus
        Swal.fire(
          'Terhapus!',
          'Data lapangan berhasil dihapus.',
          'success'
        );
      } catch (err) {
        Swal.fire('Error!', 'Gagal menghapus data.', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-3xl font-bold text-[#343C6A]">Manajemen Lapangan</h1>

      {/* Bagian 1: Form Tambah Lapangan */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Tambah Lapangan Baru</h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-gray-600">Nama Lapangan</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Lapangan A"
              className="w-full mt-1 p-3 bg-[#F5F7FA] rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
            />
          </div>
          
          <div className="w-full md:w-48">
            <label className="text-sm font-medium text-gray-600">Jenis Lantai</label>
            <select 
              className="w-full mt-1 p-3 bg-[#F5F7FA] rounded-lg outline-none cursor-pointer"
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
            >
              <option value="Vinyl">Vinyl</option>
              <option value="Sintetis">Rumput Sintetis</option>
              <option value="Parquet">Parquet (Kayu)</option>
              <option value="Semen">Semen Halus</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium text-gray-600">Harga / Jam</label>
            <input 
              type="number" 
              required
              placeholder="Rp"
              className="w-full mt-1 p-3 bg-[#F5F7FA] rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all"
              value={form.price}
              onChange={(e) => setForm({...form, price: e.target.value})}
            />
          </div>

          <button 
            disabled={isSubmitting}
            className="bg-[#2D60FF] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 min-w-[120px]"
          >
            {isSubmitting ? '...' : '+ Tambah'}
          </button>
        </form>
      </div>

      {/* Bagian 2: Tabel Daftar Lapangan */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-[#343C6A]">Daftar Lapangan Tersedia</h2>
        
        {isLoading ? (
          <p className="text-center text-gray-500 py-10">Memuat data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-100">
                  <th className="pb-3 px-4 font-medium">Nama Lapangan</th>
                  <th className="pb-3 px-4 font-medium">Jenis</th>
                  <th className="pb-3 px-4 font-medium">Harga / Jam</th>
                  <th className="pb-3 px-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">Belum ada data lapangan.</td>
                  </tr>
                ) : (
                  fields.map((field) => (
                    <tr key={field.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-700">{field.name}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          field.type === 'Vinyl' ? 'bg-blue-100 text-blue-600' :
                          field.type === 'Sintetis' ? 'bg-green-100 text-green-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {field.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-700">
                        Rp {field.price_per_hour.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleDelete(field.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Hapus
                        </button>
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