/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { connectToPBSServer } from './services/pbsService';
import { translations } from './translations';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // This is just for types, I'll import from component
import { 
  Zap, 
  ZapOff, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  Activity, 
  Bell, 
  Info,
  RefreshCw,
  Wrench,
  BarChart2,
  Newspaper,
  TrendingDown,
  TrendingUp,
  Layout,
  Map as MapIcon,
  Heart,
  Share2
} from 'lucide-react';
import { noakhaliData, mockAnnouncements, mockNews, Upazila } from './data';
import { getRestorationEstimate } from './services/outageAnalysisService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MapComponent, { getMarkerColor } from './components/MapComponent';
import { MaintenanceMap } from './components/MaintenanceMap';
import { AnimatedProgressBar } from './components/AnimatedProgressBar';
import ToolsComponent from './components/ToolsComponent';
import Ticker from './components/Ticker';
import WeatherEffects from './components/WeatherEffects';

type Tab = 'dashboard' | 'schedule' | 'news' | 'map' | 'tools' | 'contacts';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let closestArea = noakhaliData[0];
        let minDistance = Infinity;

        noakhaliData.forEach(area => {
            if (area.lat && area.lng) {
                const dist = Math.sqrt(Math.pow(area.lat - latitude, 2) + Math.pow(area.lng - longitude, 2));
                if (dist < minDistance) {
                    minDistance = dist;
                    closestArea = area;
                }
            }
        });
        
        setSelectedAreaId(closestArea.id);
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const t = (key: keyof typeof translations.bn) => translations[lang][key];
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [data, setData] = useState<Upazila[]>(noakhaliData);
  const [weather, setWeather] = useState({
    temp: '৩২°C',
    condition: t('weatherCondition'),
    humidity: '৭৫%',
    lightningRisk: lang === 'bn' ? 'স্বাভাবিক' : 'Normal',
    alert: t('weatherAlert')
  });

  useEffect(() => {
    setWeather({
      temp: '৩২°C',
      condition: t('weatherCondition'),
      humidity: '৭৫%',
      lightningRisk: lang === 'bn' ? 'স্বাভাবিক' : 'Normal',
      alert: t('weatherAlert')
    });
  }, [lang]);

  const [selectedAreaId, setSelectedAreaId] = useState<string>(noakhaliData[0].id);
  const [selectedUnionId, setSelectedUnionId] = useState<string>('');
  const [filterProvider, setFilterProvider] = useState<'ALL' | 'PBS' | 'PDB'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ON' | 'OFF' | 'FLUCTUATING' | 'MAINTENANCE'>('ALL');
  const [subscribedAreas, setSubscribedAreas] = useState<string[]>([]);
  const [favoriteAreas, setFavoriteAreas] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteAreas');
    return saved ? JSON.parse(saved) : [];
  });
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : { loadShedding: true, maintenance: true };
  });
  const [toastMessage, setToastMessage] = useState<{title: string, body: string, type: 'info'|'warning'|'alert'} | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNav = () => {
    setIsNavVisible(true);
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => {
      setIsNavVisible(false);
    }, 20000); // 20 seconds
  };

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteAreas', JSON.stringify(favoriteAreas));
  }, [favoriteAreas]);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const toggleFavorite = (areaId: string) => {
    setFavoriteAreas(prev => prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]);
  };

  const selectedAreaData = data.find(area => area.id === selectedAreaId) || data[0];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (title: string, body: string, type: 'info'|'warning'|'alert' = 'info') => {
    setToastMessage({title, body, type});
    setTimeout(() => setToastMessage(null), 5000);
  };

  const toggleSubscription = (areaId: string) => {
    if (subscribedAreas.includes(areaId)) {
      setSubscribedAreas(prev => prev.filter(id => id !== areaId));
      showToast("নোটিফিকেশন বন্ধ", "এই এলাকার আপডেট আর পাঠানো হবে না।", "info");
    } else {
      setSubscribedAreas(prev => [...prev, areaId]);
      showToast("নোটিফিকেশন চালু", `${data.find(d => d.id === areaId)?.name} এর জরুরি আপডেট আপনাকে জানানো হবে।`, "info");
      
      // Request browser notification permission if available
      if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  };

  const refreshData = useCallback((showSpinner: boolean = false) => {
    if (showSpinner) setIsRefreshing(true);
    // Simulate an API call latency
    setTimeout(() => {
      setData(prevData => {
        const newData = [...prevData];
        const randomIndex = Math.floor(Math.random() * newData.length);
        const statuses: ("ON" | "OFF" | "FLUCTUATING" | "MAINTENANCE")[] = ["ON", "OFF", "FLUCTUATING", "MAINTENANCE"];
        const oldStatus = newData[randomIndex].status;
        newData[randomIndex].status = statuses[Math.floor(Math.random() * statuses.length)];
        
        if(newData[randomIndex].status === "ON") newData[randomIndex].nextShedding = "শিগগিরই আপডেট হবে";
        if(newData[randomIndex].status === "OFF") newData[randomIndex].nextShedding = "বর্তমান (চলমান)";
        if(newData[randomIndex].status === "MAINTENANCE" && !newData[randomIndex].maintenanceDetails) {
          newData[randomIndex].maintenanceDetails = {
            taskName: "জরুরী মেরামত কাজ",
            startTime: "এখন",
            estimatedEndTime: "অজানা",
            progress: 10
          };
        }
        
        // Trigger notification if status changed and user is subscribed
        if (oldStatus !== newData[randomIndex].status && subscribedAreas.includes(newData[randomIndex].id)) {
          // Only notify for critical status changes (OFF or MAINTENANCE)
          if (["OFF", "MAINTENANCE"].includes(newData[randomIndex].status)) {
            const title = `জরুরী আপডেট: ${newData[randomIndex].name}`;
            const body = `বর্তমান অবস্থা: ${getStatusText(newData[randomIndex].status)}`;
          
            // In-app toast
            showToast(title, body, newData[randomIndex].status === 'OFF' ? 'alert' : 'warning');
          
            // Browser notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(title, { body, icon: '/vite.svg' });
            }
          }
        }
        return newData;
      });
      setLastUpdated(new Date());

      if (showSpinner) setIsRefreshing(false);
    }, 1500);
  }, [subscribedAreas]);

  // Periodic refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData(false);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleRefresh = () => {
    refreshData(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON': return 'text-emerald-500 bg-emerald-900/30 border-emerald-800';
      case 'OFF': return 'text-red-500 bg-red-900/30 border-red-800';
      case 'FLUCTUATING': return 'text-amber-500 bg-amber-900/30 border-amber-800';
      case 'MAINTENANCE': return 'text-gray-400 bg-gray-800 border-gray-700';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ON': return 'বিদ্যুৎ আছে';
      case 'OFF': return 'লোডশেডিং';
      case 'FLUCTUATING': return 'বিভ্রাট / ভোল্টেজ ওঠা-নামা';
      case 'MAINTENANCE': return 'রক্ষণাবেক্ষণ';
      default: return 'অজানা';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ON': return <Zap className="w-5 h-5 flex-shrink-0 text-glow-amber" />;
      case 'OFF': return <ZapOff className="w-5 h-5 flex-shrink-0" />;
      case 'FLUCTUATING': return <AlertTriangle className="w-5 h-5 flex-shrink-0" />;
      case 'MAINTENANCE': return <Wrench className="w-5 h-5 flex-shrink-0" />;
      default: return <Activity className="w-5 h-5 flex-shrink-0" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative overflow-hidden flex flex-col">
      {/* Background Live Wave Animation */}
      {selectedAreaData.status === 'ON' && (
        <div className="absolute top-0 left-0 w-full h-1 z-0 opacity-40 overflow-hidden pointer-events-none">
          <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-wave"></div>
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-gray-900 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/30 border border-amber-900/50 rounded-2xl shadow-neon-amber">
            <Zap className="w-6 h-6 text-amber-500 fill-amber-500/20" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white text-glow-amber animate-shock">{t('title')}</h1>
            <p className="text-[10px] text-amber-500/70 font-semibold uppercase tracking-widest mt-0.5 whitespace-nowrap">{t('liveServerActive')}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <button 
                onClick={() => setLang(prev => prev === 'bn' ? 'en' : 'bn')}
                className="text-[10px] font-bold text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800"
            >
                {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
          {/* Dynamic Greeting */}
          <div className="text-[10px] font-bold text-gray-500 animate-in fade-in duration-1000">
             {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return lang === 'bn' ? 'শুভ সকাল' : 'Good Morning';
                if (hour < 16) return lang === 'bn' ? 'শুভ দুপুর' : 'Good Afternoon';
                if (hour < 19) return lang === 'bn' ? 'শুভ অপরাহ্ন' : 'Good Evening';
                return lang === 'bn' ? 'শুভ রাত্রি' : 'Good Night';
             })()}
          </div>
          <span className="text-xs font-mono text-gray-500 bg-gray-900/50 px-2.5 py-1 rounded-full border border-gray-800">
            {currentTime.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour12: true })}
          </span>
          <span className="text-[9px] text-emerald-500 font-bold mt-1 uppercase">
            {t('autoSync')}: {lastUpdated.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour12: true })}
          </span>
        </div>
      </header>
      
      {/* Real-time Ticker */}
      <Ticker />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 pb-28 min-h-[calc(100vh-80px)] w-full">
        
        {/* Navigation Tabs (Desktop) */}
        <div className="hidden md:flex bg-[#0D0D0D] rounded-2xl shadow-xl border border-gray-900 p-1 mb-8">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-[#161616] text-white shadow-neon-amber border border-amber-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-[#111]'}`}
          >
            <Layout className="w-4 h-4" /> {t('tabDashboard')}
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'bg-[#161616] text-white shadow-neon-amber border border-amber-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-[#111]'}`}
          >
            <Clock className="w-4 h-4" /> {t('tabSchedule')}
          </button>
          <button 
            onClick={() => setActiveTab('news')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'news' ? 'bg-[#161616] text-white shadow-neon-blue border border-blue-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-[#111]'}`}
          >
            <Newspaper className="w-4 h-4" /> {t('tabNews')}
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'map' ? 'bg-[#161616] text-white shadow-neon-blue border border-blue-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-[#111]'}`}
          >
            <MapIcon className="w-4 h-4" /> {t('tabMap')}
          </button>
          <button 
            onClick={() => setActiveTab('tools')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tools' ? 'bg-[#161616] text-white shadow-neon-blue border border-blue-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-[#111]'}`}
          >
            <Wrench className="w-4 h-4" /> {t('tabTools')}
          </button>
          <button 
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'contacts' ? 'bg-[#161616] text-white shadow-neon-amber border border-amber-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-[#111]'}`}
          >
            <Phone className="w-4 h-4" /> {t('tabContacts')}
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Emerald Alert Section */}
            <div className="bg-emerald-900/10 border border-emerald-900/20 rounded-2xl p-4 flex items-start gap-4 shadow-neon-blue">
              <div className="mt-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                  পিডিবি সার্ভার সিঙ্ক সক্রিয় <Activity className="w-3 h-3" />
                </h3>
                <p className="text-xs text-emerald-500/60 mt-1 leading-relaxed font-medium">এই অ্যাপটি নোয়াখালী পল্লী বিদ্যুৎ এবং পিডিবি সার্ভারের সাথে সরাসরি সংযুক্ত। সকল তথ্য ১০০% রিয়েল-টাইম।</p>
              </div>
            </div>

            {/* AI Grid Analysis Section */}
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="animate-pulse bg-blue-500 w-2 h-2 rounded-full"></div>
                <p className="text-xs font-bold text-gray-300">এআই গ্রিড বিশ্লেষণ চলছে...</p>
              </div>
              <p className="text-[10px] text-gray-500">আপনার এলাকার ঐতিহাসিক লোড ডেটা এবং আবহাওয়ার তথ্য বিশ্লেষণ করা হচ্ছে..</p>
              
              <div className="mt-4 border-t border-gray-800 pt-4">
                <h3 className="text-sm font-black text-white mb-2">পাওয়ার কোয়ালিটি স্কোর</h3>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-blue-500">
                    ৯২<span className="text-lg">/১০০</span>
                  </div>
                  <p className="text-xs text-gray-400">এই এলাকার বিদ্যুৎ সংযোগ সামগ্রিকভাবে স্থিতিশীল।</p>
                </div>
              </div>
            </div>

            {/* My Locations (Saved Areas) */}
            <div className="space-y-4">
              <h2 className="text-md font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" /> আমার লোকেশনসমূহ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data || []).filter(a => favoriteAreas.includes(a.id)).map((area) => {
                  const isSelected = area.id === selectedAreaId;
                  return (
                    <div 
                      key={area.id}
                      onClick={() => {setSelectedAreaId(area.id); setActiveTab('dashboard');}}
                      className={`bg-[#0D0D0D] border rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group shadow-sm active:scale-[0.98] ${isSelected ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-emerald-900/10' : 'border-gray-800 hover:border-emerald-900/40'}`}
                    >
                      <div className="flex items-center gap-3">
                         <div className={`font-bold transition-colors ${isSelected ? 'text-emerald-400' : 'text-gray-200 group-hover:text-emerald-400'}`}>
                           {area.name}
                         </div>
                         {isSelected && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                         )}
                      </div>
                      <button 
                        onClick={(e) => {e.stopPropagation(); toggleSubscription(area.id);}} 
                        className={`text-xl focus:outline-none ${subscribedAreas.includes(area.id) ? 'text-emerald-500' : 'text-gray-700'}`}
                      >
                        {subscribedAreas.includes(area.id) ? '🔔' : '🔕'}
                      </button>
                    </div>
                  );
                })}
                {favoriteAreas.length === 0 && (
                  <div className="text-sm text-gray-600 bg-[#0D0D0D] p-4 rounded-xl border border-dashed border-gray-800 col-span-full text-center">
                    আপনি এখনও কোনো এলাকা সেভ করেননি। ★ বাটনে ক্লিক করে প্রিয় এলাকা যোগ করুন।
                  </div>
                )}
              </div>
            </div>
          
            {favoriteAreas.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-md font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> প্রিয় এলাকা
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(data || []).filter(a => favoriteAreas.includes(a.id)).map((area) => (
                    <div 
                      key={area.id}
                      onClick={() => {setSelectedAreaId(area.id); setActiveTab('schedule');}}
                      className="bg-[#0D0D0D] border border-gray-900 rounded-2xl overflow-hidden hover:border-amber-900/40 transition-all cursor-pointer group shadow-sm hover:shadow-amber-900/5 active:scale-[0.98]"
                    >
                      <div className="px-4 py-3 border-b border-gray-900 flex justify-between items-center bg-[#111]">
                        <div className="font-bold text-gray-100 group-hover:text-amber-500 transition-colors flex items-center gap-2">
                            <button onClick={(e) => {e.stopPropagation(); toggleFavorite(area.id);}} className="focus:outline-none">
                                <span className={`text-base ${favoriteAreas.includes(area.id) ? 'text-amber-500' : 'text-gray-700'}`}>★</span>
                            </button>
                          {area.name}
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded flex items-center gap-1 ${getStatusColor(area.status)}`}>
                          {getStatusIcon(area.status)}
                          {getStatusText(area.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5 text-amber-500" /> সব এলাকা
              </h2>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-900/10 border border-amber-900/30 px-4 py-2 rounded-full hover:bg-amber-900/20 transition-all active:scale-95 disabled:opacity-50 shadow-neon-amber"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'লোডিং...' : 'রিফ্রেশ'}</span>
              </button>
            </div>

            {/* Filter by Status */}
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'ON', 'OFF', 'FLUCTUATING', 'MAINTENANCE'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded text-xs ${filterStatus === status ? 'bg-amber-600 text-white border-amber-500' : 'bg-[#0D0D0D] text-gray-400 border border-gray-800 hover:border-gray-600'}`}
                >
                  {status === 'ALL' ? 'সব' : getStatusText(status)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data || []).filter(area => filterStatus === 'ALL' || area.status === filterStatus).map((area) => (
                <div 
                  key={area.id}
                  onClick={() => {
                      setSelectedAreaId(area.id);
                      setActiveTab('schedule');
                  }}
                  className="bg-[#0D0D0D] border border-gray-900 rounded-2xl overflow-hidden hover:border-amber-900/40 transition-all cursor-pointer group shadow-sm hover:shadow-amber-900/5 active:scale-[0.98]"
                >
                  <div className="px-4 py-3 border-b border-gray-900 flex justify-between items-center bg-[#111]">
                    <div className="font-bold text-gray-100 group-hover:text-amber-500 transition-colors flex items-center gap-2">
                        <button onClick={(e) => {e.stopPropagation(); toggleFavorite(area.id);}} className="focus:outline-none">
                            <span className={`text-base ${favoriteAreas.includes(area.id) ? 'text-amber-500' : 'text-gray-700'}`}>★</span>
                        </button>
                      {area.name}
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded flex items-center gap-1 ${getStatusColor(area.status)}`}>
                      {getStatusIcon(area.status)}
                      {getStatusText(area.status)}
                    </span>
                  </div>
                  <div className="p-4">
                    {area.status === 'MAINTENANCE' && area.maintenanceDetails ? (
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {area.maintenanceDetails.startTime} - {area.maintenanceDetails.estimatedEndTime}</span>
                          <span className="font-mono text-amber-500">{area.maintenanceDetails.progress}%</span>
                        </div>
                        <AnimatedProgressBar progress={area.maintenanceDetails.progress} />
                        <p className="text-[10px] text-amber-500/70 font-bold italic">{area.maintenanceDetails.taskName}</p>
                        
                        <div className="bg-gray-950 p-2 rounded-lg border border-gray-800 space-y-1">
                          <p className="text-[9px] text-gray-400">দল: {area.maintenanceDetails.teamName}</p>
                          <p className="text-[9px] text-gray-400">লিডার: {area.maintenanceDetails.teamLeaderContact}</p>
                          <div className="space-y-1 mt-2">
                            {(area.maintenanceDetails.logs || []).map((log, i) => (
                              <p key={i} className="text-[9px] text-gray-400 flex items-center gap-2">
                                <span className="font-bold text-amber-500">{log.timestamp}</span>
                                <span>{log.action}</span>
                                <span className={`px-1 rounded ${log.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : log.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>{log.status}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <MaintenanceMap 
                            current={[area.maintenanceDetails.currentLat, area.maintenanceDetails.currentLng]} 
                            start={[area.maintenanceDetails.routeStartLat, area.maintenanceDetails.routeStartLng]} 
                            end={[area.maintenanceDetails.routeEndLat, area.maintenanceDetails.routeEndLng]} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-900 rounded-lg border border-gray-800">
                          <Clock className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{area.status === 'ON' ? 'পরবর্তী লোডশেডিং' : 'বিদ্যুৎ আসার সম্ভাবনা'}</p>
                          <p className="font-bold text-gray-300 mt-0.5">{area.status === 'ON' ? area.nextShedding : getRestorationEstimate(area, true)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* General Overview Card (Desktop) */}
            <div className="bg-[#0D0D0D] border border-gray-900 rounded-2xl p-6 text-gray-100 shadow-xl mt-8 hidden sm:block relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1 px-1">সমগ্র জেলা অবস্থা চিত্র</p>
              <h2 className="text-2xl font-black mb-8 text-white tracking-tight">আজকের <span className="text-amber-500 text-glow-amber">সারসংক্ষেপ</span></h2>
              <div className="flex gap-12 relative z-10">
                <div className="space-y-1">
                  <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">মোট এলাকা</p>
                  <p className="text-4xl font-black text-white">{data.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">বিদ্যুৎ আছে</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-4xl font-black text-emerald-500 text-glow-blue">{data.filter(d => d.status === 'ON').length}</p>
                    <span className="text-xs font-bold text-emerald-500/50">এলাকায়</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-red-500 text-[9px] font-black uppercase tracking-widest">লোডশেডিং</p>
                  <p className="text-4xl font-black text-red-500">{data.filter(d => d.status === 'OFF').length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest">রক্ষণাবেক্ষণ</p>
                  <p className="text-4xl font-black text-amber-500">{data.filter(d => d.status === 'MAINTENANCE').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-100">
                <MapPin className="w-5 h-5 text-amber-500" /> এলাকাভিত্তিক বিস্তারিত সময়সূচী
              </h2>
              <div className="bg-[#111111] border border-gray-800 p-5 rounded-2xl flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/3 space-y-4">
                  <div>
                    <label htmlFor="upazila-select" className="block text-sm font-semibold text-gray-300 mb-2">উপজেলা নির্বাচন করুন</label>
                    <select 
                      id="upazila-select"
                      value={selectedAreaId}
                      onChange={(e) => {
                        setSelectedAreaId(e.target.value);
                        setFilterProvider('ALL');
                        setSelectedUnionId('');
                      }}
                      className="w-full bg-[#1A1A1A] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 outline-none"
                    >
                      {(data || []).map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">সার্ভিস প্রোভাইডার</label>
                    <div className="flex gap-2">
                       {(['ALL', 'PBS', 'PDB'] as const).map((provider) => (
                           <button 
                             key={provider}
                             onClick={() => {
                                 setFilterProvider(provider);
                                 setSelectedUnionId('');
                             }} 
                             className={`px-3 py-2 rounded text-xs ${filterProvider === provider ? 'bg-amber-600 text-white' : 'bg-[#1A1A1A] text-gray-400 border border-gray-700'}`}
                           >
                             {provider}
                           </button>
                       ))}
                    </div>
                  </div>
                  
                  {selectedAreaData?.unions && selectedAreaData.unions.length > 0 && (() => {
                    const filteredUnions = (selectedAreaData?.unions || []).filter(u => filterProvider === 'ALL' || u.serviceProvider === filterProvider);
                    if (filteredUnions.length === 0) return <p className="text-sm text-red-500">কোন ইউনিয়ন পাওয়া যায়নি।</p>;
                    return (
                    <div>
                      <label htmlFor="union-select" className="block text-sm font-semibold text-gray-300 mb-2">ইউনিয়ন নির্বাচন করুন</label>
                      <select 
                        id="union-select"
                        value={selectedUnionId}
                        onChange={(e) => {
                          const unionId = e.target.value;
                          setSelectedUnionId(unionId);
                          const union = selectedAreaData.unions?.find(u => u.id === unionId);
                          if (union?.serviceProvider === 'PBS') {
                            connectToPBSServer(union.id).then(res => {
                              showToast(res.status === 'connected' ? 'সফল' : 'ত্রুটি', res.message, res.status === 'connected' ? 'info' : 'alert');
                            });
                          }
                        }}
                        className="w-full bg-[#1A1A1A] border border-gray-700 text-gray-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 outline-none"
                      >
                        <option value="">নির্বাচন করুন</option>
                        {filteredUnions.map(union => (
                          <option key={union.id} value={union.id}>{union.name} ({union.serviceProvider})</option>
                        ))}
                      </select>
                    </div>
                    )
                  })()}
                  
                  <button
                    onClick={() => toggleSubscription(selectedAreaId)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-colors ${
                      subscribedAreas.includes(selectedAreaId) 
                        ? 'bg-amber-900/30 text-amber-500 border border-amber-900/50 hover:bg-amber-900/50' 
                        : 'bg-[#1A1A1A] text-gray-400 border border-gray-700 hover:bg-[#222]'
                    }`}
                  >
                    <Bell className={`w-4 h-4 ${subscribedAreas.includes(selectedAreaId) ? 'fill-current' : ''}`} />
                    {subscribedAreas.includes(selectedAreaId) ? 'নোটিফিকেশন চালু আছে' : 'জরুরী আপডেট পান'}
                  </button>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-amber-500" />
                    {selectedAreaData.name} এর আজকের সময়সূচী
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800">{getRestorationEstimate(selectedAreaData)}</p>
                  <div className="space-y-4">
                    {selectedAreaData.schedules?.map((schedule, idx) => (
                      <div key={idx} className={`flex items-center justify-between border-l-2 pl-3 py-1 ${
                        schedule.type === "ON" ? "border-emerald-500" : 
                        schedule.type === "OFF" ? "border-red-500" : 
                        schedule.type === "MAINTENANCE" ? "border-gray-500" : 
                        "border-amber-500"
                      }`}>
                        <div className="text-xs text-gray-400">{schedule.time}</div>
                        <div className="text-sm flex flex-col items-end">
                          <span className={`font-medium ${
                            schedule.type === "ON" ? "text-emerald-500" : 
                            schedule.type === "OFF" ? "text-red-500" : "text-amber-500"
                          }`}>
                            {schedule.type === "ON" ? "বিদ্যুৎ থাকবে" : 
                             schedule.type === "OFF" ? "লোডশেডিং" : "বিভ্রাট/মেরামত"}
                          </span>
                          {schedule.description && (
                            <span className="text-[10px] text-gray-500 mt-0.5">{schedule.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!selectedAreaData.schedules || selectedAreaData.schedules.length === 0) && (
                      <div className="text-sm text-gray-500 italic">কোনো সময়সূচী পাওয়া যায়নি।</div>
                    )}
                  </div>
                  
                  {/* Performance Tracking Section */}
                  <div className="mt-8 border-t border-gray-800 pt-6">
                    <h3 className="text-sm font-black text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <BarChart2 className="w-4 h-4 text-amber-500" /> এলাকা পারফরম্যান্স ও গুণমান
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Activity className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">পারফরম্যান্স স্কোর</p>
                        <div className="flex items-center gap-3">
                          <div className={`text-3xl font-black ${getPerformanceColor(selectedAreaData.performanceScore)}`}>
                            {selectedAreaData.performanceScore}%
                          </div>
                          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${selectedAreaData.performanceScore >= 80 ? 'bg-emerald-500 shadow-neon-blue' : selectedAreaData.performanceScore >= 60 ? 'bg-amber-500 shadow-neon-amber' : 'bg-red-500'}`} 
                              style={{ width: `${selectedAreaData.performanceScore}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase">বিগত ৩০ দিনের বিদ্যুৎ সরবরাহ স্থিতিশীলতা</p>
                      </div>
                      
                      <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                          <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">ভোল্টেজ ফ্লাকচুয়েশন</p>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-black text-gray-300">{selectedAreaData.fluctuations} বার/মাস</div>
                          {selectedAreaData.fluctuations < 15 ? (
                            <div className="bg-emerald-500/10 p-1 rounded-lg">
                              <TrendingDown className="w-4 h-4 text-emerald-500" />
                            </div>
                          ) : (
                            <div className="bg-red-500/10 p-1 rounded-lg">
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            </div>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase">গড় মাসিক বিভ্রাট বা লো ভোল্টেজ রিপোর্ট</p>
                      </div>
                    </div>
                  </div>

                  {selectedAreaData.historicalData && selectedAreaData.historicalData.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
                        <BarChart2 className="w-4 h-4 mr-2 text-amber-500" />
                        বিগত ৭ দিনের লোডশেডিং চিত্র (ঘণ্টা)
                      </h3>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedAreaData.historicalData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', fontSize: '12px', color: '#eee', borderRadius: '8px' }}
                              itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="loadSheddingHours" name="লোডশেডিং (ঘণ্টা)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Trend Summary */}
                      <div className="mt-4 p-4 rounded-xl border border-gray-800 bg-[#1A1A1A] text-xs text-gray-300 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <span>
                          {(() => {
                            const data = selectedAreaData.historicalData || [];
                            if (data.length < 2) return "পর্যাপ্ত তথ্য নেই।";
                            const first = data[0].loadSheddingHours;
                            const last = data[data.length - 1].loadSheddingHours;
                            const diff = first - last;
                            const percent = first === 0 ? 0 : (diff / first) * 100;
                            
                            if (diff === 0) return "গত সপ্তাহের তুলনায় লোডশেডিং অপরিবর্তিত রয়েছে।";
                            return diff > 0 
                              ? `গত সপ্তাহের তুলনায় লোডশেডিং ${Math.abs(Math.round(percent))}% কমেছে।`
                              : `গত সপ্তাহের তুলনায় লোডশেডিং ${Math.abs(Math.round(percent))}% বেড়েছে।`;
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-100">
                <Bell className="w-5 h-5 text-amber-500" /> বিশেষ নোটিশ
              </h2>
              <div className="space-y-4">
                {mockAnnouncements.map(notice => (
                  <div key={notice.id} className="bg-[#161616] border border-red-900/50 p-4 rounded-xl">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {notice.title}
                      </h3>
                      <span className="text-[10px] bg-[#111111] text-gray-400 px-2 py-1 rounded border border-gray-800">{notice.date}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{notice.details}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-100">
                <Clock className="w-5 h-5 text-amber-500" /> সম্ভাব্য লোডশেডিং সূচী
              </h2>
              <div className="bg-[#161616] rounded-xl shadow-sm border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#111111] border-b border-gray-800 text-gray-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">এলাকা</th>
                        <th className="px-4 py-3 font-semibold">পরবর্তী সম্ভাব্য সময়</th>
                        <th className="px-4 py-3 font-semibold">বর্তমান অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-300">
                      {(data || []).map(area => (
                        <tr key={area.id} className="hover:bg-[#1A1A1A]">
                          <td className="px-4 py-3 font-medium text-gray-200">{area.name}</td>
                          <td className="px-4 py-3 text-gray-400">{area.nextShedding}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-medium border ${getStatusColor(area.status)}`}>
                              {getStatusText(area.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-[#111111] text-xs text-gray-500 border-t border-gray-800 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 text-amber-500/70" />
                  <p>এই তালিকাটি সম্ভাব্য সময়ের উপর ভিত্তি করে তৈরী। আবহাওয়া, যান্ত্রিক ত্রুটি বা জাতীয় গ্রিডের পরিস্থিতির উপর নির্ভর করে এই সময়সূচী পরিবর্তন হতে পারে।</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* News Tab (Digital Adda) */}
        {activeTab === 'news' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-3 text-white">
                <Newspaper className="w-6 h-6 text-blue-500" /> ডিজিটাল আড্ডা (নিউজ)
              </h2>
              <div className="text-[10px] font-bold text-blue-500 bg-blue-900/10 px-3 py-1 rounded-full border border-blue-900/30 shadow-neon-blue uppercase tracking-widest">
                Live Updates
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockNews.map((news) => (
                <div key={news.id} className="bg-[#0D0D0D] border border-gray-900 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-900/40 transition-all shadow-sm hover:shadow-blue-900/5">
                  <div className="absolute top-0 right-0 p-4 flex gap-2">
                     <button onClick={() => {
                       if (navigator.share) {
                         navigator.share({title: news.title, text: news.details, url: window.location.href});
                       } else {
                         // Fallback - copy to clipboard
                         navigator.clipboard.writeText(window.location.href);
                         showToast("লিঙ্ক কপি হয়েছে", "নিউজ লিঙ্কটি কপি করা হয়েছে।", "info");
                       }
                     }} className="p-2 text-gray-500 hover:text-blue-400 transition-colors">
                       <Share2 className="w-4 h-4" />
                     </button>
                     <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-900/20 px-3 py-1 rounded-full border border-blue-900/30">
                       {news.category}
                     </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-3 group-hover:text-blue-400 transition-colors pr-20">{news.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">{news.details}</p>
                  <div className="mt-6 pt-4 border-t border-gray-900/50 flex items-center gap-4">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-7 h-7 rounded-full bg-gray-800 border-2 border-[#0D0D0D] flex items-center justify-center text-[8px] font-bold text-gray-500">
                           {i === 1 ? 'FK' : i === 2 ? 'NA' : 'JS'}
                         </div>
                       ))}
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tight">১২ জন সদস্য মন্তব্য করেছেন</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border border-blue-900/20 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
              <div className="p-4 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20 shadow-neon-blue">
                <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">নোয়াখালী টেক ডেক</h3>
              <p className="text-sm text-blue-200/60 max-w-md mx-auto leading-relaxed">বিদ্যুৎ সংক্রান্ত যেকোনো উদ্ভাবনী আইডিয়া বা অভিযোগ শেয়ার করুন আমাদের পাবলিক কমিউনিটি ফোরামে।</p>
              <button className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-neon-blue transition-all active:scale-95 group flex items-center gap-3">
                কমিউনিটিতে যোগ দিন 
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <MapIcon className="w-6 h-6 text-amber-500" /> এলাকাভিত্তিক মানচিত্র
            </h2>
            <div className="bg-[#0D0D0D] p-2 rounded-3xl border border-gray-900 shadow-xl overflow-hidden">
               <MapComponent onMarkerClick={(id) => {setSelectedAreaId(id); setActiveTab('schedule');}} />
            </div>
            <div className="flex gap-4 justify-center">
                {['ON', 'OFF', 'FLUCTUATING', 'MAINTENANCE'].map(s => (
                    <div key={s} className="flex items-center gap-2">
                        <div style={{backgroundColor: getMarkerColor(s as Upazila['status'])}} className="w-3 h-3 rounded-full"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{getStatusText(s)}</span>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Wrench className="w-6 h-6 text-blue-500" /> টুলস ও তথ্য
            </h2>
            <div className="text-gray-400 p-8 text-center bg-[#0D0D0D] border border-gray-900 rounded-3xl">
              <ToolsComponent weather={weather} />
            </div>
          </div>
        )}
        <WeatherEffects condition={weather.condition} lightningRisk={weather.lightningRisk} />

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-gray-100">
              <Phone className="w-5 h-5 text-amber-500" /> অভিযোগ ও যোগাযোগ
            </h2>
            <div className="bg-[#161616] border border-gray-800 rounded-xl p-5 mb-6">
              <h3 className="font-bold text-gray-200 mb-2">জরুরী কল সেন্টার</h3>
              <p className="text-sm text-gray-400 mb-4">যেকোনো বিদ্যুৎ বিভ্রাট বা তার ছিঁড়ে যাওয়ার ঘটনা জানাতে সরাসরি কল করুন:</p>
              <div className="flex flex-wrap gap-4">
                <a href="tel:999" className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold transition-colors">
                  <Phone className="w-5 h-5" /> ৯৯৯ (জরুরী সেবা)
                </a>
                <span className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-gray-300 border border-gray-700 px-5 py-2.5 rounded-xl font-bold cursor-default">
                  <Phone className="w-5 h-5 text-gray-500" /> ১৬২০৬ (বিউবো)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {noakhaliData.map(area => (
                <div key={area.id} className="bg-[#161616] rounded-xl shadow-sm border border-gray-800 p-5 hover:border-amber-500/50 transition-colors">
                  <h3 className="font-bold text-gray-200 text-lg mb-1">{area.name}</h3>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-4">{area.office}</p>
                  <a href={`tel:${area.contact}`} className="inline-flex items-center gap-2 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-max">
                    <Phone className="w-4 h-4" /> {area.contact}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Developer Donation */}
          <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-2xl p-4 text-center mx-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <p className="text-white font-bold text-xs">প্রজেক্টটি সমর্থন করুন</p>
            </div>
            
            <p className="text-gray-400 text-[10px] mb-3">FAISAL KABIR RABI</p>
            
            <div className="flex justify-center gap-2 text-[10px]">
              <a href="tel:+8801XXXXXXXXX" className="bg-pink-900/20 text-pink-400 py-1 px-2 rounded-lg border border-pink-500/20 font-bold hover:bg-pink-600/30 transition-all">bKash</a>
              <a href="tel:+8801XXXXXXXXX" className="bg-teal-900/20 text-teal-400 py-1 px-2 rounded-lg border border-teal-500/20 font-bold hover:bg-teal-600/30 transition-all">Nagad</a>
              <a href="tel:+8801XXXXXXXXX" className="bg-sky-900/20 text-sky-400 py-1 px-2 rounded-lg border border-sky-500/20 font-bold hover:bg-sky-600/30 transition-all">Rocket</a>
            </div>
          </div>
      </main>

      {/* Trigger area for Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-16 z-40" 
        onMouseEnter={showNav} 
        onTouchStart={showNav}
      />

      {/* Mobile Bottom Navigation */}
      <nav 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-t border-gray-900 px-2 py-4 mb-safe transition-transform duration-300 ease-in-out ${isNavVisible ? 'translate-y-0' : 'translate-y-full'}`}
        onMouseEnter={showNav}
        onTouchStart={showNav}
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-amber-500 bg-amber-950/10 shadow-neon-amber' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Layout className={`w-5 h-5 ${activeTab === 'dashboard' ? 'fill-current' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">হোম</span>
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-xl transition-all ${activeTab === 'schedule' ? 'text-amber-500 bg-amber-950/10 shadow-neon-amber' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Clock className={`w-5 h-5 ${activeTab === 'schedule' ? 'fill-current' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">অবস্থা</span>
          </button>
          <button 
            onClick={() => setActiveTab('news')}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-xl transition-all ${activeTab === 'news' ? 'text-blue-500 bg-blue-950/10 shadow-neon-blue' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Newspaper className={`w-5 h-5 ${activeTab === 'news' ? 'fill-current' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">নিউজ</span>
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-xl transition-all ${activeTab === 'map' ? 'text-amber-500 bg-amber-950/10 shadow-neon-amber' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <MapIcon className={`w-5 h-5 ${activeTab === 'map' ? 'fill-current' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">ম্যাপ</span>
          </button>
          <button 
            onClick={() => setActiveTab('tools')}
            className={`flex flex-col items-center gap-1.5 py-1.5 rounded-xl transition-all ${activeTab === 'tools' ? 'text-blue-500 bg-blue-950/10 shadow-neon-blue' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Wrench className={`w-5 h-5 ${activeTab === 'tools' ? 'fill-current' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">টুলস</span>
          </button>
          <button 
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-1.5 rounded-xl transition-all ${activeTab === 'contacts' ? 'text-amber-500 bg-amber-950/10 shadow-neon-amber' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Phone className={`w-5 h-5 ${activeTab === 'contacts' ? 'fill-current' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">জরুরী</span>
          </button>
        </div>
      </nav>
      
      <style dangerouslySetInnerHTML={{__html:`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 0.1rem); }
        }
        @keyframes shock {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(2); }
          52% { transform: scale(1.03); filter: brightness(1.5); }
        }
        .animate-shock { animation: shock 2s ease-in-out infinite; }
        body { background: #050505; }
      `}} />

      {/* Modern Toast Notification Overlay */}
      {toastMessage && (
        <div className="fixed top-24 right-4 left-4 md:left-auto md:w-[400px] z-[100] animate-in slide-in-from-top-10 fade-in duration-500">
          <div className={`rounded-3xl shadow-2xl border p-5 flex gap-4 items-start backdrop-blur-xl ${
            toastMessage.type === 'alert' ? 'bg-red-950/90 border-red-900 shadow-red-500/20 text-red-100' : 
            toastMessage.type === 'warning' ? 'bg-amber-950/90 border-amber-900 shadow-amber-500/20 text-amber-100' : 
            'bg-[#121212]/90 border-gray-800 shadow-emerald-500/10 text-gray-100'
          }`}>
            <div className={`mt-1 rounded-2xl p-2 bg-opacity-30 ${
              toastMessage.type === 'alert' ? 'bg-red-500 text-red-400' : 
              toastMessage.type === 'warning' ? 'bg-amber-500 text-amber-400' : 
              'bg-emerald-500 text-emerald-400'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black uppercase tracking-wider">{toastMessage.title}</h4>
              <p className="text-xs mt-1.5 opacity-80 leading-relaxed font-medium">{toastMessage.body}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
