// File: app/dashboard/reports/page.tsx
'use client';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // UBAH 1: Import sebagai variabel
import * as XLSX from 'xlsx';
import { 
  Filter, 
  ArrowUpFromLine 
} from 'lucide-react';

export default function ReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Filter (Default: Bulan & Tahun Ini)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Data Master Bulan
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const years = [2024, 2025, 2026, 2027]; 

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?month=${selectedMonth}&year=${selectedYear}`);
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear]);

  // --- LOGIKA PENGOLAHAN DATA ---

  // A. Laporan Pendapatan Harian
  const getDailyIncome = () => {
    const dailyData: Record<string, number> = {};
    bookings.forEach(b => {
      const date = new Date(b.start_time).toLocaleDateString('id-ID');
      dailyData[date] = (dailyData[date] || 0) + b.total_price;
    });
    return Object.entries(dailyData).map(([date, total]) => ({ date, total }));
  };

  // B. Laporan Performa Lapangan
  const getFieldPerformance = () => {
    const fieldStats: Record<string, { count: number, revenue: number }> = {};
    bookings.forEach(b => {
      const name = b.field.name;
      if (!fieldStats[name]) fieldStats[name] = { count: 0, revenue: 0 };
      fieldStats[name].count += 1;
      fieldStats[name].revenue += b.total_price;
    });
    return Object.entries(fieldStats).map(([name, stats]) => ({ name, ...stats }));
  };

  // C. Laporan Top Pelanggan
  const getTopCustomers = () => {
    const customerStats: Record<string, { count: number, type: string }> = {};
    bookings.forEach(b => {
      const name = b.user ? b.user.name : `${b.guest_name} (Tamu)`;
      const type = b.user ? "Member" : "Non-Member";
      
      if (!customerStats[name]) customerStats[name] = { count: 0, type };
      customerStats[name].count += 1;
    });
    return Object.entries(customerStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); 
  };

  // --- FUNGSI EXPORT (DIPERBAIKI) ---
  const exportPDF = (title: string, columns: string[], data: any[]) => {
    const doc = new jsPDF();
    
    // Header PDF
    doc.text(`${title} - ${months[selectedMonth]} ${selectedYear}`, 14, 15);
    doc.text(`BankDash Futsal Management`, 14, 22);
    
    // UBAH 2: Panggil autoTable sebagai fungsi, masukkan 'doc' sebagai parameter pertama
    autoTable(doc, {
      startY: 30,
      head: [columns],
      body: data,
    });

    doc.save(`${title.replace(/\s+/g, '_')}_${months[selectedMonth]}_${selectedYear}.pdf`);
  };

  const exportExcel = (title: string, data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${months[selectedMonth]}_${selectedYear}.xlsx`);
  };

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24 z-10">
        <div>
          <h1 className="text-2xl font-bold text-[#343C6A]">📊 Pusat Laporan</h1>
          <p className="text-gray-500 text-sm">Analisis performa bisnis bulanan Anda</p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-[#F5F7FA] px-4 py-2 rounded-lg border border-gray-200">
            <Filter size={18} className="text-gray-500"/>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent outline-none text-[#343C6A] font-medium cursor-pointer"
            >
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-[#F5F7FA] px-4 py-2 rounded-lg border border-gray-200">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent outline-none text-[#343C6A] font-medium cursor-pointer"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Sedang menyusun laporan...</div>
      ) : (
        <>
          {/* 1. LAPORAN PENDAPATAN HARIAN */}
          <ReportSection 
            title="Laporan Pendapatan Harian"
            icon="💰"
            onExportPDF={() => {
              const data = getDailyIncome().map(d => [d.date, formatRp(d.total)]);
              exportPDF("Laporan_Pendapatan", ["Tanggal", "Total Pendapatan"], data);
            }}
            onExportExcel={() => exportExcel("Laporan_Pendapatan", getDailyIncome())}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr><th className="p-4 pl-6">Tanggal</th><th className="p-4 pr-6 font-bold text-right">Pendapatan</th></tr>
              </thead>
              <tbody className="divide-y">
                {getDailyIncome().map((d, i) => (
                  <tr key={i}><td className="p-4 pl-6">{d.date}</td><td className="p-4 pr-6 text-right font-mono text-green-600 font-bold">{formatRp(d.total)}</td></tr>
                ))}
                {getDailyIncome().length === 0 && <tr><td colSpan={2} className="p-6 text-center text-gray-400">Tidak ada transaksi</td></tr>}
              </tbody>
            </table>
          </ReportSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 2. PERFORMA LAPANGAN */}
            <ReportSection 
              title="Performa Lapangan"
              icon="🏟️"
              onExportPDF={() => {
                const data = getFieldPerformance().map(f => [f.name, f.count, formatRp(f.revenue)]);
                exportPDF("Laporan_Lapangan", ["Nama Lapangan", "Jml Booking", "Total Omzet"], data);
              }}
              onExportExcel={() => exportExcel("Laporan_Lapangan", getFieldPerformance())}
            >
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="p-4 pl-6">Lapangan</th><th className="p-4 text-center">Freq</th><th className="p-4 pr-6 text-right">Omzet</th></tr>
                </thead>
                <tbody className="divide-y">
                  {getFieldPerformance().map((f, i) => (
                    <tr key={i}>
                      <td className="p-4 pl-6 font-medium">{f.name}</td>
                      <td className="p-4 text-center"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">{f.count}x</span></td>
                      <td className="p-4 pr-6 text-right font-medium text-gray-700">{formatRp(f.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ReportSection>

            {/* 3. TOP PELANGGAN */}
            <ReportSection 
              title="Top 10 Pelanggan"
              icon="🏆"
              onExportPDF={() => {
                const data = getTopCustomers().map((c, i) => [i+1, c.name, c.type, c.count]);
                exportPDF("Laporan_Top_Pelanggan", ["Rank", "Nama", "Tipe", "Total Main"], data);
              }}
              onExportExcel={() => exportExcel("Laporan_Top_Pelanggan", getTopCustomers())}
            >
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="p-4 pl-6">Rank</th><th className="p-4">Pelanggan</th><th className="p-4 pr-6 text-right">Main</th></tr>
                </thead>
                <tbody className="divide-y">
                  {getTopCustomers().map((c, i) => (
                    <tr key={i}>
                      <td className="p-4 pl-6"><span className="w-6 h-6 flex items-center justify-center bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">{i+1}</span></td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{c.name}</div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">{c.type}</div>
                      </td>
                      <td className="p-4 pr-6 text-right font-bold text-[#343C6A]">{c.count} Kali</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ReportSection>

          </div>
        </>
      )}
    </div>
  );
}

// --- KOMPONEN SECTION DENGAN TOMBOL BARU ---
function ReportSection({ title, icon, children, onExportPDF, onExportExcel }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header Card */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Judul & Icon */}
        <div className="flex items-center gap-3">
          <span className="text-2xl w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg">{icon}</span>
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        </div>

        {/* Tombol Export (Design Baru: Panah Atas + Teks) */}
        <div className="flex gap-3">
          
          {/* Tombol PDF */}
          <button 
            onClick={onExportPDF} 
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-xs font-bold uppercase tracking-wide group"
          >
            <ArrowUpFromLine size={16} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
            <span>Export PDF</span>
          </button>
          
          {/* Tombol Excel */}
          <button 
            onClick={onExportExcel} 
            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-xs font-bold uppercase tracking-wide group"
          >
            <ArrowUpFromLine size={16} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
            <span>Export Excel</span>
          </button>

        </div>
      </div>

      {/* Konten Tabel */}
      <div className="p-0">
        {children}
      </div>
    </div>
  );
}