"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Menu = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>;
const Close = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>;

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any>([]), [sel, setSel] = useState<any>(null), [tab, setTab] = useState('QUOTE');
  const [side, setSide] = useState(false), [loading, setLoading] = useState(true);

  // AI State
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/jobs').then(res => res.json()).then(data => {
      setJobs(data); setSel(data[0]); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAIScan = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setAiLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/python", { method: "POST", body: formData });
      const data = await res.json();
      setAiResult(data.data);
    } catch (err) {
      alert("Python Server Error: Make sure api/index.py is running!");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="h-screen bg-black text-blue-500 flex items-center justify-center font-black animate-pulse italic">SYNCING...</div>;

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col uppercase font-sans text-[10px] font-bold overflow-hidden">
      
      <div className="h-10 flex items-center justify-end px-4 border-b border-white/5 bg-[#0d0d0d]">
        <button onClick={() => setSide(!side)} className="md:hidden text-blue-500 p-2 hover:bg-white/5 rounded"><Menu /></button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col bg-[#0d0d0d] overflow-hidden">
          
          {/* TABS - Added whitespace-nowrap to prevent wrapping */}
          <nav className="h-10 flex border-b border-white/10 bg-[#111] overflow-x-auto no-scrollbar whitespace-nowrap">
            {["ACTIONS", "BILLING", "COST & SELL", "QUOTE", "AI SCAN", "MEDIA", "EVENTS"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-6 h-full border-b-2 transition-all inline-block ${tab === t ? 'border-blue-600 text-blue-500 bg-blue-500/5' : 'border-transparent text-gray-500'}`}>{t}</button>
            ))}
          </nav>

          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <h2 className="text-3xl font-black italic mb-6 text-blue-500 tracking-tighter">{tab}</h2>
            
            {!sel ? (
              <div className="mt-20 text-center text-gray-700 italic border border-dashed border-white/5 p-10">SELECT_JOB_FROM_DATABASE</div>
            ) : (
              <div className="animate-in fade-in duration-500">

                {tab === "BILLING" && (
                  <div className="border-l-4 border-yellow-500 bg-white/5 p-8 shadow-xl">
                    <p className="text-yellow-500 text-[8px] mb-2 tracking-widest uppercase">Billing for {sel?.clientName}</p>
                    <div className="grid grid-cols-2 gap-10 font-mono mt-4">
                      <div>
                        <span className="text-gray-500 text-[7px] block mb-1">GST_REGISTRATION</span>
                        <p className="text-sm">{sel.gstNo || "NOT_ADDED"}</p> 
                      </div>
                      <div>
                        <span className="text-gray-500 text-[7px] block mb-1">TOTAL_INVOICE_VALUE</span>
                        <p className="text-sm text-green-500">₹ {sel.amount || "0.00"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "COST & SELL" && (
                  <div className="border-l-4 border-green-600 bg-white/5 p-8 shadow-xl">
                    <p className="text-green-500 text-[8px] mb-2 tracking-widest uppercase">Profit Analysis: {sel.clientName}</p>
                    <div className="flex gap-10 mt-4 font-mono">
                      <p><span className="text-gray-500 text-[7px] block mb-1">PURCHASE_COST</span>₹ {sel.costPrice || "0.00"}</p>
                      <p><span className="text-green-500 text-[7px] block mb-1">SELLING_PRICE</span>₹ {sel.salePrice || "0.00"}</p>
                    </div>
                  </div>
                )}

                {tab === "QUOTE" && (
                  <div className="border-l-4 border-blue-600 bg-white/5 p-8 mb-6 shadow-xl">
                    <p className="text-blue-500 text-[8px] mb-2 tracking-widest">CLIENT_IDENTITY</p>
                    <h1 className="text-5xl font-black italic mb-4 tracking-tighter">{sel.clientName}</h1>
                    <div className="flex gap-10 text-xs font-mono border-t border-white/5 pt-4">
                      <p><span className="text-gray-500 text-[7px] block mb-1">PHONE_REF</span>{sel.phone}</p>
                      <p><span className="text-gray-500 text-[7px] block mb-1">EMAIL_ENC</span><span className="text-blue-400 lowercase">{sel.email}</span></p>
                    </div>
                  </div>
                )}

                {/* DEEP LEARNING AI SCAN TAB */}
                {tab === "AI SCAN" && (
                  <div className="border-l-4 border-purple-600 bg-white/5 p-8 shadow-xl">
                    <p className="text-purple-500 text-[8px] mb-2 tracking-widest uppercase">Deep Learning Neural Engine</p>
                    <div className="mt-4 flex flex-col items-center border-2 border-dashed border-white/10 p-10 bg-black/40">
                      <input type="file" id="ai-scan" className="hidden" onChange={handleAIScan} />
                      <label htmlFor="ai-scan" className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-3 cursor-pointer transition-all active:scale-95">
                        {aiLoading ? "SCANNING_PATTERNS..." : "UPLOAD_FOR_AI_SCAN"}
                      </label>
                      {aiResult && (
                        <div className="mt-8 w-full grid grid-cols-2 gap-4 font-mono">
                          <div className="bg-black/60 p-4 border border-purple-500/20">
                            <span className="text-gray-500 text-[7px] block">PREDICTION</span>
                            <p className="text-sm text-purple-400">{aiResult.prediction}</p>
                          </div>
                          <div className="bg-black/60 p-4 border border-purple-500/20">
                            <span className="text-gray-500 text-[7px] block">CONFIDENCE</span>
                            <p className="text-sm text-green-500">{aiResult.confidence}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </main>

        <aside className={`fixed md:relative inset-y-0 right-0 w-72 bg-[#111] border-l border-white/10 flex flex-col transition-transform duration-300 ${side ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} z-50 shadow-2xl`}>
          <div className="p-4 border-b border-white/10 text-blue-500 flex justify-between items-center bg-black/40">
            JOB_DATABASE 
            <button onClick={() => setSide(false)} className="md:hidden hover:text-white transition-colors"><Close /></button>
          </div>

          <div className="p-2 border-b border-white/5 bg-black/20">
            <button onClick={() => router.push('/jobs/add')} className="w-full bg-blue-600 py-2.5 font-black hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20">
              + NEW JOB
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {jobs?.map((j: any) => (
              <div key={j.id} onClick={() => {setSel(j); setSide(false);}} className={`p-3 cursor-pointer border-l-2 transition-all ${sel?.id === j.id ? 'bg-blue-600/10 border-blue-600 text-white' : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                <p className="truncate leading-none text-[11px]">{j.clientName}</p>
                <p className="text-[7px] mt-1.5 opacity-50 font-mono tracking-tighter">{j.jobId}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}