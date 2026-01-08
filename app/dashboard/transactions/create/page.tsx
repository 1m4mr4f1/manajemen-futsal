// File: app/dashboard/transactions/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; 

export default function CreateBookingPage() {
  const router = useRouter();
  
  // --- STATE DATA ---
  const [users, setUsers] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE FORM ---
  const [bookingType, setBookingType] = useState<'member' | 'guest'>('guest');

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    user_id: '',
    guest_name: '',
    guest_phone: '',
    field_id: '',
    date: getTodayString(), 
    start_hour: '08',
    duration: '1'
  });

  const operatingHours = Array.from({ length: 14 }, (_, i) => i + 8); 

  // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resUser, resField, resBooking] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/fields'),
          fetch('/api/booking') 
        ]);
        
        const userData = await resUser.json();
        const fieldData = await resField.json();
        const bookingData = await resBooking.json();

        setUsers(userData);
        setFields(fieldData);
        setAllBookings(bookingData);

        // Set default values jika data ada
        if (userData.length > 0) setForm(prev => ({ ...prev, user_id: userData[0].id }));
        if (fieldData.length > 0) setForm(prev => ({ ...prev, field_id: fieldData[0].id }));
        
      } catch (error) {
        console.error("Gagal memuat data:", error);
        Swal.fire('Error', 'Gagal memuat data server', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. VALIDASI JAM BENTROK
  const isHourOccupied = (hour: number) => {
    const bookingsOnDate = allBookings.filter(b => {
      const bookingDate = new Date(b.start_time).toISOString().split('T')[0];
      return bookingDate === form.date && b.field_id === form.field_id && b.status !== 'cancelled';
    });

    return bookingsOnDate.some(b => {
      const start = new Date(b.start_time).getHours();
      const end = new Date(b.end_time).getHours();
      return hour >= start && hour < end;
    });
  };

  // 3. HITUNG HARGA
  const getEstimatedPrice = () => {
    const field = fields.find(f => f.id === form.field_id);
    if (!field) return 0;
    return field.price_per_hour * parseInt(form.duration);
  };

  // 4. SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      user_id: bookingType === 'member' ? form.user_id : '',
      guest_name: bookingType === 'guest' ? form.guest_name : '',
      guest_phone: bookingType === 'guest' ? form.guest_phone : '',
    };

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal membuat booking");

      Swal.fire({
        icon: 'success',
        title: 'Booking Berhasil!',
        text: 'Jadwal telah tersimpan di sistem.',
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true
      }).then(() => {
        router.push('/dashboard/transactions');
        router.refresh(); 
      });

    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Booking',
        text: err.message,
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500">Memuat form...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
      
      {/* HEADER: Stack di HP, Row di Desktop */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#343C6A]">Input Booking Baru</h1>
        <button 
          onClick={() => router.back()} 
          className="self-start md:self-auto text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition border border-gray-200"
        >
          &larr; Kembali
        </button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        
        {/* TOGGLE: Tombol besar vertikal di HP, horizontal di Desktop */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-8 border-b border-gray-100 pb-6">
          <button 
            type="button"
            onClick={() => setBookingType('guest')}
            className={`flex-1 py-4 px-4 rounded-xl font-bold text-center transition-all border-2 ${
              bookingType === 'guest' 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <span className="block text-2xl mb-1">👤</span>
            Tamu Umum (Walk-in)
          </button>
          
          <button 
             type="button"
            onClick={() => setBookingType('member')}
            className={`flex-1 py-4 px-4 rounded-xl font-bold text-center transition-all border-2 ${
              bookingType === 'member' 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <span className="block text-2xl mb-1">⭐</span>
            Member Terdaftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* BAGIAN 1: DATA PELANGGAN */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-l-4 border-blue-500 pl-3">
              Data Pelanggan
            </h3>
            
            {bookingType === 'member' ? (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Pilih Member</label>
                <select 
                  className="w-full p-3 bg-[#F5F7FA] rounded-lg border border-transparent focus:border-blue-500 outline-none transition"
                  value={form.user_id}
                  onChange={(e) => setForm({...form, user_id: e.target.value})}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Nama Pemesan</label>
                  <input 
                    type="text" required placeholder="Contoh: Pak Budi"
                    className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none focus:border-blue-500 border border-transparent"
                    value={form.guest_name}
                    onChange={(e) => setForm({...form, guest_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Nomor HP / WA</label>
                  <input 
                    type="text" required placeholder="Contoh: 08123456789"
                    className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none focus:border-blue-500 border border-transparent"
                    value={form.guest_phone}
                    onChange={(e) => setForm({...form, guest_phone: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          {/* BAGIAN 2: JADWAL */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-l-4 border-blue-500 pl-3">
              Detail Jadwal Main
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Lapangan full width di kolom ini */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">Pilih Lapangan</label>
                <select 
                  className="w-full p-3 bg-[#F5F7FA] rounded-lg border border-transparent focus:border-blue-500 outline-none"
                  value={form.field_id}
                  onChange={(e) => setForm({...form, field_id: e.target.value})}
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} - {f.type} (Rp {f.price_per_hour.toLocaleString()}/jam)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Tanggal Main</label>
                <input 
                  type="date" required min={getTodayString()} 
                  className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none focus:border-blue-500 border border-transparent"
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                />
              </div>

              {/* Jam dan Durasi Bersebelahan */}
              <div className="flex gap-3 md:gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Jam Mulai</label>
                  <select 
                    className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none focus:border-blue-500 border border-transparent"
                    value={form.start_hour}
                    onChange={(e) => setForm({...form, start_hour: e.target.value})}
                  >
                    {operatingHours.map(h => {
                      const isOccupied = isHourOccupied(h);
                      return (
                        <option 
                          key={h} value={h.toString().padStart(2, '0')} disabled={isOccupied} 
                          className={isOccupied ? "bg-red-100 text-gray-400" : ""}
                        >
                          {h.toString().padStart(2, '0')}:00 {isOccupied ? '(Terisi)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Durasi</label>
                  <select 
                    className="w-full p-3 bg-[#F5F7FA] rounded-lg outline-none focus:border-blue-500 border border-transparent"
                    value={form.duration}
                    onChange={(e) => setForm({...form, duration: e.target.value})}
                  >
                    {[1,2,3,4].map(d => <option key={d} value={d}>{d} Jam</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN 3: RINGKASAN & SUBMIT */}
          <div className="pt-6 border-t border-gray-100">
            <div className="bg-blue-50 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left border border-blue-100">
              
              <div className="w-full md:w-auto">
                <p className="text-sm text-blue-600 font-medium mb-1">Ringkasan:</p>
                <p className="text-xl font-bold text-blue-900">
                  {form.start_hour}:00 s/d {parseInt(form.start_hour) + parseInt(form.duration)}:00
                </p>
                <p className="text-sm text-blue-500 mt-1">Durasi {form.duration} Jam</p>
              </div>

              <div className="w-full md:w-auto text-center md:text-right">
                <p className="text-sm text-blue-600 font-medium mb-1">Total Biaya:</p>
                <p className="text-3xl font-black text-blue-800">
                  Rp {getEstimatedPrice().toLocaleString('id-ID')}
                </p>
              </div>

            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full bg-[#2D60FF] hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 disabled:opacity-50 transition-all transform hover:-translate-y-1"
            >
              {isSubmitting ? 'Sedang Memproses...' : '✅ Simpan Booking'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}