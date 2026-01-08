'use client'; 

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, CalendarDays, CreditCard, LogOut, 
  Layers, Search, Settings, Bell, Wallet, FileText, Menu, X 
} from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Dashboard Overview', href: '/dashboard' },
  { label: 'Manajemen Lapangan', href: '/dashboard/lapangan' },
  { label: 'Daftar Pengguna', href: '/dashboard/users' },
  { label: 'Jadwal Lapangan', href: '/dashboard/schedule' },
  { label: 'Transaksi', href: '/dashboard/transactions' },
  { label: 'Buat Booking', href: '/dashboard/transactions/create' },
  { label: 'Laporan', href: '/dashboard/reports' },
];

export default function BankDashLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State Menu HP

  // --- SEARCH LOGIC (Sama seperti sebelumnya) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]); setShowDropdown(false); return;
    }
    const results = MENU_ITEMS.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
    setSearchResults(results);
    setShowDropdown(true);
  }, [searchQuery]);

  // Tutup menu HP saat pindah halaman
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); } catch (e) { console.error(e); }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] text-[#343C6A] font-sans relative">
      
      {/* --- OVERLAY GELAP (Hanya di HP saat menu buka) --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR (Responsive) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-[280px] bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
      `}>
        <div className="h-20 md:h-24 flex items-center px-6 md:px-8 border-b border-gray-50 mb-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="text-[#2D60FF]"><Wallet size={32} strokeWidth={2.5} /></div>
            <h1 className="text-2xl font-extrabold text-[#343C6A] tracking-tight">Pro Futsal Manajemen</h1>
          </div>
          {/* Tombol Close di Sidebar (Hanya HP) */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>
        
        <nav className="space-y-2 px-4 flex-1 overflow-y-auto py-4 scrollbar-hide">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={pathname === '/dashboard'} />
          <NavItem href="/dashboard/lapangan" icon={Layers} label="Lapangan" isActive={pathname.startsWith('/dashboard/lapangan')} />
          <NavItem href="/dashboard/users" icon={Users} label="Pengguna" isActive={pathname.startsWith('/dashboard/users')} />
          <NavItem href="/dashboard/schedule" icon={CalendarDays} label="Jadwal Lapangan" isActive={pathname.startsWith('/dashboard/schedule')} />
          <NavItem href="/dashboard/transactions" icon={CreditCard} label="Transaksi" isActive={pathname.startsWith('/dashboard/transactions')} />
          <NavItem href="/dashboard/reports" icon={FileText} label="Laporan" isActive={pathname.startsWith('/dashboard/reports')} />
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group">
             <LogOut size={22} />
             <span className="font-semibold">Logout</span>
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col md:ml-[280px] transition-all duration-300">
        
        {/* TOP NAVBAR */}
        <header className="h-20 md:h-24 bg-white px-4 md:px-8 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
          
          <div className="flex items-center gap-4">
            {/* Tombol Hamburger (Hanya HP) */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="md:hidden p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-[#343C6A]">Overview</h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            {/* Search Bar (Hidden di HP Kecil) */}
            <div className="relative hidden md:block" ref={searchRef}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18} /></span>
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari fitur..." 
                className="bg-[#F5F7FA] py-3 pl-12 pr-6 rounded-full text-sm outline-none w-48 lg:w-72 focus:ring-2 focus:ring-blue-100 transition-all" 
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-14 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden z-50">
                  {searchResults.map((item, idx) => (
                    <Link key={idx} href={item.href} className="block px-4 py-2 hover:bg-blue-50 text-sm text-gray-700">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button className="w-10 h-10 md:w-12 md:h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center text-gray-500"><Settings size={20} /></button>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">A</div>
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, href, isActive }: any) {
  return (
    <Link href={href} className="block group">
      <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-[#2D60FF]' : 'text-gray-400 hover:text-[#2D60FF] hover:bg-gray-50'}`}>
        <Icon size={22} className={isActive ? "stroke-[#2D60FF]" : "stroke-gray-400 group-hover:stroke-[#2D60FF]"} />
        <span className={`font-semibold text-[15px] ${isActive ? "font-bold" : ""}`}>{label}</span>
      </div>
    </Link>
  );
}