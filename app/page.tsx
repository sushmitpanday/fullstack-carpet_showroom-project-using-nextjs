"use client";
import Link from 'next/link';

export default function FrontPage() {
  const bubbles = [
    { name: "Jobs", size: "w-32 h-32 md:w-48 md:h-48", pos: "md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2", color: "text-green-500 text-xl md:text-3xl font-bold", slug: "jobs" },
    
    // NEW: Products bubble linked to Cost & Sell tab
    { name: "Products", size: "w-28 h-28 md:w-40 md:h-40", pos: "md:top-1/2 md:left-[72%] md:-translate-y-1/2", color: "text-green-400 font-bold text-lg", slug: "jobs?tab=COST%20%26%20SELL" },
    
    { name: "Calculator", size: "w-24 h-24 md:w-36 md:h-36", pos: "md:top-[25%] md:left-[25%]", color: "text-green-400 font-semibold text-[10px] md:text-lg", slug: "calculator" },
    { name: "Stock", size: "w-24 h-24 md:w-36 md:h-36", pos: "md:top-[12%] md:left-[35%]", color: "text-green-400 font-semibold", slug: "stock" },
    { name: "Bank", size: "w-24 h-24 md:w-36 md:h-36", pos: "md:top-[20%] md:right-[18%]", color: "text-green-400", slug: "bank" },
    // FIXED: Changed left-[8%] to left-[18%] to move it right
    { name: "Quick Sell", size: "w-28 h-28 md:w-40 md:h-40", pos: "md:top-1/2 md:left-[18%] md:-translate-y-1/2", color: "text-green-400", slug: "quick-sell" }, 
    { name: "Schedule", size: "w-24 h-24 md:w-36 md:h-36", pos: "md:bottom-[18%] md:right-[20%]", color: "text-green-400", slug: "schedule" },
    { name: "Me", size: "w-28 h-28 md:w-40 md:h-40", pos: "md:bottom-[8%] md:left-1/2 md:-translate-x-1/2", color: "text-green-500 text-xl", slug: "profile" },
    { name: "Creditors", size: "w-20 h-20 md:w-28 md:h-28", pos: "md:top-[8%] md:left-1/2 md:-translate-x-1/2", color: "text-green-300 text-xs md:text-sm", slug: "creditors" },
  ];

  const sideButtons = [
    { name: "Users", slug: "users" },
    { name: "Sales Reps", slug: "sales" },
    { name: "Settings", slug: "settings" },
    { name: "Financials", slug: "financials" },
    { name: "Monitor", slug: "monitor" },
    { name: "Quit", slug: "quit" }
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#050510] overflow-x-hidden flex flex-col md:block p-6 md:p-0">
      <div className="z-20 flex md:flex-col flex-wrap justify-center gap-4 md:gap-10 mb-10 md:mb-0 md:absolute md:left-12 md:top-1/2 md:-translate-y-1/2">
        {sideButtons.map((btn) => (
          <Link href={`/${btn.slug}`} key={btn.name} className="min-w-[140px] md:min-w-0">
            <button className="w-full md:w-52 py-4 md:py-6 bg-gradient-to-b from-gray-800 to-black text-green-400 text-xs md:text-sm rounded-full border border-gray-700 shadow-2xl hover:scale-110 hover:border-green-500 transition-all uppercase font-black tracking-widest">
              {btn.name}
            </button>
          </Link>
        ))}
      </div>

      <div className="relative w-full h-full md:h-screen flex flex-wrap justify-center items-center gap-6 md:block">
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-2 border-green-900/10 rounded-full pointer-events-none"></div>

        {bubbles.map((b) => (
          <Link href={`/${b.slug}`} key={b.name} className={`md:absolute ${b.pos}`}>
            <div className={`${b.size} rounded-full flex items-center justify-center text-center p-4
              bg-gradient-to-br from-gray-800 to-black border-2 border-gray-700 shadow-[0_0_50px_rgba(0,255,0,0.1)]
              cursor-pointer hover:border-green-500 hover:scale-125 transition-all duration-300 z-10`}
            >
              <span className={`${b.color} leading-tight uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(0,255,0,0.4)]`}>
                {b.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden md:block absolute bottom-10 right-12 text-green-900 text-xs font-mono tracking-[0.5em]">
        TERMINAL_READY // 2026
      </div>
    </div>
  );
}