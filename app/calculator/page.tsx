"use client";
import { useState, useRef, useEffect } from 'react';

interface Door {
  id: number;
  wall: 'north' | 'south' | 'east' | 'west';
  width: number;
  offset: number;
}

interface Room {
  id: number;
  name: string;
  width: number;
  length: number;
  orientation: 'length' | 'width';
  doors: Door[];
}

export default function HouseMapCalculator() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, name: "Room 1", width: 3.66, length: 5.0, orientation: 'length', doors: [] },
  ]);
  const [rollWidth, setRollWidth] = useState(4.0);
  const [roundTo, setRoundTo] = useState(0.1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPencilActive, setIsPencilActive] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const SCALE = 40;

  const calculateRoomDetails = (room: Room) => {
    const L = room.length, W = room.width;
    let runSide, acrossSide;

    if (room.orientation === 'length') {
      runSide = L;
      acrossSide = W;
    } else {
      runSide = W;
      acrossSide = L;
    }

    let drops = Math.ceil(acrossSide / rollWidth);
    let totalLen = drops * runSide;
    totalLen = Math.ceil(totalLen / roundTo) * roundTo;
    
    return { totalLen, drops, runSide, acrossSide };
  };

  const totalLM = rooms.reduce((acc, r) => acc + calculateRoomDetails(r).totalLen, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    if (!isPencilActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDrawing(true);
  };

  const stopDrawing = (e: React.MouseEvent) => {
    if (!isDrawing || !isPencilActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setIsDrawing(false);
  };

  const addRoom = () => {
    setRooms([...rooms, { id: Date.now(), name: `Room ${rooms.length + 1}`, width: 3.5, length: 4.5, orientation: 'length', doors: [] }]);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#111] font-sans">
      <header className="px-8 py-4 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Multi-Room Carpet Calculator</h1>
        <div className="flex gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase">Roll Width (m):</label>
            <input type="number" step="0.01" value={rollWidth} onChange={(e) => setRollWidth(Number(e.target.value))} className="w-16 bg-transparent font-bold text-blue-600 outline-none" />
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase">Round Up (m):</label>
            <input type="number" step="0.01" value={roundTo} onChange={(e) => setRoundTo(Number(e.target.value))} className="w-16 bg-transparent font-bold text-blue-600 outline-none" />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)] overflow-hidden">
        
        {/* LEFT MAIN AREA */}
        <main className="w-2/3 overflow-y-auto p-6 space-y-6 border-r border-gray-200">
          
          {/* 1. ROOM INPUTS SECTION (AB UPAR HAI) */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Edit Room Dimensions</h3>
              <button onClick={addRoom} className="bg-blue-600 text-white px-4 py-1.5 rounded text-[10px] font-bold hover:bg-blue-700 transition-all shadow-sm">+ ADD ROOM</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room, rIdx) => (
                <div key={room.id} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <input className="font-bold text-sm outline-none text-blue-700 w-full bg-transparent" value={room.name} onChange={(e) => { const n = [...rooms]; n[rIdx].name = e.target.value; setRooms(n); }} />
                    <button onClick={() => setRooms(rooms.filter(r => r.id !== room.id))} className="text-gray-400 hover:text-red-500 text-xs px-2">Remove</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Length (m)</label>
                      <input type="number" step="0.01" value={room.length} onChange={(e)=> {const n=[...rooms]; n[rIdx].length=Number(e.target.value); setRooms(n)}} className="w-full border rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Width (m)</label>
                      <input type="number" step="0.01" value={room.width} onChange={(e)=> {const n=[...rooms]; n[rIdx].width=Number(e.target.value); setRooms(n)}} className="w-full border rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Orientation</label>
                    <select 
                      value={room.orientation} 
                      onChange={(e) => { const n = [...rooms]; n[rIdx].orientation = e.target.value as 'length' | 'width'; setRooms(n); }}
                      className="w-full border rounded-md px-3 py-1.5 text-sm bg-gray-50 outline-none"
                    >
                      <option value="length">Along Length</option>
                      <option value="width">Along Width</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. DRAWING CANVAS SECTION (AB NEECHE HAI) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Visual Map</h3>
              <button onClick={() => setIsPencilActive(!isPencilActive)} className={`px-4 py-1.5 rounded text-[10px] font-bold border transition-colors ${isPencilActive ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-gray-600 shadow-sm'}`}>
                {isPencilActive ? '✏️ DRAWING MODE ACTIVE' : '✏️ PENCIL TOOL'}
              </button>
            </div>
            
            <div className="relative h-[500px] bg-white rounded-xl border border-gray-300 shadow-inner overflow-hidden flex items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <canvas ref={canvasRef} width={1000} height={600} className={`absolute inset-0 z-50 ${isPencilActive ? 'cursor-crosshair' : 'pointer-events-none'}`} onMouseDown={startDrawing} onMouseUp={stopDrawing} />
              
              <div className="relative z-10 flex flex-wrap gap-10 p-10 justify-center">
                {rooms.map((room) => (
                  <div key={room.id} 
                       style={{ width: `${room.width * SCALE}px`, height: `${room.length * SCALE}px` }}
                       className="bg-blue-50/80 border-2 border-blue-400 rounded relative shadow-sm flex items-center justify-center transition-all">
                    <span className="text-[10px] font-black text-blue-700 uppercase">{room.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* RIGHT SIDE: SUMMARY */}
        <aside className="w-1/3 bg-white border-l border-gray-200 overflow-y-auto p-6 flex flex-col">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 italic">Calculation Summary</h3>
          
          <div className="space-y-4 flex-1">
            {rooms.map((room) => {
              const details = calculateRoomDetails(room);
              return (
                <div key={room.id} className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <p className="font-bold text-xs text-gray-800 mb-2">{room.name}</p>
                  <pre className="text-[10px] leading-relaxed text-gray-600 whitespace-pre-wrap font-mono">
                    {room.length.toFixed(2)}m (L) × {room.width.toFixed(2)}m (W){'\n'}
                    → {details.totalLen.toFixed(2)}m used{'\n'}
                    - {details.drops} drop(s) required{'\n'}
                    - Dir: {room.orientation}
                  </pre>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-900 rounded-xl p-5 text-white shadow-lg">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Final Quote</p>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-gray-300">Net Carpet:</span>
                <span className="text-lg font-bold">{totalLM.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-gray-700">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Total (incl. 10% Waste):</span>
                <span className="text-2xl font-black text-blue-400">{(totalLM * 1.1).toFixed(2)} m</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}