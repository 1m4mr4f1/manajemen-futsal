// File: app/dashboard/schedule/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function SchedulePage() {
  // --- STATE ---
  const [fields, setFields] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default tanggal hari ini (Format YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Jam Operasional (08:00 - 22:00)
  const operatingHours = Array.from({ length: 15 }, (_, i) => i + 8); 

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resFields, resBookings] = await Promise.all([
          fetch('/api/fields'),
          fetch('/api/booking')
        ]);
        
        const dataFields = await resFields.json();
        const dataBookings = await resBookings.json();

        setFields(dataFields);
        setBookings(dataBookings);
      } catch (error) {
        console.error("Gagal ambil data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LOGIKA CARI BOOKING ---
  // Fungsi untuk mengecek siapa yang main di Lapangan X pada Jam Y
  const getBookingAt = (fieldId: string, hour: number) => {
    return bookings.find(b => {
      // 1. Cek Tanggal
      const bookingDate = new Date(b.start_time).toISOString().split('T')[0];
      if (bookingDate !== selectedDate) return false;
      
      // 2. Cek Lapangan & Status
      if (b.field_id !== fieldId) return false;
      if (b.status === 'cancelled') return false;

      // 3. Cek Jam (Support Durasi)
      // Misal main jam 10 durasi 2 jam (sampai 12). Maka jam 10 dan 11 dianggap booked.
      const startH = new Date(b.start_time).getHours();
      const endH = new Date(b.end_time).getHours();
      
      return hour >= startH && hour < endH;
    });
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat Jadwal...</div>;

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER & FILTER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-24 z-10">
        <div>
          <h1 className="text-2xl font-bold text-[#343C6A]">📅 Jadwal Lapangan</h1>
          <p className="text-sm text-gray-400">Pantau ketersediaan lapangan secara real-time</p>
        </div>

        <div className="flex items-center gap-3 bg-[#F5F7FA] p-2 rounded-lg border border-gray-200">
          <span className="text-gray-500 font-medium pl-2">Pilih Tanggal:</span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
          />
        </div>
      </div>

      {/* LOOPING TABEL PER LAPANGAN */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {fields.map((field) => (
          <div key={field.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Header Tabel (Nama Lapangan) */}
            <div className="bg-[#343C6A] p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">🏟️ {field.name}</h2>
              <span className="text-xs bg-white/20 px-2 py-1 rounded text-white capitalize">
                {field.type}
              </span>
            </div>

            {/* Isi Tabel */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-600 w-32">Jam</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Status / Pemesan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {operatingHours.map((hour) => {
                    const booking = getBookingAt(field.id, hour);
                    const isOccupied = !!booking;
                    
                    // Cek apakah ini jam pertama dari durasi booking (untuk tampilan rapi)
                    const isStartOfBooking = isOccupied && new Date(booking.start_time).getHours() === hour;

                    return (
                      <tr key={hour} className={`transition-colors ${isOccupied ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                        
                        {/* Kolom JAM */}
                        <td className="px-6 py-3 font-mono text-gray-500 border-r border-gray-100">
                          {hour.toString().padStart(2, '0')}:00
                        </td>

                        {/* Kolom STATUS */}
                        <td className="px-6 py-3">
                          {isOccupied ? (
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#343C6A]">
                                  {booking.user ? booking.user.name : booking.guest_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {booking.user ? "Member" : "Tamu (Non-Member)"} 
                                  {/* Tampilkan durasi hanya di jam pertama */}
                                  {isStartOfBooking && ` • ${
                                    (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 3600000
                                  } Jam`}
                                </span>
                              </div>
                              
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
                              ✅ Tersedia
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          Belum ada lapangan yang terdaftar.
        </div>
      )}
    </div>
  );
}