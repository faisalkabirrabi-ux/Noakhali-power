import React from 'react';
import { Radio } from 'lucide-react';

export default function Ticker() {
  const messages = [
    "মাইজদী: বর্তমানে বিদ্যুৎ সরবরাহ স্বাভাবিক আছে।",
    "সোনাইমুড়ী: এলাকায় রক্ষণাবেক্ষণ কাজের জন্য সাময়িক বিদ্যুৎ বিভ্রাট থাকতে পারে।",
    "বেগমগঞ্জ: সাময়িক রক্ষণাবেক্ষণের কাজ চলছে, বিদ্যুৎ সরবরাহ স্বাভাবিক হতে কিছুটা সময় লাগতে পারে।",
    "নোয়াখালী সমগ্র: বিদ্যুৎ পরিস্থিতি বর্তমান স্থিতিশীল।"
  ];

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
      <div className="w-full bg-[#050505] border-b border-gray-900 py-2 overflow-hidden flex items-center">
        <div className="flex items-center gap-2 px-4 border-r border-gray-800 shrink-0">
          <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">স্ট্যাটাস</span>
        </div>
        <div className="whitespace-nowrap animate-marquee">
          {messages.map((msg, index) => (
            <span key={index} className="px-8 text-xs text-gray-300 font-mono">
              {msg}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
