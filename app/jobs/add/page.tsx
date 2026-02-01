"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JobCreationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]); 
  const [selectedName, setSelectedName] = useState(""); 

  const emptyForm = {
    name: '', street: '', town: '',billingAddress:'', phone: '', email: '',phone2:'',email2:'',
    gstNo: '', billingAmount: '', cost: '', sell: '',
    quoteDate: '', initiatedDate: '', completedDate: '',
    salesRep: '', jobCategory: 'Real Estate', shop: 'Hallam',
    // Carpet Inputs
    carpetName: '', carpetColor: '', rawQuantity: '', 
    unitCost: '', unitSell: '', underlayCost: '', laborCost: '',

    // --- YE LINE ADD KAREIN ---
    jobCategory: 'Real Estate',
    jobSource: '',
    terms: '',

    //costitems
    hardboard: '', glue: '',scotia: '',disposal: '', labourItem: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  // --- Auto Calculations ---
  const qty = parseFloat(formData.rawQuantity) || 0;
  const totalQtyWithWastage = qty > 0 ? (qty * 1.10).toFixed(2) : "0.00";
  const uCost = parseFloat(formData.unitCost) || 0;
  const uSell = parseFloat(formData.unitSell) || 0;
  const uLay = parseFloat(formData.underlayCost) || 0;
  const labor = parseFloat(formData.laborCost) || 0;

  const totalCostPrice = (uCost * parseFloat(totalQtyWithWastage)) + uLay + labor;
  const totalSaleNoGST = (uSell * parseFloat(totalQtyWithWastage));
  const gstAmount = totalSaleNoGST * 0.10;
  const finalGrandTotal = totalSaleNoGST + gstAmount;
  const estimatedProfit = finalGrandTotal - totalCostPrice;

  useEffect(() => {
    fetch('/api/jobs').then(res => res.json()).then(data => setSources(data));
  }, []);

  const handleCopyNow = () => {
    if (!selectedName) return alert("Pehle list se ek naam select karein!");
    const sourceData = sources.find(s => s.clientName === selectedName);
    if (sourceData) {
      setFormData({
        ...formData,
        name: sourceData.clientName || '',
        phone: sourceData.phone || '',
        email: sourceData.email || '',
        phone2: sourceData.phone2 || '',
        email2: sourceData.email2 || '',
        billingAddress: sourceData.billingAddress || '',
        street: sourceData.siteAddress?.split(',')[0] || '',
        town: sourceData.siteAddress?.split(',')[1]?.trim() || '',
      });
    }
  };

  const handleClearForm = () => {
    if(confirm("Kya aap saara data clear karna chahte hain?")) {
      setFormData(emptyForm);
      setSelectedName("");
    }
  };

const handleSave = async () => {
    if(!formData.name) return alert("Name is required");
    setLoading(true);
    
    // Prisma requires siteAddress as a single string
    const fullAddress = `${formData.street}, ${formData.town}`.trim();

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clientName: formData.name, 
          siteAddress: fullAddress || "Not Provided", 
          jobId: Math.floor(10000 + Math.random() * 90000).toString(),
          amount: finalGrandTotal.toFixed(2), 
          calculatedProfit: estimatedProfit.toFixed(2),
          wastageQuantity: totalQtyWithWastage,
          // --- YE TEEN (3) DATES YAHAN ADD KAREIN ---
          quoteDate: formData.quoteDate,
          initiatedDate: formData.initiatedDate,
          completedDate: formData.completedDate,

          // --- YE NAYI FIELDS YAHAN ADD HO GAYI ---
          jobCategory: formData.jobCategory,
          jobSource: formData.jobSource,
          terms: formData.terms,
          // --- YE PANCH (5) FIELDS ADD KIYE HAIN ---
          hardboard: formData.hardboard,
          glue: formData.glue,
          scotia: formData.scotia,
          disposal: formData.disposal,
          labourItem: formData.labourItem 
        }),
      });

      if (response.ok) {
        router.push('/jobs');
        router.refresh();
      } else {
        const err = await response.json();
        alert("Error: " + (err.error || "Failed to save"));
      }
    } catch (error) { 
      console.error(error); 
      alert("Network Error");
    } finally { 
      setLoading(false); 
    }
  };

 



  return (
    
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-4 md:p-6 uppercase text-[10px] font-bold italic">
      <div className="max-w-6xl mx-auto border border-white/10 bg-[#111] p-6 shadow-2xl">
        <div className="mb-6 flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-blue-500 tracking-widest text-lg">JOB_CREATION_MODULE</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6 lg:border-r lg:border-white/5 lg:pr-10">
            {/* SOURCE SELECT */}
            <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-sm mb-6">
              <p className="text-blue-500 mb-2 text-[8px]">SELECT SOURCE</p>
              <div className="flex w-full gap-0 border border-white/20"> 
                <select className="w-[75%] bg-black p-3 text-blue-400 outline-none border-r border-white/20" value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
                  <option value="">-- SEARCH CLIENT --</option>
                  {sources.map(s => <option key={s.id} value={s.clientName}>{s.clientName}</option>)}
                </select>
                <div className="w-[25%] flex flex-col">
                  <button onClick={handleClearForm} className="h-1/2 bg-red-900/40 text-red-500 text-[7px] border-b border-white/10 hover:bg-red-600 hover:text-white transition-all">RESET🗑️</button>
                  <button onClick={handleCopyNow} className="h-1/2 bg-blue-600 text-white text-[9px] font-black hover:bg-blue-500">COPY⚡</button>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <p className="text-blue-500 text-[8px] tracking-widest underline">01_SITE_DETAILS</p>
              <input type="text" placeholder="CLIENT NAME" value={formData.name} className="w-full bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="STREET" value={formData.street} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, street: e.target.value})} />
                <input type="text" placeholder="TOWN" value={formData.town} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, town: e.target.value})} />
                  <input type="text" placeholder="BILLING-ADDRESS" value={formData.billingAddress} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, billingAddress: e.target.value})} />
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-blue-500 text-[8px] tracking-widest underline">02_CONTACT_INFO</p>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="PHONE" value={formData.phone} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, phone: e.target.value})} />
                <input type="email" placeholder="EMAIL" value={formData.email} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, email: e.target.value})} />
                <input type="text" placeholder="PHONE2" value={formData.phone2} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, phone2: e.target.value})} />
                <input type="email" placeholder="EMAIL2" value={formData.email2} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, email2: e.target.value})} />
              </div>
            </section>

         
          </div>
            {/* 04_COST_AND_SELL_ITEMS */}
