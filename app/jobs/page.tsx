"use client";
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const Menu = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>;
const Close = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>;

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

function JobsInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
 const [jobs, setJobs] = useState<any[]>([]);// Default to empty array
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState('QUOTE');
  const [side, setSide] = useState(false);
  const [loading, setLoading] = useState(true);

  const [aiResult, setAiResult] = useState({
    data: { prediction: "", confidence: "" },
    similar: []
  });
  const [searchKeyword, setSearchKeyword] = useState(""); 
  const [aiLoading, setAiLoading] = useState(false);
  const [activeSubList, setActiveSubList] = useState(null);
  const [cachedInventory, setCachedInventory] = useState([]);

  useEffect(() => {
    const activeTab = searchParams.get('tab');
    if (activeTab) setTab(activeTab);

    // FIXED: Added error handling and array validation
    fetch('/api/jobs')
      .then(res => res.ok ? res.json() : []) 
      .then(data => {
        const jobsArray = Array.isArray(data) ? data : [];
        setJobs(jobsArray); 
        setSel(jobsArray[0] || null); 
        setLoading(false);
      })
      .catch(() => {
        setJobs([]);
        setLoading(false);
      });

    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setCachedInventory(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Pre-fetch failed", err));
  }, [searchParams]);

  const filteredMatches = useMemo(() => {
    let baseList = [];
    if (aiResult.similar && aiResult.similar.length > 0) {
        baseList = aiResult.similar;
    } else {
        baseList = cachedInventory.map((item) => ({
            name: item.jobName || item.name,
            price: item.quantity || item.price,
            imageUrl: item.imageUrl,
            match: "STOCK"
        }));
    }
    if (!searchKeyword) return baseList;
    return baseList.filter((item) => 
      item.name?.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [searchKeyword, aiResult.similar, cachedInventory]);

  const handleAIScan = async () => {
    setAiLoading(true);
    try {
      const invData = cachedInventory.length > 0 ? cachedInventory : await (await fetch('/api/inventory')).json();
      if (!invData || invData.length === 0) {
        alert("DATABASE_EMPTY");
        setAiLoading(false);
        return;
      }
      const res = await fetch("/api/python", { 
        method: "POST", 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: invData }) 
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "BACKEND_ERROR");
      setAiResult({
        data: {
          prediction: responseData.prediction || "MATCH_FOUND",
          confidence: responseData.confidence || "99%",
        },
        similar: responseData.similar || []
      });
    } catch (err) {
      alert(`AI_ERROR: ${err.message}`);
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
        <main className="flex-1 flex flex-col bg-[#0d0d0d] overflow-hidden relative">
          <nav className="h-10 flex border-b border-white/10 bg-[#111] overflow-x-auto no-scrollbar whitespace-nowrap">
            {["ACTIONS", "BILLING", "COST & SELL", "QUOTE", "AI SCAN", "MEDIA", "EVENTS"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-6 h-full border-b-2 transition-all inline-block ${tab === t ? 'border-blue-600 text-blue-500 bg-blue-500/5' : 'border-transparent text-gray-500'}`}>{t}</button>
            ))}
          </nav>

          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black italic text-blue-500 tracking-tighter">{tab}</h2>
              <button onClick={() => router.push('/jobs/add')} className="px-6 py-2 bg-blue-600 text-[10px] font-black hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20 rounded-sm border border-blue-400/30 flex items-center gap-2 tracking-widest">
                <span className="text-lg leading-none">+</span> NEW_JOB
              </button>
            </div>

            {sel && tab === "COST & SELL" && (
              <div className="space-y-4">
                {(() => {
                  const dynamicItems = [
                    { title: "Hardboard", value: sel.hardboard, type: "M" },
                    { title: "Glue", value: sel.glue, type: "M" },
                    { title: "Scotia", value: sel.scotia, type: "L" },
                    { title: "Disposal", value: sel.disposal, type: "O" },
                    { title: "Labour", value: sel.labourItem, type: "H" }
                  ];

                  return !activeSubList ? (
                    <div className="grid gap-2 animate-in fade-in duration-300">
                      <div className="border-l-4 border-green-500 bg-green-500/5 p-6 mb-2 flex justify-between items-end">
                        <div>
                          <p className="text-green-500 text-[8px] mb-1 tracking-widest uppercase font-black">Linked_Job_Data</p>
                          <h1 className="text-2xl font-black italic tracking-tighter text-green-400">COST_&_SELL_ITEMS</h1>
                        </div>
                        <p className="text-[8px] text-gray-600 font-mono">STATUS: SYNCED_OK</p>
                      </div>
                      {dynamicItems.map((cat, i) => (
                        <div key={i} onClick={() => setActiveSubList(cat)} className="bg-[#111] p-4 border border-white/5 hover:border-blue-500/50 cursor-pointer flex justify-between items-center group transition-all">
                          <div className="flex flex-col">
                            <span className="text-[11px] group-hover:text-blue-400 tracking-widest">{cat.title.toUpperCase()}</span>
                            <span className="text-[9px] text-gray-500 font-mono mt-1 italic">{cat.value ? `SAVED: ${cat.value}` : "EMPTY_FIELD"}</span>
                          </div>
                          <span className="text-blue-500 font-mono text-[9px] border border-blue-500/20 px-2 py-1 group-hover:bg-blue-600 group-hover:text-white transition-all">VIEW_DETAILS</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                      <button onClick={() => setActiveSubList(null)} className="mb-4 text-blue-500 flex items-center gap-2 text-[9px] font-black hover:text-white transition-colors">&larr; RETURN_TO_LIST</button>
                      <div className="bg-blue-600/10 p-5 border-l-4 border-blue-600 mb-6">
                        <p className="text-[8px] text-blue-400 mb-1 tracking-[3px]">DATA_POINT</p>
                        <h3 className="text-2xl font-black italic">{activeSubList.title.toUpperCase()}</h3>
                      </div>
                      <div className="bg-black/40 border border-white/5 p-10 flex flex-col items-center justify-center space-y-6">
                        <p className="text-gray-600 text-[10px] tracking-widest uppercase">Information found in Database:</p>
                        <div className="text-2xl text-white font-mono bg-white/5 px-8 py-4 border-b-2 border-blue-500 w-full text-center">{activeSubList.value || "--- DATA NOT PROVIDED ---"}</div>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm pt-4">
                           <button className="bg-white/5 border border-white/10 p-3 text-[8px] hover:bg-white/10">EDIT_ENTRY</button>
                           <button className="bg-blue-600 p-3 text-[8px] font-black hover:bg-blue-500">SYNC_TO_QUOTE</button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            {sel && tab === "AI SCAN" && (
              <div className="border-l-4 border-purple-600 bg-white/5 p-8 shadow-xl relative">
                <p className="text-purple-500 text-[8px] mb-2 tracking-widest uppercase flex items-center gap-2"><SearchIcon className="w-3 h-3" />Neural Pattern Analysis</p>
                <div className="mt-4 flex flex-col items-center border-2 border-dashed border-white/10 p-10 bg-black/40">
                  <button onClick={handleAIScan} className="group bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 cursor-pointer transition-all active:scale-95 flex items-center gap-3 mb-8">
                    {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <SearchIcon className="w-4 h-4" />}
                    <span className="tracking-widest uppercase">{aiLoading ? "SCANNING_STOCK..." : "ACTIVATE_DATABASE_SCAN"}</span>
                  </button>
                  <div className="w-full">
                    <div className="grid grid-cols-2 gap-4 font-mono mb-8">
                      <div className="bg-black/60 p-4 border border-purple-500/20 focus-within:border-purple-500 transition-all">
                        <span className="text-gray-500 text-[7px] block mb-1">SEARCH_BY_NAME</span>
                        <input type="text" placeholder="TYPE TO FILTER" className="bg-transparent border-none outline-none text-sm text-purple-400 w-full uppercase placeholder:text-gray-800" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                      </div>
                      <div className="bg-black/60 p-4 border border-purple-500/20">
                        <span className="text-gray-500 text-[7px] block mb-1">SCAN_CONFIDENCE</span>
                        <p className="text-sm text-green-500">{aiResult.data.confidence || "READY"}</p>
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-6">
                      <p className="text-blue-500 text-[8px] mb-4 tracking-[4px] uppercase flex justify-between">
                        <span>DATABASE_MATCHES</span>
                        <span>{filteredMatches.length} ITEMS FOUND</span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar">
                        {filteredMatches.length > 0 ? (
                          filteredMatches.map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 p-4 flex justify-between items-center hover:border-blue-500/50 transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-black border border-white/10 overflow-hidden">
                                  {item.imageUrl ? <img src={item.imageUrl} alt="stock" className="w-full h-full object-cover opacity-60 group-hover:opacity-100" /> : <div className="w-full h-full bg-white/5" />}
                                </div>
                                <div>
                                  <p className="text-[11px] text-gray-300 group-hover:text-white uppercase italic">{item.name}</p>
                                  <p className="text-green-500 text-[9px] mt-1 font-mono tracking-widest">STOCK: {item.price}</p>
                                </div>
                              </div>
                              <div className="text-right"><span className="text-[10px] text-blue-500 font-bold bg-blue-500/10 px-2 py-1">{item.match}</span></div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-10 text-gray-700 italic border border-dashed border-white/5">NO_RESULTS_FOUND</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sel && tab === "QUOTE" && (
                <div className="border-l-4 border-blue-600 bg-white/5 p-8 mb-6 shadow-xl">
                    <p className="text-blue-500 text-[8px] mb-2 tracking-widest">CLIENT_IDENTITY</p>
                    <h1 className="text-5xl font-black italic mb-4 tracking-tighter">{sel.clientName}</h1>
                    <div className="flex gap-10 text-xs font-mono border-t border-white/5 pt-4">
                        <p><span className="text-gray-500 text-[7px] block mb-1">PHONE_REF</span>{sel.phone}</p>
                        <p><span className="text-gray-500 text-[7px] block mb-1">EMAIL_ENC</span><span className="text-blue-400 lowercase">{sel.email}</span></p>
                    </div>
                </div>
            )}
          </div>
        </main>

        <aside className={`fixed md:relative inset-y-0 right-0 w-72 bg-[#111] border-l border-white/10 flex flex-col transition-transform duration-300 ${side ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} z-50 shadow-2xl`}>
          <div className="p-4 border-b border-white/10 text-blue-500 flex justify-between items-center bg-black/40">JOB_DATABASE<button onClick={() => setSide(false)} className="md:hidden hover:text-white"><Close /></button></div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {/* FIXED: Using Array.isArray for safety */}
            {Array.isArray(jobs) && jobs.map((j) => (
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

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black text-blue-500 flex items-center justify-center font-black">SYNCING_SYSTEM...</div>}>
      <JobsInterface />
    </Suspense>
  );
}