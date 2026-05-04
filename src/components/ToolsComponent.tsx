import React, { useState } from 'react';
import { Calculator, Zap, Sun, CloudRain, AlertTriangle, CloudLightning, Phone, MessageSquare, Headset, Clock } from 'lucide-react';
import QuizComponent from './QuizComponent';

export default function ToolsComponent({ weather }: { weather: { temp: string, condition: string, humidity: string, lightningRisk: string, alert: string } }) {
  const [units, setUnits] = useState('');
  const [issue, setIssue] = useState('');
  
  const calculateBill = () => {
    // Dummy calculator logic: 5 TK per unit
    const cost = parseFloat(units) * 5;
    return isNaN(cost) ? 0 : cost;
  };

  return (
    <div className="space-y-6">
      {/* Quiz Section */}
      <QuizComponent />

      {/* Report an Issue */}
      <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-gray-900 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
           <MessageSquare className="w-5 h-5 text-red-500" /> সমস্যা রিপোর্ট করুন
        </h3>
        <textarea
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="আপনার সমস্যার কথা বিস্তারিত লিখুন..."
          className="w-full bg-[#1A1A1A] border border-gray-700 text-gray-200 text-sm rounded-lg p-2.5 outline-none mb-3 h-24"
        />
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm transition">
            রিপোর্ট পাঠান
        </button>
      </div>

      {/* Customer Contact */}
      <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-gray-900 shadow-xl">
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
          <Headset className="w-5 h-5 text-purple-500" /> কাস্টমার কেয়ার যোগাযোগ
        </h3>
        <div className="flex gap-4">
            <a href="tel:16123" className="flex-1 text-center bg-[#1A1A1A] hover:bg-[#252525] border border-gray-700 p-4 rounded-xl transition">
                <Phone className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-white font-bold">কল করুন</div>
                <div className="text-gray-500 text-xs">১৬১২৩</div>
            </a>
            <div className="flex-1 text-center bg-[#1A1A1A] border border-gray-700 p-4 rounded-xl opacity-60">
                <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-white font-bold">লাইভ চ্যাট</div>
                <div className="text-gray-500 text-xs">আসছে...</div>
            </div>
        </div>
      </div>

      {/* Weather & Alerts */}
      <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-gray-900 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-blue-300" /> আবহাওয়া ও সতর্কতা
        </h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] p-4 rounded-xl">
                <div className="text-gray-400 text-xs">তাপমাত্রা</div>
                <div className="text-white text-xl font-bold">{weather.temp}</div>
            </div>
             <div className="bg-[#1A1A1A] p-4 rounded-xl">
                <div className="text-gray-400 text-xs">অবস্থা</div>
                <div className="text-white text-xl font-bold">{weather.condition}</div>
            </div>
            <div className="bg-[#1A1A1A] p-4 rounded-xl col-span-2">
                <div className="text-gray-400 text-xs flex items-center gap-1"><CloudLightning className="w-3 h-3"/> বজ্রপাতের সম্ভাবনা</div>
                <div className={`text-xl font-bold ${weather.lightningRisk === 'উচ্চ ঝুঁকি' ? 'text-red-500' : 'text-green-500'}`}>{weather.lightningRisk}</div>
            </div>
        </div>
        <div className={`p-4 rounded-xl flex items-start gap-3 ${weather.alert.includes('নেই') ? 'bg-green-950/20 border border-green-900/30' : 'bg-red-950/20 border border-red-900/30'}`}>
            <AlertTriangle className={`w-5 h-5 ${weather.alert.includes('নেই') ? 'text-green-500' : 'text-red-500'}`} />
            <p className="text-sm text-gray-200">{weather.alert}</p>
        </div>
      </div>

      {/* Bill Reminder */}
      <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-gray-900 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" /> বিল পরিশোধের রিমাইন্ডার
        </h3>
        <input
          type="text"
          placeholder="গ্রাহক নম্বর"
          className="w-full bg-[#1A1A1A] border border-gray-700 text-gray-200 text-sm rounded-lg p-2.5 outline-none"
        />
        <input
          type="date"
          className="w-full bg-[#1A1A1A] border border-gray-700 text-gray-200 text-sm rounded-lg p-2.5 outline-none"
        />
        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition">
          রিমাইন্ডার সেট করুন
        </button>
      </div>

      {/* Bill Calculator */}
      <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-gray-900 shadow-xl">
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-500" /> বিদ্যুৎ বিল ক্যালকুলেটর
        </h3>
        <input
          type="number"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          placeholder="ইউনিট সংখ্যা লিখুন"
          className="w-full bg-[#1A1A1A] border border-gray-700 text-gray-200 text-sm rounded-lg p-2.5 outline-none mb-3"
        />
        <div className="text-white font-bold">আনুমানিক বিল: {calculateBill()} টাকা</div>
      </div>

      {/* Appliance Guide */}
      <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-gray-900 shadow-xl">
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" /> বিদ্যুৎ সাশ্রয়ী টিপস
        </h3>
        <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
          <li>অপ্রয়োজনে লাইট ও ফ্যান বন্ধ রাখুন।</li>
          <li>দিনের বেলা জানালার পর্দা সরিয়ে প্রাকৃতিক আলো ব্যবহার করুন।</li>
          <li>এসি ব্যবহারে এনার্জি স্টার রেটিং দেখে কিনুন।</li>
        </ul>
      </div>

      {/* Solar Info */}
      <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-gray-900 shadow-xl">
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
          <Sun className="w-5 h-5 text-yellow-500" /> সোলার এনার্জি সম্ভাবনা
        </h3>
        <p className="text-sm text-gray-400">নোয়াখালীর উপকূলীয় অঞ্চলে সোলার প্যানেলের মাধ্যমে বিদ্যুৎ উৎপাদন সাশ্রয়ী হতে পারে। সৌরশক্তি ব্যবহারের দীর্ঘমেয়াদী সুবিধা উপভোগ করুন।</p>
      </div>
    </div>
  );
}
