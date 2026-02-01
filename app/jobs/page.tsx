"use client";
import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// UI Icons
const Menu = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>;
const Close = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>;
const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

function JobsInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- States ---
  const [projectList, setProjectList] = useState<any[]>([]); // 'jobs' changed to projectList
  const [activeJob, setActiveJob] = useState<any>(null);     // 'sel' changed to activeJob
  const [currentTab, setCurrentTab] = useState('QUOTE');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [stockCache, setStockCache] = useState<any[]>([]);

  const [scanState, setScanState] = useState({
    results: { prediction: "STABLE", confidence: "0%" },
    matches: [] as any[]
  });
  
  const [filterQuery, setFilterQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSubList, setActiveSubList] = useState<any>(null);

  // --- Optimized Data Fetching ---
  const syncSystemData = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Parallel fetching for speed
      const [jobsRes, invRes] = await Promise.all([
        fetch('/api/jobs').catch(() => null),
        fetch('/api/inventory').catch(() => null)
      ]);

      const jobsData = jobsRes?.ok ? await jobsRes.json() : [];
      const invData = invRes?.ok ? await invRes.json() : [];

      const cleanJobs = Array.isArray(jobsData) ? jobsData : [];
      const cleanInv = Array.isArray(invData) ? invData : [];

      setProjectList(cleanJobs);
      setStockCache(cleanInv);

      if (cleanJobs.length > 0 && !activeJob) {
        setActiveJob(cleanJobs[0]);
      }
    } catch (criticalError) {
      console.error("System Sync Failure:", criticalError);
    } finally {
      setIsSyncing(false);
      setIsInitialLoad(false);
    }
  }, [activeJob]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) setCurrentTab(tabFromUrl);
    syncSystemData();
  }, [searchParams, syncSystemData]);

  // --- High Performance Filtering (Handles 1000s of rows) ---
  const optimizedMatches = useMemo(() => {
    const base = scanState.matches.length > 0 ? scanState.matches : stockCache;
    if (!filterQuery) return base.slice(0, 100); // Limit initial view for speed

    const query = filterQuery.toLowerCase();
    return base.filter(item => 
      (item?.jobName || item?.name || "").toLowerCase().includes(query)
    ).slice(0, 200); // UI performance buffer
  }, [filterQuery, scanState.matches, stockCache]);

  if (isInitialLoad) return <div className="h-screen bg-black text-blue-500 flex items-center justify-center font-mono animate-pulse">BOOTING_SYSTEM_v2.0...</div>;

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col uppercase font-sans text-[10px] font-bold overflow-hidden">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-[#0d0d0d]">
        <span className="text-gray-600 font-mono tracking-widest text-[8px]">CORE_ACCESS_LOADED</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-blue-500 p-2"><Menu /></button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col bg-[#0d0d0d] overflow-hidden">
          {/* Navigation */}
          <nav className="h-10 flex border-b border-white/10 bg-[#111] overflow-x-auto no-scrollbar">
            {["ACTIONS", "BILLING", "COST & SELL", "QUOTE", "AI SCAN"].map(t => (
              <button 
                key={t} 
                onClick={() => setCurrentTab(t)} 
                className={`px-6 h-full border-b-2 transition-all ${currentTab === t ? 'border-blue-600 text-blue-400 bg-blue-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                {t}
              </button>
            ))}
          </nav>

          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-black italic text-blue-500 tracking-tighter opacity-80">{currentTab}</h2>
              <button onClick={() => router.push('/jobs/add')} className="px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded-sm flex items-center gap-3 transition-transform active:scale-95 shadow-xl shadow-blue-900/10">
                <span className="text-lg">+</span> REGISTER_NEW_ENTRY
              </button>
            </div>

            {/* Content Logic (Cost & Sell Section) */}
            {activeJob && currentTab === "COST & SELL" && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {!activeSubList ? (
                  <div className="grid gap-2">
                    {[
                      { key: 'hardboard', label: 'HARDBOARD_STOCK' },
                      { key: 'glue', label: 'ADHESIVE_GLUE' },
                      { key: 'scotia', label: 'SCOTIA_BEADING' },
                      { key: 'labourItem', label: 'LABOUR_ALLOCATION' }
                    ].map((item) => (
                      <div 
                        key={item.key} 
                        onClick={() => setActiveSubList({ title: item.label, value: activeJob[item.key] })}
                        className="bg-[#141414] p-5 border border-white/5 hover:border-blue-500/40 cursor-pointer flex justify-between group"
                      >
                        <span className="group-hover:text-blue-400 transition-colors">{item.label}</span>
                        <span className="text-gray-600 font-mono text-[8px]">REF: {activeJob?.jobId ?? '0000'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-right-5 duration-300">
                    <button onClick={() => setActiveSubList(null)} className="text-blue-500 mb-6 flex items-center gap-2 hover:underline">
                      &larr; BACK_TO_MANIFEST
                    </button>
                    <div className="bg-black/40 border border-white/10 p-6 rounded">
                       <h3 className="text-xl mb-4 text-blue-400 italic font-black">{activeSubList.title}</h3>
                       <div className="grid gap-2">
                         {String(activeSubList.value ?? "").split(',').filter(Boolean).map((val, idx) => (
                           <div key={idx} className="bg-white/5 p-3 border-l-2 border-blue-600 flex justify-between">
                             <span>{val.trim()}</span>
                             <span className="text-gray-700">ITEM_{idx + 1}</span>
                           </div>
                         ))}
                         {(!activeSubList.value) && <div className="p-10 text-center text-gray-800">NO_RECORDS_FOUND</div>}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Scan Section (Crash-Proofed for large data) */}
            {currentTab === "AI SCAN" && (
              <div className="space-y-6">
                <div className="bg-purple-950/10 border border-purple-500/20 p-6 flex flex-col items-center">
                  <div className="w-full flex gap-4 mb-6">
                    <div className="flex-1 bg-black/60 p-4 border border-white/10">
                      <p className="text-[7px] text-gray-500 mb-1 tracking-widest">LIVE_SEARCH_FILTER</p>
                      <input 
                        type="text" 
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="ENTER_ITEM_NAME..." 
                        className="bg-transparent w-full outline-none text-blue-400 placeholder:text-gray-800 uppercase"
                      />
                    </div>
                    <div className="w-1/3 bg-black/60 p-4 border border-white/10">
                       <p className="text-[7px] text-gray-500 mb-1">HEALTH_STATUS</p>
                       <p className="text-green-500">SYSTEM_OPTIMIZED</p>
                    </div>
                  </div>
                  
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
                    {optimizedMatches.map((item, i) => (
                      <div key={i} className="bg-white/5 p-3 border border-transparent hover:border-blue-500/30 transition-all flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-black border border-white/10 flex-shrink-0">
                          {item?.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-100" />}
                        </div>
                        <div className="truncate">
                          <p className="truncate text-gray-300">{item?.name || item?.jobName || "UNKNOWN_ITEM"}</p>
                          <p className="text-green-600 text-[8px] font-mono">STOCK: {item?.quantity ?? item?.price ?? '0'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quote Tab */}
          {/* Quote Tab - UPDATED VERSION */}
{activeJob && currentTab === "QUOTE" && (
  <div className="border-l-4 border-blue-600 bg-white/5 p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-500">
    <p className="text-blue-500 text-[8px] mb-2 tracking-[5px]">CLIENT_MASTER_RECORD</p>
    
    {/* Main Name */}
    <h1 className="text-5xl md:text-7xl font-black italic mb-2 tracking-tighter leading-none text-white">
      {activeJob?.clientName ?? "N/A"}
    </h1>

    {/* Address Section */}
    <div className="mb-8 pb-6 border-b border-white/10">
      <p className="text-blue-400/60 text-[7px] mb-2 tracking-widest">LOC_COORDINATES</p>
      <div className="text-lg md:text-xl font-bold italic text-gray-300">
        {activeJob?.siteAddress || "STREET_NOT_FOUND"}
      </div>
      <div className="text-[10px] text-gray-500 mt-1 uppercase">
        BILLING: {activeJob?.billingAddress || "SAME_AS_SITE"}
      </div>
    </div>

    {/* Contact Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-mono">
      {/* Phone Block */}
      <div className="space-y-4">
        <div>
          <span className="text-gray-600 block text-[7px] mb-1 tracking-widest">PRIMARY_PHONE</span>
          <span className="text-white text-sm">{activeJob?.phone ?? "---"}</span>
        </div>
        <div>
          <span className="text-gray-600 block text-[7px] mb-1 tracking-widest">SECONDARY_PHONE</span>
          <span className="text-white/60 text-xs">{activeJob?.phone2 ?? "---"}</span>
        </div>
      </div>

      {/* Email Block */}
      <div className="space-y-4">
        <div>
          <span className="text-gray-600 block text-[7px] mb-1 tracking-widest">PRIMARY_EMAIL</span>
          <span className="text-blue-400 lowercase text-sm">{activeJob?.email ?? "---"}</span>
        </div>
        <div>
          <span className="text-gray-600 block text-[7px] mb-1 tracking-widest">SECONDARY_EMAIL</span>
          <span className="text-blue-400/60 lowercase text-xs">{activeJob?.email2 ?? "---"}</span>
        </div>
      </div>
    </div>
  </div>
)}
          </div>
        </main>

        {/* Sidebar with Infinite Scroll feel */}
        <aside className={`fixed md:relative inset-y-0 right-0 w-72 bg-[#111] border-l border-white/10 flex flex-col transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center text-blue-500">
            <span>INDEX_REGISTRY</span>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden"><Close /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {projectList.length > 0 ? projectList.map((job) => (
              <div 
                key={job.id} 
                onClick={() => { setActiveJob(job); setIsSidebarOpen(false); }}
                className={`p-3 cursor-pointer border-l-2 transition-all ${activeJob?.id === job.id ? 'bg-blue-600/10 border-blue-500 text-white' : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
              >
                <p className="truncate text-[11px] font-black">{job.clientName}</p>
                <p className="text-[7px] mt-1 font-mono opacity-40">{job.jobId}</p>
              </div>
            )) : <div className="text-center p-10 text-gray-800">LOADING_DATABASE...</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black text-blue-500 flex items-center justify-center font-black animate-pulse">ESTABLISHING_ENCRYPTED_LINK...</div>}>
      <JobsInterface />
    </Suspense>
  );
}