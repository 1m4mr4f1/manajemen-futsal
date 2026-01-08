// File: app/dashboard/layout.tsx
'use client'; 

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  CreditCard, 
  LogOut, 
  Layers, 
  Search,
  Settings,
  Bell,
  Wallet,
  FileText // Import Icon FileText untuk Laporan
} from 'lucide-react';

// --- DATA MENU UNTUK PENCARIAN (Updated) ---
const MENU_ITEMS = [
  { label: 'Dashboard Overview', href: '/dashboard' },
  { label: 'Manajemen Lapangan', href: '/dashboard/lapangan' },
  { label: 'Daftar Pengguna / Users', href: '/dashboard/users' },
  { label: 'Jadwal Lapangan', href: '/dashboard/schedule' },
  { label: 'Transaksi & Booking', href: '/dashboard/transactions' },
  { label: 'Buat Booking Baru', href: '/dashboard/transactions/create' },
  { label: 'Laporan Bulanan', href: '/dashboard/reports' }, // Item Baru
];

export default function BankDashLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // --- STATE PENCARIAN ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- LOGIKA FUZZY SEARCH ---
  const levenshtein = (a: string, b: string) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    
    const results = MENU_ITEMS.filter(item => {
      const lowerLabel = item.label.toLowerCase();
      if (lowerLabel.includes(lowerQuery)) return true;
      const distance = levenshtein(lowerQuery, lowerLabel);
      return lowerQuery.length > 3 && distance <= 3; 
    });

    setSearchResults(results);
    setShowDropdown(true);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] text-[#343C6A] font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-24 flex items-center px-8 border-b border-gray-50 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-[#2D60FF]">
              <Wallet size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#343C6A] tracking-tight">Futsal Pro Manajemen.</h1>
          </div>
        </div>
        
        {/* NAVIGASI MENU UTAMA */}
        <nav className="space-y-2 px-4 flex-1 overflow-y-auto py-4">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={pathname === '/dashboard'} />
          <NavItem href="/dashboard/lapangan" icon={Layers} label="Lapangan" isActive={pathname.startsWith('/dashboard/lapangan')} />
          <NavItem href="/dashboard/users" icon={Users} label="Pengguna" isActive={pathname.startsWith('/dashboard/users')} />
          <NavItem href="/dashboard/schedule" icon={CalendarDays} label="Jadwal Lapangan" isActive={pathname.startsWith('/dashboard/schedule')} />
          <NavItem href="/dashboard/transactions" icon={CreditCard} label="Transaksi" isActive={pathname.startsWith('/dashboard/transactions')} />
          
          {/* MENU LAPORAN (BARU) */}
          <NavItem href="/dashboard/reports" icon={FileText} label="Laporan" isActive={pathname.startsWith('/dashboard/reports')} />
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group">
             <LogOut size={22} className="group-hover:stroke-red-500 transition-colors" />
             <span className="font-semibold">Logout</span>
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col ml-[280px]">
        
        {/* TOP NAVBAR */}
        <header className="h-24 bg-white px-8 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-[#343C6A]">Overview</h2>
          
          <div className="flex items-center gap-6">
            
            {/* SEARCH BAR PINTAR */}
            <div className="relative hidden md:block" ref={searchRef}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari fitur (misal: laporan)..." 
                className="bg-[#F5F7FA] py-3 pl-12 pr-6 rounded-full text-sm outline-none w-72 focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-400" 
              />

              {/* DROPDOWN HASIL SEARCH */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-14 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {searchResults.map((item, idx) => (
                    <Link 
                      key={idx} 
                      href={item.href}
                      onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                      className="block px-4 py-3 hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
                    >
                      <span className="text-xs text-gray-400">🔗</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* SETTINGS & NOTIF */}
            <button className="w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Settings size={20} />
            </button>
            <button className="w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* AVATAR ADMIN */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 cursor-pointer hover:scale-105 transition-transform border-2 border-white">
               A
            </div>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

// Komponen NavItem
function NavItem({ icon: Icon, label, href, isActive }: { icon: any, label: string, href: string, isActive: boolean }) {
  return (
    <Link href={href} className="block group">
      <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 relative ${
        isActive 
          ? 'bg-blue-50 text-[#2D60FF]' 
          : 'text-gray-400 hover:text-[#2D60FF] hover:bg-gray-50'
      }`}>
        <Icon 
          size={22} 
          className={isActive ? "stroke-[#2D60FF]" : "stroke-gray-400 group-hover:stroke-[#2D60FF] transition-colors"} 
          strokeWidth={isActive ? 2.5 : 2} 
        />
        <span className={`font-semibold text-[15px] ${isActive ? "font-bold" : ""}`}>{label}</span>
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2D60FF] rounded-r-md"></div>
        )}
      </div>
    </Link>
  );
}