import { useState, useEffect } from "react";
import { eventTimestamp } from "../lib/eventUtils";

export default function Countdown({ targetDate, targetTime, startsAt, small, theme="light" }) {
  const parsed = Date.parse(startsAt || "");
  const target = Number.isFinite(parsed) ? parsed : eventTimestamp(targetDate, targetTime);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (target === null || target <= Date.now()) return;
    const interval = setInterval(() => { const next = Date.now(); setNow(next); if (next >= target) clearInterval(interval); }, 1000);
    return () => clearInterval(interval);
  }, [target]);
  if (target === null) return <span className="text-xs font-bold">Start time to be confirmed</span>;
  const difference = Math.max(0, target - now);
  if (!difference) return <span className="text-xs font-bold">Started</span>;
  const timeLeft = {
    d: Math.floor(difference / 86400000), h: Math.floor(difference / 3600000) % 24,
    m: Math.floor(difference / 60000) % 60, s: Math.floor(difference / 1000) % 60,
  };
  const isDark = theme === "dark";

  const boxClasses = small 
    ? isDark
      ? "bg-white/10 text-white p-1 min-w-[2rem] rounded border border-white/20"
      : "bg-black text-white p-1 min-w-[2rem] shadow-[1px_1px_0px_rgba(0,0,0,0.3)] border border-black/20"
    : isDark
      ? "bg-white/10 text-white p-2 min-w-[4rem] rounded-xl border border-white/20 backdrop-blur-sm"
      : "bg-black text-white p-2 min-w-[3rem] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] border border-black/20";
      
  const numClasses = small ? "text-base font-black leading-none" : "text-2xl md:text-3xl font-black";
  
  const labelClasses = small 
    ? "text-[8px] mt-0.5 uppercase tracking-widest text-white/50" 
    : isDark 
      ? "text-[9px] md:text-[11px] mt-1 uppercase tracking-widest text-white/50"
      : "text-[8px] md:text-[10px] mt-0.5 uppercase tracking-widest text-white/50";

  return (
    <div className={`flex ${small ? 'gap-1' : 'gap-3'} font-mono text-center`}>
      <div className={boxClasses}>
        <div className={numClasses}>{timeLeft.d}</div>
        <div className={labelClasses}>Days</div>
      </div>
      <div className={boxClasses}>
        <div className={numClasses}>{timeLeft.h}</div>
        <div className={labelClasses}>Hrs</div>
      </div>
      <div className={boxClasses}>
        <div className={numClasses}>{timeLeft.m}</div>
        <div className={labelClasses}>Min</div>
      </div>
      <div className={boxClasses}>
        <div className={numClasses}>{timeLeft.s}</div>
        <div className={labelClasses}>Sec</div>
      </div>
    </div>
  );
}

