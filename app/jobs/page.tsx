"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        const jobsData = Array.isArray(data) ? data : [];
        setJobs(jobsData);
        if (jobsData.length > 0) setSelectedJob(jobsData[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-screen bg-black text-orange-500 flex items-center justify-center font-black italic animate-pulse">
      CONNECTING TO SYDNEY DATABASE...
    </div>
  );

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row overflow-hidden uppercase">
      
      {/* MAIN CONTENT AREA (Beech mein data) */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] order-2 md:order-1 overflow-y-auto custom-scrollbar">
        {selectedJob ? (
          <div className="p-6 md:p-12 animate-in fade-in duration-500">
            <div className="mb-10 border-b border-white/10 pb-6">
              <p className="text-orange-500 font-bold text-[10px] mb-1 tracking-widest">DETAILED VIEW</p>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                {selectedJob.clientName}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#111] p-6 border border-white/5">
                <p className="text-blue-500 font-black text-[10px] mb-4 tracking-widest">CONTACT INFO</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-600 text-[9px] block">JOB IDENTIFIER</label>
                    <p className="font-bold text-lg text-white">{selectedJob.jobId}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-[9px] block">CURRENT STATUS</label>
                    <p className="font-bold text-white italic">{selectedJob.status}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111] p-6 border border-white/5">
                <p className="text-green-500 font-black text-[10px] mb-4 tracking-widest">SITE LOCATION</p>
                <div>
                  <label className="text-gray-600 text-[9px] block">ADDRESS</label>
                  <p className="font-bold text-lg leading-tight">{selectedJob.siteAddress}</p>
                </div>
              </div>

              <div className="md:col-span-2 bg-white/5 p-4 italic text-gray-500 text-[9px] border border-dashed border-white/10">
                LATEST UPDATE: {new Date(selectedJob.updatedAt).toLocaleString()} | NODE: SYDNEY_GP3
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-20">
            <p className="italic font-black text-2xl tracking-tighter">SELECT A RECORD</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR (List) */}
      <div className="w-full md:w-80 border-l border-white/10 bg-[#111] flex flex-col order-1 md:order-2">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black">
          <h2 className="font-black italic text-sm tracking-widest">JOB_LIST</h2>
          <span className="text-[10px] bg-orange-500 text-black font-bold px-2 py-0.5">{jobs.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-black/50">
          {jobs.map((job) => (
            <div 
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`p-4 cursor-pointer transition-all border-l-4 ${
                selectedJob?.id === job.id 
                ? 'bg-blue-600/20 border-blue-600' 
                : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
            >
              <p className="font-black text-xs truncate">{job.clientName}</p>
              <p className="text-[9px] text-gray-600 truncate mt-1">{job.jobId} | {job.status}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => router.push('/jobs/add')}
          className="p-5 bg-blue-600 font-black text-xs hover:bg-blue-700 transition-all active:scale-95"
        >
          + INITIALIZE NEW RECORD
        </button>
      </div>

    </div>
  );
}