<section className="space-y-4 pt-4 border-t border-white/5">
  <p className="text-purple-500 text-[8px] tracking-widest underline">04_COST_AND_SELL_ITEMS</p>
  <div className="grid grid-cols-2 gap-4">
    <input type="text" placeholder="HARDBOARD" value={formData.hardboard} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, hardboard: e.target.value})} />
    <input type="text" placeholder="GLUE" value={formData.glue} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, glue: e.target.value})} />
  </div>
  <div className="grid grid-cols-2 gap-4">
    <input type="text" placeholder="SCOTIA" value={formData.scotia} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, scotia: e.target.value})} />
    <input type="text" placeholder="LABOUR" value={formData.labourItem} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, labourItem: e.target.value})} />
  </div>
  <input type="text" placeholder="DISPOSAL" value={formData.disposal} className="w-full bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, disposal: e.target.value})} />
</section>

{/* TIMELINE SECTION */}
<div className="grid grid-cols-1 gap-4">
  {/* Quote Date */}
  <div className="flex flex-col gap-1">
    <label className="text-gray-600 text-[7px]">QUOTE_DATE</label>
    <input 
      type="date" 
      style={{ colorScheme: 'dark' }} 
      className="w-full bg-black border border-white/10 p-3 text-blue-400 outline-none" 
      value={formData.quoteDate} 
      onChange={(e)=>setFormData({...formData, quoteDate: e.target.value})} 
    />
  </div>

  {/* Initiated Date */}
  <div className="flex flex-col gap-1">
    <label className="text-gray-600 text-[7px]">INITIATED_DATE</label>
    <input 
      type="date" 
      style={{ colorScheme: 'dark' }}
      className="w-full bg-black border border-white/10 p-3 text-yellow-500 outline-none" 
      value={formData.initiatedDate} 
      onChange={(e)=>setFormData({...formData, initiatedDate: e.target.value})} 
    />
  </div>

  {/* Completed Date */}
  <div className="flex flex-col gap-1">
    <label className="text-gray-600 text-[7px]">COMPLETED_DATE</label>
    <input 
      type="date" 
      style={{ colorScheme: 'dark' }}
      className="w-full bg-black border border-white/10 p-3 text-green-500 outline-none" 
      value={formData.completedDate} 
      onChange={(e)=>setFormData({...formData, completedDate: e.target.value})} 
    />
  </div>
