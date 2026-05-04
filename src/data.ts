export interface ScheduleItem {
  time: string;
  type: "OFF" | "ON" | "MAINTENANCE" | "FLUCTUATING";
  description?: string;
}

export interface HistoricalData {
  date: string;
  loadSheddingHours: number;
}

export interface Union {
  id: string;
  name: string;
  substationId: string;
  serviceProvider: 'PBS' | 'PDB';
}

export interface Upazila {
  id: string;
  name: string;
  status: "ON" | "OFF" | "FLUCTUATING" | "MAINTENANCE";
  nextShedding: string;
  contact: string;
  office: string;
  unions?: Union[];
  schedules: ScheduleItem[];
  historicalData: HistoricalData[];
  maintenanceDetails?: {
    taskName: string;
    startTime: string;
    estimatedEndTime: string;
    progress: number;
    teamName: string;
    teamLeaderContact: string;
    logs: { timestamp: string; action: string; status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' }[];
    currentLat: number;
    currentLng: number;
    routeStartLat: number;
    routeStartLng: number;
    routeEndLat: number;
    routeEndLng: number;
  };
  performanceScore: number;
  fluctuations: number;
  lat: number;
  lng: number;
}

export interface NewsItem {
  id: number;
  title: string;
  details: string;
  category: "Community" | "Electricity" | "General";
}

export const noakhaliData: Upazila[] = [
  {
    id: "sadar",
    name: "নোয়াখালী সদর (মাইজদী)",
    status: "ON",
    nextShedding: "বিকাল ৩:০০ - ৪:০০",
    contact: "০১৭৬৯-৪০০১৪০",
    office: "নোয়াখালী বীপবিবোর্ড, মাইজদী",
    unions: [
      { id: "binodpur", name: "বিনোদপুর", substationId: "SUB-001", serviceProvider: 'PBS' },
      { id: "dharmaapur", name: "ধর্মপুর", substationId: "SUB-002", serviceProvider: 'PDB' },
      { id: "kadirhanipur", name: "কাদিরহানিফ", substationId: "SUB-003", serviceProvider: 'PBS' }
    ],
    schedules: [
      { time: "সকাল ১০:০০ - বেলা ১১:০০", type: "OFF" },
      { time: "বেলা ১১:০০ - বিকাল ৩:০০", type: "ON" },
      { time: "বিকাল ৩:০০ - বিকাল ৪:০০", type: "OFF" },
      { time: "বিকাল ৪:০০ - রাত ৮:০০", type: "ON" },
      { time: "রাত ৮:০০ - রাত ৯:০০", type: "OFF" }
    ],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 2.5 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 3.0 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 2.0 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 4.5 },
      { date: "০১ মে", loadSheddingHours: 1.5 },
      { date: "০২ মে", loadSheddingHours: 3.0 },
      { date: "০৩ মে", loadSheddingHours: 2.5 }
    ],
    performanceScore: 85,
    fluctuations: 12,
    lat: 22.8228,
    lng: 91.1037,
  },
  {
    id: "begumganj",
    name: "বেগমগঞ্জ (চৌমুহনী)",
    status: "MAINTENANCE",
    nextShedding: "বর্তমান (চলমান)",
    contact: "০১৭৬৯-৪০০১৪১",
    office: "বেগমগঞ্জ জোনাল অফিস",
    unions: [
      { id: "amanullapur", name: "আমানউল্লাপুর", substationId: "SUB-005", serviceProvider: 'PBS' },
      { id: "choumuhani", name: "চৌমুহনী পৌরসভা", substationId: "SUB-006", serviceProvider: 'PDB' },
      { id: "eklaspur", name: "একলাশপুর", substationId: "SUB-009", serviceProvider: 'PBS' },
      { id: "mirwarishpur", name: "মিরওয়ারিশপুর", substationId: "SUB-010", serviceProvider: 'PDB' },
      { id: "chayani", name: "ছয়ানী", substationId: "SUB-014", serviceProvider: 'PBS' },
      { id: "rajganj", name: "রাজগঞ্জ", substationId: "SUB-015", serviceProvider: 'PBS' },
      { id: "jiratoli", name: "জিরতলী", substationId: "SUB-016", serviceProvider: 'PBS' }
    ],
    schedules: [
      { time: "সকাল ৯:০০ - দুপুর ২:০০", type: "MAINTENANCE", description: "সাব-স্টেশন মেরামত" },
      { time: "দুপুর ২:০০ - সন্ধ্যা ৬:০০", type: "ON" },
      { time: "সন্ধ্যা ৬:০০ - সন্ধ্যা ৭:০০", type: "OFF" },
      { time: "সন্ধ্যা ৭:০০ - রাত ১১:০০", type: "ON" }
    ],
    maintenanceDetails: {
      taskName: "চৌমুহনী গ্রিড সাব-স্টেশন আপগ্রেডেশন কাজ",
      startTime: "সকাল ৯:০০",
      estimatedEndTime: "দুপুর ২:০০",
      progress: 65,
      teamName: "সেন্ট্রাল মেইনটেন্যান্স ইউনিট-১",
      teamLeaderContact: "০১৮১২-৩৪৫৬৭৮",
      logs: [
        { timestamp: "সকাল ৯:০০", action: "মেইনটেন্যান্স শুরু", status: 'COMPLETED' },
        { timestamp: "সকাল ১০:৩০", action: "মূল ট্রান্সফরমার স্থাপন", status: 'COMPLETED' },
        { timestamp: "সকাল ১১:৪৫", action: "ক্যাবল সংযোগ পরীক্ষা", status: 'IN_PROGRESS' },
        { timestamp: "দুপুর ১২:৩০", action: "ভারসাম্য চেক", status: 'PENDING' }
      ],
      currentLat: 22.9250,
      currentLng: 91.1550,
      routeStartLat: 22.9228,
      routeStartLng: 91.1537,
      routeEndLat: 22.9300,
      routeEndLng: 91.1600
    },
    performanceScore: 55,
    fluctuations: 22,
    lat: 22.9228,
    lng: 91.1537,
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 4.0 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 3.5 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 5.0 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 4.0 },
      { date: "০১ মে", loadSheddingHours: 2.5 },
      { date: "০২ মে", loadSheddingHours: 4.5 },
      { date: "০৩ মে", loadSheddingHours: 6.0 }
    ]
  },
  {
    id: "chatkhil",
    name: "চাটখিল",
    status: "ON",
    nextShedding: "সন্ধ্যা ৬:০০ - ৭:০০",
    contact: "০১৭৬৯-৪০০১৪২",
    office: "চাটখিল জোনাল অফিস",
    unions: [
      { id: "badalkot", name: "বাদলকোট", substationId: "SUB-007", serviceProvider: 'PBS' },
      { id: "khilpara", name: "খিলপাড়া", substationId: "SUB-008", serviceProvider: 'PDB' },
      { id: "panchgaon", name: "পাঁচগাঁও", substationId: "SUB-011", serviceProvider: 'PBS' }
    ],
    schedules: [
      { time: "সকাল ১১:০০ - দুপুর ১২:০০", type: "OFF" },
      { time: "দুপুর ১২:০০ - সন্ধ্যা ৬:০০", type: "ON" },
      { time: "সন্ধ্যা ৬:০০ - সন্ধ্যা ৭:০০", type: "OFF" },
      { time: "সন্ধ্যা ৭:০০ - রাত ১০:০০", type: "ON" }
    ],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 2.0 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 2.5 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 1.5 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 3.0 },
      { date: "০১ মে", loadSheddingHours: 2.0 },
      { date: "০২ মে", loadSheddingHours: 2.5 },
      { date: "০৩ মে", loadSheddingHours: 1.0 }
    ],
    performanceScore: 92,
    fluctuations: 6,
    lat: 23.0560,
    lng: 91.0772,
  },
  {
    id: "sonaimuri",
    name: "সোনাইমুড়ী",
    status: "ON",
    nextShedding: "রাত ۸:০০ - ৯:০০",
    contact: "০১৭৬৯-৪০০১৪৩",
    office: "সোনাইমুড়ী সাব-জোনাল অফিস",
    unions: [
      { id: "sonaimuri_union", name: "সোনাইমুড়ী ইউনিয়ন", substationId: "SUB-012", serviceProvider: 'PBS' },
      { id: "nadna", name: "নাটেশ্বর", substationId: "SUB-013", serviceProvider: 'PDB' }
    ],
    schedules: [
      { time: "দুপুর ২:০০ - বিকাল ৩:০০", type: "OFF" },
      { time: "বিকাল ৩:০০ - রাত ৮:০০", type: "ON" },
      { time: "রাত ৮:০০ - রাত ৯:০০", type: "OFF" },
      { time: "রাত ৯:০০ - পরদিন সকাল", type: "ON" }
    ],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 3.0 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 2.0 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 2.5 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 4.0 },
      { date: "০১ মে", loadSheddingHours: 1.5 },
      { date: "০২ মে", loadSheddingHours: 2.0 },
      { date: "০৩ মে", loadSheddingHours: 3.5 }
    ],
    performanceScore: 80,
    fluctuations: 18,
    lat: 22.9555,
    lng: 91.1350,
  },
  {
    id: "senbagh",
    name: "সেনবাগ",
    status: "OFF",
    nextShedding: "বর্তমান (চলমান)",
    contact: "০১৭৬৯-৪০০১৪৪",
    office: "সেনবাগ জোনাল অফিস",
    schedules: [
      { time: "সকাল ৮:০০ - সকাল ৯:০০", type: "OFF" },
      { time: "সকাল ৯:০০ - দুপুর ১২:৩০", type: "ON" },
      { time: "দুপুর ১২:৩০ - দুপুর ১:৩০", type: "OFF" },
      { time: "দুপুর ১:৩০ - বিকাল ৫:০০", type: "ON" }
    ],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 2.5 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 3.5 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 3.0 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 2.0 },
      { date: "০১ মে", loadSheddingHours: 4.0 },
      { date: "০২ মে", loadSheddingHours: 1.5 },
      { date: "০৩ মে", loadSheddingHours: 2.0 }
    ],
    performanceScore: 78,
    fluctuations: 18,
    lat: 22.9880,
    lng: 91.2330,
  },
  {
    id: "companiganj",
    name: "কোম্পানীগঞ্জ (বসুরহাট)",
    status: "ON",
    nextShedding: "বিকাল ৫:০০ - ৬:০০",
    contact: "০১৭৬৯-৪০০১৪৫",
    office: "কোম্পানীগঞ্জ জোনাল অফিস",
    schedules: [
      { time: "সকাল ১২:০০ - দুপুর ১:০০", type: "OFF" },
      { time: "দুপুর ১:০০ - বিকাল ৫:০০", type: "ON" },
      { time: "বিকাল ৫:০০ - সন্ধ্যা ৬:০০", type: "OFF" },
      { time: "সন্ধ্যা ৬:০০ - রাত ৯:০০", type: "ON" }
    ],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 1.5 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 2.0 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 1.5 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 2.5 },
      { date: "০১ মে", loadSheddingHours: 3.0 },
      { date: "০২ মে", loadSheddingHours: 2.0 },
      { date: "০৩ মে", loadSheddingHours: 1.5 }
    ],
    performanceScore: 90,
    fluctuations: 9,
    lat: 22.8800,
    lng: 91.3500,
  },
  {
    id: "kabirhat",
    name: "কবিরহাট",
    status: "FLUCTUATING",
    nextShedding: "অনিশ্চিত",
    contact: "০১৭৬৯-৪০০১৪৬",
    office: "কবিরহাট সাব-জোনাল অফিস",
    schedules: [
      { time: "সকাল ১০:০০ - বিকাল ৪:০০", type: "FLUCTUATING", description: "ভোল্টেজ উঠানামা" },
      { time: "বিকাল ৪:০০ - সন্ধ্যা ৫:০০", type: "OFF" },
      { time: "সন্ধ্যা ৫:০০ - রাত ১০:০০", type: "ON" }
    ],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 4.5 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 3.0 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 5.0 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 4.5 },
      { date: "০১ মে", loadSheddingHours: 6.0 },
      { date: "০২ মে", loadSheddingHours: 4.0 },
      { date: "০৩ মে", loadSheddingHours: 5.5 }
    ],
    performanceScore: 45,
    fluctuations: 35,
    lat: 22.8000,
    lng: 91.2000,
  },
  {
    id: "subarnachar",
    name: "সুবর্ণচর",
    status: "ON",
    nextShedding: "দুপুর ২:০০ - ৩:০০",
    contact: "০১৭৬৯-৪০০১৪৭",
    office: "সুবর্ণচর জোনাল অফিস",
    schedules: [
      { time: "সকাল ৯:০০ - সকাল ১০:০০", type: "OFF" },
      { time: "সকাল ১০:০০ - দুপুর ২:০০", type: "ON" },
      { time: "দুপুর ২:০০ - বিকাল ৩:০০", type: "OFF" },
      { time: "বিকাল ৩:০০ - সন্ধ্যা ৭:০০", type: "ON" }
    ],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 2.0 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 2.5 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 1.5 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 3.0 },
      { date: "০১ মে", loadSheddingHours: 2.0 },
      { date: "০২ মে", loadSheddingHours: 2.5 },
      { date: "০৩ মে", loadSheddingHours: 2.0 }
    ],
    performanceScore: 82,
    fluctuations: 14,
    lat: 22.7500,
    lng: 91.2500,
  },
  {
    id: "hatiya",
    name: "হাতিয়া",
    status: "ON",
    nextShedding: "রাত ৯:০০ - ১০:০০",
    contact: "০১৭৬৯-৪০০১৪৮",
    office: "হাতিয়া সাব-জোনাল অফিস",
    schedules: [
      { time: "বিকাল ৩:০০ - বিকাল ৪:০০", type: "OFF" },
      { time: "বিকাল ৪:০০ - রাত ৯:০০", type: "ON" },
      { time: "রাত ৯:০০ - রাত ১০:০০", type: "OFF" },
      { time: "রাত ১০:০০ - পরদিন সকাল", type: "ON" }
    ],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 2.5 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 1.5 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 3.0 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 2.5 },
      { date: "০১ মে", loadSheddingHours: 2.0 },
      { date: "০২ মে", loadSheddingHours: 1.5 },
      { date: "০৩ মে", loadSheddingHours: 2.0 }
    ],
    performanceScore: 86,
    fluctuations: 12,
    lat: 22.4500,
    lng: 91.1000,
  },
  {
    id: "vip_govt_office",
    name: "VIP লাইন (সরকারি দপ্তর)",
    status: "ON",
    nextShedding: "প্রযোজ্য নয়",
    contact: "০১৭৬৯-৪০০১৪০",
    office: "যুগ্ম-পরিচালক অফিস",
    schedules: [],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 0 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 0 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 0 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 0 },
      { date: "০১ মে", loadSheddingHours: 0 },
      { date: "০২ মে", loadSheddingHours: 0 },
      { date: "০৩ মে", loadSheddingHours: 0 }
    ],
    performanceScore: 100,
    fluctuations: 0,
    lat: 22.8250,
    lng: 91.1050,
  },
  {
    id: "vip_govt_residential",
    name: "VIP লাইন (সরকারি আবাসিক)",
    status: "ON",
    nextShedding: "প্রযোজ্য নয়",
    contact: "০১৭৬৯-৪০০১৪০",
    office: "আবাসিক প্রকৌশলী অফিস",
    schedules: [],
    historicalData: [
      { date: "২৭ এপ্রিল", loadSheddingHours: 0 },
      { date: "২৮ এপ্রিল", loadSheddingHours: 0 },
      { date: "২৯ এপ্রিল", loadSheddingHours: 0 },
      { date: "৩০ এপ্রিল", loadSheddingHours: 0 },
      { date: "০১ মে", loadSheddingHours: 0 },
      { date: "০২ মে", loadSheddingHours: 0 },
      { date: "০৩ মে", loadSheddingHours: 0 }
    ],
    performanceScore: 98,
    fluctuations: 1,
    lat: 22.8280,
    lng: 91.1010,
  },
];

