// File: app/login/page.tsx

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Loader2, Wallet } from 'lucide-react';
import Swal from 'sweetalert2'; 

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: 'Selamat datang kembali, Admin.',
          showConfirmButton: false,
          timer: 1500, 
          timerProgressBar: true,
        }).then(() => {
          router.push('/dashboard');
        });
      } else {
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: 'Username atau Password yang Anda masukkan salah.',
          confirmButtonColor: '#2D60FF',
          confirmButtonText: 'Coba Lagi'
        });
      }
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error Sistem',
        text: 'Terjadi kesalahan koneksi. Silakan cek internet Anda.',
      });
    }
  };

  return (
    <div className="min-h-dvh bg-[#F5F7FA] flex items-center justify-center p-4 font-sans">
      
      {/* Main Card Container */}
      <div className="bg-white rounded-2xl md:rounded-[30px] shadow-xl overflow-hidden w-full max-w-[1000px] flex flex-col md:flex-row md:min-h-[600px]">
        
        {/* --- BAGIAN KIRI: FORM LOGIN --- */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center relative">
          
          <div className="flex items-center gap-2 mb-2">
             <div className="text-[#2D60FF]">
               {/* PERBAIKAN DI SINI: Gunakan className untuk responsive size */}
               <Wallet className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
             </div>
             <h1 className="text-xl md:text-2xl font-extrabold text-[#343C6A]">Pro Futsal.</h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-[#343C6A] mb-2 mt-6 md:mt-8">Welcome Back</h2>
          <p className="text-gray-400 mb-6 md:mb-8 text-sm">Please enter your details to sign in.</p>

          <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
            
            <div className="space-y-1">
              <label className="text-[#343C6A] font-semibold text-sm ml-1">Username</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D60FF] transition-colors">
                  <User size={20} />
                </span>
                <input 
                  type="text" required
                  className="w-full py-3 md:py-4 pl-12 pr-4 bg-[#F5F7FA] rounded-xl border-2 border-transparent focus:border-[#2D60FF] focus:bg-white outline-none transition-all text-[#343C6A] font-medium placeholder-gray-400 text-base"
                  placeholder="masukan username"
                  value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[#343C6A] font-semibold text-sm ml-1">Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D60FF] transition-colors">
                  <Lock size={20} />
                </span>
                <input 
                  type="password" required
                  className="w-full py-3 md:py-4 pl-12 pr-4 bg-[#F5F7FA] rounded-xl border-2 border-transparent focus:border-[#2D60FF] focus:bg-white outline-none transition-all text-[#343C6A] font-medium placeholder-gray-400 text-base"
                  placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-[#2D60FF] hover:bg-blue-700 text-white py-3 md:py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Login Now"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            &copy; 2024 BankDash Futsal System
          </p>
        </div>

        {/* --- BAGIAN KANAN: VISUAL (HIDDEN DI HP) --- */}
        <div className="hidden md:flex w-1/2 bg-[#2D60FF] relative items-center justify-center p-10 overflow-hidden">
            
            <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[30px] shadow-2xl max-w-[320px]">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden relative bg-gray-200">
                    <img 
                      src="/futsal.png" 
                      alt="Futsal Visual" 
                      className="w-full h-full object-cover"
                    />
                </div>
                
                <div className="absolute -left-8 top-10 bg-white p-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce-slow">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        ⚡
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold">SYSTEM STATUS</p>
                        <p className="text-xs font-bold text-green-600">Online</p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-0 w-full text-center px-8 z-20">
                <p className="text-white/80 text-sm font-medium">Manage your futsal business efficiently.</p>
            </div>
        </div>

      </div>
    </div>
  );
}