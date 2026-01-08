// File: app/dashboard/schedule/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export default function SchedulePage() {
  // --- STATE ---
  const [fields, setFields] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

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
  const getBookingAt = (fieldId: string, hour: number) => {
    return bookings.find(b => {
      const bookingDate = new Date(b.start_time).toISOString().split('T')[0];
      if (bookingDate !== selectedDate) return false;
      if (b.field_id !== fieldId) return false;
      if (b.status === 'cancelled') return false;

      const startH = new Date(b.start_time).getHours();
      const endH = new Date(b.end_time).getHours();
      
      return hour >= startH && hour < endH;
    });
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat Jadwal...</div>;

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      
      {/* HEADER: Disamakan dengan Header Laporan & Transaksi */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#343C6A]">Jadwal Lapangan</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau ketersediaan lapangan secara real-time</p>
        </div>

        {/* Kontrol Filter Tanggal - Konsisten dengan desain Laporan */}
        <div className="flex w-full md:w-auto gap-2">
          <div className="flex-1 md:flex-none flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <Calendar size={18} className="text-gray-400"/>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none text-[#343C6A] font-semibold cursor-pointer w-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* GRID TABEL PER LAPANGAN */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        {fields.map((field) => (
          <div key={field.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md">
            
            {/* Header Tabel (Nama Lapangan) */}
            <div className="bg-[#343C6A] p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-base md:text-lg">🏟️ {field.name}</h2>
              <span className="text-[10px] md:text-xs bg-white/20 px-2 py-1 rounded text-white capitalize font-medium">
                {field.type}
              </span>
            </div>

            {/* Isi Tabel dengan Horizontal Scroll untuk HP kecil */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left text-sm min-w-[300px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 md:px-6 py-3 font-semibold text-gray-400 uppercase text-[10px] md:text-xs w-20 md:w-32 tracking-wider">Jam</th>
                    <th className="px-4 md:px-6 py-3 font-semibold text-gray-400 uppercase text-[10px] md:text-xs tracking-wider">Status / Pemesan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {operatingHours.map((hour) => {
                    const booking = getBookingAt(field.id, hour);
                    const isOccupied = !!booking;
                    const isStartOfBooking = isOccupied && new Date(booking.start_time).getHours() === hour;

                    return (
                      <tr key={hour} className={`transition-colors ${isOccupied ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                        
                        {/* Kolom JAM */}
                        <td className="px-4 md:px-6 py-3 font-mono text-gray-500 border-r border-gray-50 text-xs md:text-sm">
                          {hour.toString().padStart(2, '0')}:00
                        </td>

                        {/* Kolom STATUS */}
                        <td className="px-4 md:px-6 py-3">
                          {isOccupied ? (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#343C6A] text-xs md:text-sm leading-tight">
                                  {booking.user ? booking.user.name : booking.guest_name}
                                </span>
                                <span className="text-[10px] md:text-xs text-gray-400 font-medium">
                                  {booking.user ? "Member" : "Tamu"} 
                                  {isStartOfBooking && ` • ${(new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / 3600000} Jam`}
                                </span>
                              </div>
                              
                              <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 md:py-1 rounded-full uppercase whitespace-nowrap border ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-50 text-green-600 border-green-100' 
                                  : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                              }`}>
                                {booking.status === 'confirmed' ? 'Lunas' : 'Booked'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-emerald-600 bg-emerald-50 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide">
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
        <div className="text-center py-20 text-gray-400 italic">
          Belum ada lapangan yang terdaftar.
        </div>
      )}
    </div>
  );
}