export const mockNews: NewsItem[] = [
  {
    id: 1,
    category: "Community",
    title: "নোয়াখালী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ে নতুন সোলার প্রজেক্ট",
    details: "ক্যাম্পাসে বিদ্যুৎ সাশ্রয় করতে নতুন ১০ কিলোওয়াট সোলার প্যানেল স্থাপন করা হয়েছে।"
  },
  {
    id: 2,
    category: "Electricity",
    title: "মাইজদীতে নতুন সাব-স্টেশন উদ্বোধন",
    details: "বিদ্যুৎ সরবরাহ নিশ্চিত করতে মাইজদী হাউজিং এলাকায় নতুন ৫০০ কেভিএ সাব-স্টেশন চালু হলো।"
  },
  {
    id: 3,
    category: "General",
    title: "নোয়াখালীর প্রবাসীদের জন্য রেমিট্যান্স উৎসব",
    details: "জেলা প্রশাসনের পক্ষ থেকে প্রবাসীদের জন্য বিশেষ সম্মাননা অনুষ্ঠানের আয়োজন।"
  }
];

export const mockAnnouncements = [
  {
    id: 1,
    date: "০৩ মে, ২০২৬",
    title: "চৌমুহনীতে সাব-স্টেশন মেরামত",
    details: "আজ সকাল ১০টা থেকে দুপুর ২টা পর্যন্ত বেগমগঞ্জ ও চৌমুহনী এলাকায় বিদ্যুৎ সরবরাহ বন্ধ থাকবে।",
  },
  {
    id: 2,
    date: "০২ মে, ২০২৬",
    title: "জাতীয় গ্রিডে সমস্যা",
    details: "জাতীয় গ্রিডে ত্রুটির কারণে সমগ্র নোয়াখালী জেলায় সাময়িক লোডশেডিং হতে পারে।",
  }
];