</div>

<div className="flex flex-col gap-1">
  {/* Label Image jaisa Red color mein */}
  <label className="text-red-500 text-[8px] font-bold uppercase tracking-widest">
    Job Category
  </label>
  
  <select 
    className="w-full bg-[#1a1a1a] border border-white/20 p-3 text-gray-300 outline-none cursor-pointer focus:border-blue-500 transition-all"
    value={formData.jobCategory}
    onChange={(e) => setFormData({...formData, jobCategory: e.target.value})}
  >
    <option value="Builders">BUILDERS</option>
    <option value="Insurance">INSURANCE</option>
    <option value="Quick Sell">QUICK SELL</option>
    <option value="Real Estate">REAL ESTATE</option>
    <option value="Retail">RETAIL</option>
    <option value="Ship & Bill">SHIP & BILL</option>
    <option value="Supply Only">SUPPLY ONLY</option>
    <option value="Wholesale">WHOLESALE</option>
  </select>
</div>

<div className="grid grid-cols-1 gap-4 bg-white/5 p-4 border border-white/10 mt-4">
  
  {/* JOB SOURCE DROPDOWN */}
  <div className="flex flex-col gap-1">
    <label className="text-red-500 text-[8px] font-bold tracking-widest uppercase italic">
      Job Source
    </label>
    <select 
      className="w-full bg-black border border-white/20 p-3 text-gray-300 outline-none focus:border-blue-500"
      value={formData.jobSource}
      onChange={(e) => setFormData({...formData, jobSource: e.target.value})}
    >
      <option value="">-- SELECT SOURCE --</option>
      <option value="Facebook">FACEBOOK</option>
      <option value="Footy club">FOOTY CLUB</option>
      <option value="Grey Army">GREY ARMY</option>
      <option value="HiPages">HIPAGES</option>
      <option value="Insurance">INSURANCE</option>
      <option value="Local">LOCAL</option>
      <option value="Phone">PHONE</option>
      <option value="Refered">REFERED</option>
      <option value="Repeat">REPEAT</option>
      <option value="Walk In">WALK IN</option>
      <option value="Website">WEBSITE</option>
    </select>
  </div>

  {/* TERMS DROPDOWN */}
  <div className="flex flex-col gap-1">
    <label className="text-red-500 text-[8px] font-bold tracking-widest uppercase italic">
      Terms
    </label>
    <select 
      className="w-full bg-black border border-white/20 p-3 text-gray-300 outline-none focus:border-blue-500"
      value={formData.terms}
      onChange={(e) => setFormData({...formData, terms: e.target.value})}
    >
      <option value="">-- SELECT TERMS --</option>
      <option value="30 Days, P/O">30 DAYS, P/O</option>
      <option value="30 Days, Sign">30 DAYS, SIGN</option>
      <option value="30% Deposit, Bal COD">30% DEPOSIT, BAL COD</option>
      <option value="C.O.D.">C.O.D.</option>
      <option value="C.O.D., Sign">C.O.D., SIGN</option>
      <option value="Cash Sale, S/O">CASH SALE, S/O</option>
      <option value="Finance">FINANCE</option>
    </select>
  </div>

</div>
          <div className="space-y-4 bg-white/5 p-6 border border-white/10 rounded-sm">
            <div className="space-y-4">
           
         
              
                <select className="w-full bg-black border border-white/10 p-4 text-green-400 outline-none" value={formData.salesRep} onChange={(e) => setFormData({...formData, salesRep: e.target.value})}>
                  <option value="">-- SELECT SALES REP --</option>
                  <option value="John Doe">JOHN DOE</option>
                  <option value="Jane Smith">JANE SMITH</option>
                   <option value="John Doe">SAMAI</option>
                  <option value="Jane Smith">BRON</option>
                </select>
            
            </div>
            <div className="pt-2">
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white p-5 font-black text-xs tracking-[4px] disabled:bg-gray-700">
                   {loading ? 'PROCESSING...' : 'INITIALIZE_JOB_RECORD'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}