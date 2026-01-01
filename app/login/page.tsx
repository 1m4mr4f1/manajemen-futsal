'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      alert("Username atau Password salah!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm w-full max-w-[500px] border border-gray-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-[#2D60FF] rounded-xl mb-4 flex items-center justify-center text-white font-bold text-xl">FP</div>
          <h1 className="text-[28px] font-black text-[#343C6A]">BankDash Login</h1>
          <p className="text-[#718EBF] mt-2">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[#343C6A] font-medium ml-1">Username</label>
            <input 
              type="text" required
              className="w-full p-4 bg-white border border-[#E6EFF5] rounded-[15px] focus:ring-2 focus:ring-[#2D60FF] outline-none transition-all placeholder:text-[#888EA8]"
              placeholder="admin1"
              value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[#343C6A] font-medium ml-1">Password</label>
            <input 
              type="password" required
              className="w-full p-4 bg-white border border-[#E6EFF5] rounded-[15px] focus:ring-2 focus:ring-[#2D60FF] outline-none transition-all placeholder:text-[#888EA8]"
              placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#2D60FF] text-white py-4 rounded-[15px] font-bold text-lg shadow-lg shadow-blue-100 hover:bg-[#1a4fdf] transition-all disabled:bg-gray-400"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}