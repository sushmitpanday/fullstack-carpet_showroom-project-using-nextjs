"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JobCreationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]); 
  const [selectedName, setSelectedName] = useState(""); 

  const emptyForm = {
    name: '', street: '', town: '', phone: '', email: '',
    gstNo: '', billingAmount: '', cost: '', sell: '',
    quoteDate: '', initiatedDate: '', completedDate: '',
    salesRep: '', jobCategory: 'Real Estate', shop: 'Hallam',
    // Carpet Inputs
    carpetName: '', carpetColor: '', rawQuantity: '', 
    unitCost: '', unitSell: '', underlayCost: '', laborCost: '',

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
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-blue-500 text-[8px] tracking-widest underline">02_CONTACT_INFO</p>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="PHONE" value={formData.phone} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, phone: e.target.value})} />
                <input type="email" placeholder="EMAIL" value={formData.email} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, email: e.target.value})} />
              </div>
            </section>

            {/* NEW CARPET INPUTS */}
            <section className="space-y-4 pt-4 border-t border-white/5">
                <p className="text-yellow-500 text-[8px] tracking-widest underline">03_CARPET_SPECIFICATIONS</p>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="CARPET NAME (BRAND/TYPE)" value={formData.carpetName} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, carpetName: e.target.value})} />
                    <input type="text" placeholder="COLOR (SHADE/CODE)" value={formData.carpetColor} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, carpetColor: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <input type="number" placeholder="NET QTY (M2)" value={formData.rawQuantity} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, rawQuantity: e.target.value})} />
                    <div className="bg-white/5 p-3 border border-white/10 text-blue-500 text-center flex items-center justify-center text-[8px]">{totalQtyWithWastage} M2 (+10%)</div>
                    <div className="bg-black border border-white/10 p-3 text-center opacity-50">GST 10%</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="UNIT COST PRICE ($)" value={formData.unitCost} className="bg-black border border-white/10 p-3 outline-none border-l-2 border-l-red-500" onChange={(e)=>setFormData({...formData, unitCost: e.target.value})} />
                    <input type="number" placeholder="UNIT SALE PRICE ($)" value={formData.unitSell} className="bg-black border border-white/10 p-3 outline-none border-l-2 border-l-green-500" onChange={(e)=>setFormData({...formData, unitSell: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="UNDERLAY COST ($)" value={formData.underlayCost} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, underlayCost: e.target.value})} />
                    <input type="number" placeholder="LABOR/INSTALL ($)" value={formData.laborCost} className="bg-black border border-white/10 p-3 outline-none" onChange={(e)=>setFormData({...formData, laborCost: e.target.value})} />
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

          <div className="space-y-8 bg-white/5 p-6 border border-white/10 rounded-sm">
            <div className="space-y-4">
              <p className="text-blue-400 text-[9px] border-b border-blue-500/30 pb-2">TIMELINE_&_ASSIGNMENT</p>
              <div className="grid grid-cols-1 gap-4">
                <input type="date" value={formData.quoteDate} className="bg-black border border-white/10 p-3 text-blue-400 outline-none" onChange={(e)=>setFormData({...formData, quoteDate: e.target.value})} />
                <select className="w-full bg-black border border-white/10 p-4 text-green-400 outline-none" value={formData.salesRep} onChange={(e) => setFormData({...formData, salesRep: e.target.value})}>
                  <option value="">-- SELECT SALES REP --</option>
                  <option value="John Doe">JOHN DOE</option>
                  <option value="Jane Smith">JANE SMITH</option>
                </select>
              </div>
            </div>
            <div className="pt-10">
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