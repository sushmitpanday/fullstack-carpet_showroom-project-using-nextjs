"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JobCreationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', street: '', town: '', phone: '', email: '',
    // Naye fields jo baaki tabs ke liye hain
    gstNo: '', billingAmount: '', cost: '', sell: ''
  });

  const handleSave = async () => {
    if(!formData.name) return alert("Name is required");
    setLoading(true);
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: Math.floor(10000 + Math.random() * 90000).toString(),
          clientName: formData.name,
          siteAddress: `${formData.street}, ${formData.town}, VIC`,
          phone: formData.phone,
          email: formData.email,
          // Ye data database mein jayega aur tabs mein dikhega
          gstNo: formData.gstNo,
          amount: formData.billingAmount,
          cost: formData.cost,
          sell: formData.sell
        }),
      });

      if (response.ok) router.push('/jobs'); 
      else alert("Error saving to database");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-10 uppercase text-[10px] font-bold">
      <div className="max-w-2xl mx-auto border border-white/10 bg-[#111] p-8 shadow-2xl">
        <h1 className="text-blue-500 font-black mb-10 text-xl italic tracking-tighter italic border-b border-white/5 pb-4 text-center">
          SYSTEM_JOB_INITIALIZATION
        </h1>

        <div className="space-y-8">
          {/* SECTION 1: QUOTE TAB DATA */}
          <div>
            <p className="text-blue-500 text-[8px] mb-3 tracking-widest">01_CLIENT_IDENTITY (QUOTE_TAB)</p>
            <div className="grid grid-cols-1 gap-3">
              <input type="text" placeholder="CLIENT NAME" className="w-full bg-black border border-white/10 p-3 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="STREET ADDRESS" className="w-full bg-black border border-white/10 p-3 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, street: e.target.value})} />
                <input type="text" placeholder="TOWN" className="w-full bg-black border border-white/10 p-3 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, town: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="PHONE" className="w-full bg-black border border-white/10 p-3 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, phone: e.target.value})} />
                <input type="email" placeholder="EMAIL" className="w-full bg-black border border-white/10 p-3 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          </div>

          {/* SECTION 2: BILLING TAB DATA */}
          <div>
            <p className="text-yellow-500 text-[8px] mb-3 tracking-widest">02_FINANCIAL_RECORD (BILLING_TAB)</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="GST NUMBER" className="w-full bg-black border border-white/10 p-3 outline-none focus:border-yellow-500" onChange={(e)=>setFormData({...formData, gstNo: e.target.value})} />
              <input type="number" placeholder="TOTAL BILLING AMOUNT" className="w-full bg-black border border-white/10 p-3 outline-none focus:border-yellow-500" onChange={(e)=>setFormData({...formData, billingAmount: e.target.value})} />
            </div>
          </div>

          {/* SECTION 3: COST & SELL TAB DATA */}
          <div>
            <p className="text-green-500 text-[8px] mb-3 tracking-widest">03_PROFIT_ANALYSIS (COST_SELL_TAB)</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="PURCHASE COST" className="w-full bg-black border border-white/10 p-3 outline-none focus:border-green-500 text-red-400" onChange={(e)=>setFormData({...formData, cost: e.target.value})} />
              <input type="number" placeholder="EXPECTED SELL PRICE" className="w-full bg-black border border-white/10 p-3 outline-none focus:border-green-500 text-green-400" onChange={(e)=>setFormData({...formData, sell: e.target.value})} />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-6 border-t border-white/5">
            <button onClick={() => router.back()} className="flex-1 bg-white/5 p-4 font-black hover:bg-white/10 transition-all">CANCEL</button>
            <button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-600 text-white font-black p-4 disabled:opacity-50 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
              {loading ? 'INITIALIZING...' : 'CONFIRM & SYNC'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}