"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JobCreationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', street: '', town: '', phone: '', email: ''
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
          email: formData.email
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
    <div className="min-h-screen bg-[#1a1a1a] text-gray-300 p-10 uppercase text-[11px]">
      <div className="max-w-2xl mx-auto border border-gray-700 bg-[#222] p-8">
        <h1 className="text-blue-500 font-bold mb-6 text-lg text-center">CREATE NEW JOB RECORD</h1>
        <div className="space-y-4">
          <input type="text" placeholder="CLIENT NAME" className="w-full bg-black border border-gray-700 p-3" onChange={(e)=>setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="STREET ADDRESS" className="w-full bg-black border border-gray-700 p-3" onChange={(e)=>setFormData({...formData, street: e.target.value})} />
          <input type="text" placeholder="TOWN" className="w-full bg-black border border-gray-700 p-3" onChange={(e)=>setFormData({...formData, town: e.target.value})} />
          <input type="text" placeholder="PHONE" className="w-full bg-black border border-gray-700 p-3" onChange={(e)=>setFormData({...formData, phone: e.target.value})} />
          <input type="email" placeholder="EMAIL" className="w-full bg-black border border-gray-700 p-3" onChange={(e)=>setFormData({...formData, email: e.target.value})} />
          
          <div className="flex gap-4 pt-6">
            <button onClick={() => router.back()} className="flex-1 bg-gray-800 p-3 font-bold">CANCEL</button>
            <button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-700 text-white font-black p-3 disabled:opacity-50">
              {loading ? 'SYNCING...' : 'CONFIRM & CREATE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}