export default function BankDashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F7FA] text-[#343C6A]">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col py-8 px-6">
        <div className="flex items-center gap-3 mb-10 px-4">
          <div className="w-9 h-9 bg-[#2D60FF] rounded-lg"></div>
          <h1 className="text-2xl font-black text-[#343C6A]">BankDash.</h1>
        </div>
        
        <nav className="space-y-2">
          <NavItem icon="🏠" label="Dashboard" active />
          <NavItem icon="🏟️" label="Lapangan" />
          <NavItem icon="👤" label="Users" />
          <NavItem icon="📅" label="Transactions" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-24 bg-white px-10 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="absolute left-4 top-3 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search for something" 
                className="bg-[#F5F7FA] py-3 pl-12 pr-6 rounded-full text-sm outline-none w-64 focus:ring-2 ring-blue-100" 
              />
            </div>
            <div className="w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center text-xl cursor-pointer">⚙️</div>
            <div className="w-14 h-14 bg-gray-200 rounded-full border-4 border-white shadow-sm overflow-hidden">
               <img src="https://i.pravatar.cc/150?u=admin" alt="profile" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-10">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: any) {
  return (
    <div className={`flex items-center gap-5 px-6 py-4 rounded-xl cursor-pointer transition-all ${
      active ? 'text-[#2D60FF]' : 'text-[#B1B1B1] hover:text-[#2D60FF]'
    }`}>
      <span className="text-2xl">{icon}</span>
      <span className="font-bold">{label}</span>
      {active && <div className="ml-auto w-1.5 h-8 bg-[#2D60FF] rounded-l-lg absolute left-0"></div>}
    </div>
  );
}