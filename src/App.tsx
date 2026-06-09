import { useState, useEffect } from "react";
import { AppSettings, WeightItem } from "./types";
import { defaultSettings, APP_VERSION, truckCapacities, VERSION_LOGS } from "./data";
import SlabCalculator from "./components/SlabCalculator";
import PileCalculator from "./components/PileCalculator";
import HollowCoreCalculator from "./components/HollowCoreCalculator";
import WeightCalculator from "./components/WeightCalculator";
import SettingsPanel from "./components/SettingsPanel";
import UniversalBatchCalculator from "./components/UniversalBatchCalculator";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  Scale,
  Settings,
  Hammer,
  Clock,
  ChevronRight,
  ChevronLeft,
  User,
  LayoutGrid,
  Zap,
  Package,
  Layers,
  Home,
  Sparkles,
  Truck,
  AlertTriangle,
  Cpu,
  History,
  Terminal,
  Activity,
} from "lucide-react";

const MenuCard = ({
  onClick,
  icon: Icon,
  title,
  description,
  badge,
}: {
  onClick: () => void;
  icon: any;
  title: string;
  description: string;
  badge?: string;
}) => (
  <motion.button
    whileHover={{ y: -6, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative overflow-hidden group text-left p-6 md:p-8 rounded-3xl border border-neutral-200 bg-white shadow-md hover:shadow-xl hover:border-red-600/40 transition-all duration-300 flex flex-col justify-between h-[240px] cursor-pointer"
  >
    {/* Tech draft decorations */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neutral-300 group-hover:border-red-600 transition" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neutral-300 group-hover:border-red-600 transition" />
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neutral-300 group-hover:border-red-600 transition" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neutral-300 group-hover:border-red-600 transition" />
    
    {/* Micro grid overlay in background */}
    <div className="absolute inset-0 bg-tech-grid opacity-20 group-hover:opacity-40 transition-opacity" />

    {/* Backdrop spotlight */}
    <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition" />

    <div className="relative z-10 flex items-start justify-between w-full">
      <div className="p-3 bg-neutral-50 text-[#C62828] rounded-2xl group-hover:bg-[#C62828] group-hover:text-white group-hover:premium-glow-red transition-all duration-300 w-fit border border-neutral-100 group-hover:border-transparent">
        <Icon size={26} className="transition-transform duration-300 group-hover:rotate-6" />
      </div>
      {badge && (
        <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-md tracking-wider uppercase animate-pulse">
          {badge}
        </span>
      )}
      <span className="text-[10px] font-mono font-bold text-neutral-300 group-hover:text-red-500 transition tracking-wider">
        SYS.CORE
      </span>
    </div>

    <div className="space-y-2 relative z-10">
      <h3 className="font-black font-display text-neutral-800 text-lg md:text-xl group-hover:text-red-600 transition flex items-center justify-between">
        <span>{title}</span>
        <div className="w-7 h-7 rounded-full bg-neutral-50 group-hover:bg-red-50 flex items-center justify-center transition border border-neutral-100 group-hover:border-red-100">
          <ChevronRight size={16} className="text-neutral-400 group-hover:text-red-600 translation transition-transform group-hover:translate-x-0.5" />
        </div>
      </h3>
      <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed line-clamp-2">{description}</p>
    </div>
  </motion.button>
);

export default function App() {
  // Navigation State
  // "menu", "price", "weight", "settings"
  const [currentScreen, setCurrentScreen] = useState<string>("menu");
  // Sub-tab inside Price category
  // "slab", "pile", "hollowCore"
  const [priceSubTab, setPriceSubTab] = useState<string>("slab");

  // Version and live update telemetry states
  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);
  const [sessionEditsCount, setSessionEditsCount] = useState<number>(0);

  // Load configuration from local storage, baked in state, or fallback to defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const baked = (window as any).BAKED_SETTINGS;
    if (baked && typeof baked === "object") {
      return {
        prices: { ...defaultSettings.prices, ...baked.prices },
        weights: { ...defaultSettings.weights, ...baked.weights },
      };
    }

    const saved = localStorage.getItem("pongsakulSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          prices: { ...defaultSettings.prices, ...parsed.prices },
          weights: { ...defaultSettings.weights, ...parsed.weights },
        };
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
    return defaultSettings;
  });

  // Fetch from Express server on mount + start real-time polling every 3 seconds
  useEffect(() => {
    const fetchSharedSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const cloudSettings = await res.json();
          if (cloudSettings && typeof cloudSettings === "object") {
            setSettings((prev) => {
              // Deep compare settings to prevent infinite state updates
              if (JSON.stringify(prev) !== JSON.stringify(cloudSettings)) {
                localStorage.setItem("pongsakulSettings", JSON.stringify(cloudSettings));
                return cloudSettings;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        // Fallback silently if offline or backend is initializing
      }
    };

    fetchSharedSettings();
    const syncInterval = setInterval(fetchSharedSettings, 3000);
    return () => clearInterval(syncInterval);
  }, []);

  // Global list of items inside Weight Calculator to preserve stats when switching screens
  const [weightItems, setWeightItems] = useState<WeightItem[]>([
    { id: "1", type: "slab", count: 10, length: 2.0 },
  ]);

  // Track live session updates dynamically to reflect real-time user actions
  useEffect(() => {
    setSessionEditsCount((prev) => prev + 1);
  }, [settings, weightItems]);

  // Real-time Logistics Calculations for the Global Telemetry Dashboard Bar
  const totalCargoWeight = weightItems.reduce((sum, item) => {
    const qty = item.count === "" ? 0 : item.count;
    const len = item.length === "" ? 1 : item.length;
    let unitMetersWeight = settings.weights.slab; // default fallback
    
    if (item.type === "fence3") unitMetersWeight = settings.weights.fence3;
    else if (item.type === "fence4") unitMetersWeight = settings.weights.fence4;
    else if (item.type === "hex") unitMetersWeight = settings.weights.hex;
    else if (item.type?.startsWith("i15")) unitMetersWeight = settings.weights.i15;
    else if (item.type?.startsWith("i18_no_tis") || item.type === "i18") unitMetersWeight = settings.weights.i18_no_tis;
    else if (item.type?.startsWith("i18_tis")) unitMetersWeight = settings.weights.i18_tis;
    else if (item.type?.startsWith("i22_no_tis") || item.type === "i22") unitMetersWeight = settings.weights.i22_no_tis;
    else if (item.type?.startsWith("i22_tis")) unitMetersWeight = settings.weights.i22_tis;
    else if (item.type?.startsWith("i26_no_tis") || item.type === "i26") unitMetersWeight = settings.weights.i26_no_tis;
    else if (item.type?.startsWith("i26_tis")) unitMetersWeight = settings.weights.i26_tis;
    else if (item.type?.startsWith("i30_no_tis") || item.type === "i30") unitMetersWeight = settings.weights.i30_no_tis;
    else if (item.type?.startsWith("i30_tis")) unitMetersWeight = settings.weights.i30_tis;
    else if (item.type?.startsWith("s18")) unitMetersWeight = settings.weights.s18;
    else if (item.type?.startsWith("s22")) unitMetersWeight = settings.weights.s22;
    else if (item.type?.startsWith("s26")) unitMetersWeight = settings.weights.s26;
    else if (item.type?.startsWith("s30")) unitMetersWeight = settings.weights.s30;
    else if (item.type?.startsWith("s35")) unitMetersWeight = settings.weights.s35;
    else if (item.type?.startsWith("s40")) unitMetersWeight = settings.weights.s40;
    else if (item.unitWeight) unitMetersWeight = item.unitWeight;
    
    return sum + (qty * len * unitMetersWeight);
  }, 0);

  // Match the absolute best-fit truck based on active accumulative weight
  let recommendedTruck = truckCapacities[0];
  for (const truck of truckCapacities) {
    if (totalCargoWeight <= truck.capacityKg) {
      recommendedTruck = truck;
      break;
    }
    recommendedTruck = truck; // fallback to absolute largest
  }

  const loadPercentage = recommendedTruck ? Math.min(100, (totalCargoWeight / recommendedTruck.capacityKg) * 100) : 0;
  const isOverweight = totalCargoWeight > truckCapacities[truckCapacities.length - 1].capacityKg;

  // Current Thai Date Formatted
  const thaiDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50/60 bg-tech-grid text-neutral-800 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Premium Crimson Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#C62828] bg-gradient-to-r from-[#C62828] via-[#B71C1C] to-[#991B1B] text-white shadow-lg border-b-2 border-amber-500/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-white/15 to-white/5 rounded-2xl border border-white/10 shadow-inner">
              <Cpu className="text-amber-400 animate-pulse stroke-[2.5]" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight font-display bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent uppercase">
                  PONGSAKUL HARDWARE
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded font-mono font-bold animate-pulse">
                  ONLINE
                </span>
              </div>
              <p className="text-xs font-light text-red-100 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                <button 
                  onClick={() => setIsVersionModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-neutral-950 text-[10px] font-black py-0.5 px-2 rounded-full border border-amber-300/30 flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-amber-900/20 cursor-pointer"
                  title="คลิกเพื่อดูบันทึกประวัติการปรับปรุงเวอร์ชัน"
                >
                  <History size={10} className="stroke-[3]" />
                  <span>{APP_VERSION}</span>
                </button>
                <span className="text-red-200">|</span>
                <span>เครื่องคำนวณราคาและประเมินพิกัดรถบรรส่งคอนกรีตอัดแรง</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-red-50 font-semibold md:ml-auto">
            {/* Live active engine transaction revision */}
            <button
              onClick={() => setIsVersionModalOpen(true)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 transition-all font-mono text-xs cursor-pointer text-left"
              title="ระบบตรวจพบการอัปเดตและปรับปรุงข้อมูล"
            >
              <Activity size={13} className="text-emerald-400 animate-pulse" />
              <span>REV:</span>
              <span className="text-amber-300 font-black font-mono">{APP_VERSION}.{sessionEditsCount}</span>
            </button>

            <span className="hidden md:inline-block border-l border-white/20 h-4" />
            <span className="flex items-center gap-1.5 opacity-90">
              <Clock size={15} className="text-amber-300" />
              {thaiDate}
            </span>
            <span className="hidden sm:inline-block border-l border-white/20 h-4" />
            <span className="flex items-center gap-1 opacity-80">
              <User size={14} className="text-amber-300" />
              pongsakul.co.th
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Space wrapper with container sizing */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8">
        
        {/* Dynamic Nav breadcrumbs if inside a subscreen */}
        {currentScreen !== "menu" && (
          <nav className="mb-6 flex items-center gap-2 text-xs md:text-sm font-semibold">
            <button
              onClick={() => setCurrentScreen("menu")}
              className="text-neutral-500 hover:text-[#C62828] transition flex items-center gap-1"
            >
              <LayoutGrid size={15} />
              เมนูหลัก
            </button>
            <ChevronRight size={14} className="text-neutral-300" />
            <span className="text-neutral-800">
              {currentScreen === "price" && "คำนวณราคาเดี่ยว"}
              {currentScreen === "scan" && "สแกนภาพและคำนวณหลายรายการ AI"}
              {currentScreen === "weight" && "คำนวณน้ำหนักรวมวิศวกรรม"}
              {currentScreen === "settings" && "ตั้งค่าตารางกลาง & ออกรายงาน"}
            </span>
          </nav>
        )}

        <AnimatePresence mode="wait">
          {currentScreen === "menu" ? (
            /* ========================================= */
            /* SCREEN 1: MAIN MENU (BENTO DASHBOARD)      */
            /* ========================================= */
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Beautiful Welcome and Hero Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-[#991B1B] to-[#7F1D1D] text-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_45%)] pointer-events-none" />
                <div className="space-y-3 relative z-10 text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/20">
                    <Zap size={12} className="text-amber-400 animate-pulse" />
                    ระบบสแตนด์บายทำงานแบบออฟไลน์ได้ 100%
                  </span>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight font-display bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent">
                    ระบบคำนวณงานแผ่นพื้นและเสาเข็มพงษ์สกุล
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-200 max-w-xl font-light leading-relaxed">
                    เครื่องมือสนับสนุนการขายและวิศวกรรมขนส่งโดยบริษัท พงษ์สกุลฮาร์ดแวร์ จำกัด ช่วยคำนวณราคาสั่งซื้อทั่วไปและ มอก. ตลอดจนช่วยคำนวณระเบียบน้ำหนักโครงสร้างเพื่อวางแผนจัดสรรยานพาหนะ
                  </p>
                </div>

              </div>

              {/* Bento menu matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <MenuCard
                  onClick={() => setCurrentScreen("price")}
                  icon={Calculator}
                  title="คำนวณราคาเดี่ยว"
                  description="คำนวณเฉพาะแผ่นพื้นสามัญ/มอก., เสาเข็ม I-Shape/สี่เหลี่ยม S-Piles หรือแผ่นพื้นกลวงกลมแยกเป็นรายการเดี่ยว"
                />
                <MenuCard
                  onClick={() => setCurrentScreen("scan")}
                  icon={Sparkles}
                  title="คำนวณหลายรายการ AI"
                  description="สแกนเอกสารด้วย AI, วางข้อความสเปก หรือแก้ไขแบบสเปรดชีตเพื่อทำใบประเมินราคาเสร็จสมบูรณ์ในหน้าเดียว"
                />
                <MenuCard
                  onClick={() => setCurrentScreen("weight")}
                  icon={Scale}
                  title="คำนวณระวางขนส่ง"
                  description="คำนวณระวางกองสะสมและจำลองน้ำหนักรวมเพื่อเทียบพิกัดตูดรถส่งของ ปลอดภัย สรรพสามิตไม่จับ 100%"
                />
                <MenuCard
                  onClick={() => setCurrentScreen("settings")}
                  icon={Settings}
                  title="ราคากลาง & แค็ตตาล็อก"
                  description={`ปรับแต่งราคารวมขนส่ง ปรับน้ำหนักผลิตภัณฑ์ และดาวน์โหลดโบรชัวร์รุ่นหลัก ${APP_VERSION} แค็ตตาล็อก`}
                />
              </div>

            </motion.div>
          ) : currentScreen === "price" ? (
            /* ========================================= */
            /* SCREEN 2: PRICE CALCULATIONS (3 SUB-TABS)  */
            /* ========================================= */
            <motion.div
              key="price"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Professional nested tab triggers */}
              <div className="bg-white p-2 rounded-2xl border border-neutral-150 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 w-fit">
                <button
                  onClick={() => setPriceSubTab("slab")}
                  className={`py-3 px-5 rounded-xl font-bold text-sm text-center transition flex items-center justify-center gap-2 ${
                    priceSubTab === "slab"
                      ? "bg-[#C62828] text-white shadow-sm"
                      : "text-neutral-500 hover:text-[#C62828] hover:bg-neutral-50"
                  }`}
                >
                  <Package size={16} />
                  แผ่นพื้นสำเร็จรูป
                </button>
                <button
                  onClick={() => setPriceSubTab("pile")}
                  className={`py-3 px-5 rounded-xl font-bold text-sm text-center transition flex items-center justify-center gap-2 ${
                    priceSubTab === "pile"
                      ? "bg-[#C62828] text-white shadow-sm"
                      : "text-neutral-500 hover:text-[#C62828] hover:bg-neutral-50"
                  }`}
                >
                  <Zap size={16} />
                  เสาเข็มคอนกรีต / เสารั้ว
                </button>
                <button
                  onClick={() => setPriceSubTab("hollowCore")}
                  className={`py-3 px-5 rounded-xl font-bold text-sm text-center transition flex items-center justify-center gap-2 ${
                    priceSubTab === "hollowCore"
                      ? "bg-[#C62828] text-white shadow-sm"
                      : "text-neutral-500 hover:text-[#C62828] hover:bg-neutral-50"
                  }`}
                >
                  <Layers size={16} />
                  แผ่นพื้นกลวง (Hollow Core)
                </button>
              </div>

              {/* Display correct price subtab */}
              {priceSubTab === "slab" && (
                <SlabCalculator 
                  settings={settings} 
                  weightItems={weightItems}
                  setWeightItems={setWeightItems}
                  onNavigateToWeight={() => setCurrentScreen("weight")}
                />
              )}
              {priceSubTab === "pile" && <PileCalculator settings={settings} />}
              {priceSubTab === "hollowCore" && <HollowCoreCalculator settings={settings} />}
            </motion.div>
          ) : currentScreen === "scan" ? (
            /* ========================================================= */
            /* SCREEN 2.5: UNIVERSAL AI SCAN & MULTI-PRODUCT ESTIMATOR  */
            /* ========================================================= */
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.18 }}
            >
              <UniversalBatchCalculator 
                settings={settings} 
                weightItems={weightItems}
                setWeightItems={setWeightItems} 
                onNavigateToWeight={() => setCurrentScreen("weight")}
              />
            </motion.div>
          ) : currentScreen === "weight" ? (
            /* ========================================= */
            /* SCREEN 3: WEIGHT ACCUMULATOR              */
            /* ========================================= */
            <motion.div
              key="weight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.18 }}
            >
              <WeightCalculator settings={settings} items={weightItems} setItems={setWeightItems} />
            </motion.div>
          ) : (
            /* ========================================= */
            /* SCREEN 4: GLOBAL SETTINGS & REPORT EXPORT  */
            /* ========================================= */
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.18 }}
            >
              <SettingsPanel settings={settings} setSettings={setSettings} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Professional Brand Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8 border-t border-neutral-800 text-xs sm:text-sm mt-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <span className="font-extrabold font-display text-white uppercase tracking-wider text-sm block">
              บริษัท พงษ์สกุลฮาร์ดแวร์ จำกัด
            </span>
            <p className="font-light text-neutral-500">
              ผู้ผลิตและจัดจำหน่ายแผ่นพื้นคอนกรีตอัดแรง แผ่นพื้นรูกลวง (Hollow Core) และเสาเข็มมาตรฐานอุตสาหกรรม มอก.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1.5 text-neutral-500 font-mono text-[11px]">
            <span>© {new Date().getFullYear()} Pongsakul Hardware. All Rights Reserved.</span>
            <span className="bg-neutral-800 text-neutral-400 py-0.5 px-2.5 rounded-full border border-neutral-700/50">
              ระบบพร้อมทำงานแบบออฟไลน์
            </span>
          </div>
        </div>
      </footer>

      {/* Real-time Logistics floating telemetry dashboard console */}
      {weightItems.length > 0 && totalCargoWeight > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-5 right-5 left-5 md:left-auto md:w-[380px] bg-neutral-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-neutral-800 z-50 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isOverweight ? "bg-red-500/25 text-red-100" : "bg-emerald-500/20 text-emerald-400 animate-pulse"}`}>
                <Truck size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-400 tracking-wider">สถานะการโหลดรถรวม</span>
                <span className="text-[11px] font-mono text-neutral-400 leading-none">
                  สะสม {weightItems.reduce((acc, current) => acc + (current.count === "" ? 0 : current.count), 0)} ชิ้นงาน
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-extrabold font-mono ${isOverweight ? "text-red-400" : "text-amber-400"}`}>
                {(totalCargoWeight / 1000).toFixed(2)} ตัน
              </span>
              <span className="text-[10px] text-neutral-500 block leading-none">/ {isOverweight ? "เกินพิกัดพ่วง" : recommendedTruck.label}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverweight
                    ? "bg-red-500 animate-pulse"
                    : loadPercentage > 85
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${loadPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-neutral-400">
              <span className="flex items-center gap-1">
                {isOverweight ? (
                  <>
                    <AlertTriangle size={11} className="text-red-400 animate-bounce" />
                    <span className="text-red-400 font-bold">⚠️ เกินพิกัดรถบรรทุกสูงสุด</span>
                  </>
                ) : (
                  <span>แนะนำ: {recommendedTruck.name}</span>
                )}
              </span>
              <span className="font-mono font-bold">{loadPercentage.toFixed(0)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => setWeightItems([])}
              className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold transition text-center text-neutral-300 cursor-pointer"
            >
              ล้างสะสม
            </button>
            <button
              onClick={() => setCurrentScreen("weight")}
              className="py-1.5 px-3 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-xs font-bold transition text-center text-white flex items-center justify-center gap-1 shadow-md shadow-[#C62828]/15 cursor-pointer"
            >
              <span>จัดระวางรถ 🚚</span>
            </button>
          </div>
        </motion.div>
      )}
      {/* High-Tech Version History & System Diagnostics Modal */}
      <AnimatePresence>
        {isVersionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-md"
            onClick={() => setIsVersionModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 text-white shadow-2xl p-6 md:p-8 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Technical drafting design marks */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500/50" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500/50" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500/50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500/50" />

              <div className="absolute top-[20px] right-[20px]">
                <button
                  type="button"
                  onClick={() => setIsVersionModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 font-bold flex items-center justify-center text-neutral-350 cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <Terminal size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display tracking-tight text-white flex items-center gap-2">
                    <span>ระบบบันทึกเวอร์ชันและสถานะข้อมูล</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">PONGSKUL SYSTEM REVISION INTERFACE</p>
                </div>
              </div>

              {/* Status and Active Diagnostics indicators */}
              <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 font-mono text-xs text-neutral-300">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 block uppercase">Core Version</span>
                  <span className="font-extrabold text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {APP_VERSION} (Active)
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 block uppercase">Session Updates</span>
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Rev {sessionEditsCount} Custom
                  </span>
                </div>
              </div>

              {/* Chronological list of product versions */}
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                <span className="text-[11px] font-bold text-neutral-500 flex items-center gap-1.5">
                  <History size={12} />
                  ประวัติการปรับปรุงระบบซอฟต์แวร์ (BUILD RELEASES):
                </span>
                <div className="space-y-3">
                  {VERSION_LOGS.map((log, index) => (
                    <div key={log.version} className={`p-3 rounded-xl border transition ${index === 0 ? "bg-amber-500/5 border-amber-500/25" : "bg-neutral-950/40 border-neutral-850"}`}>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${index === 0 ? "bg-amber-400 text-neutral-950 font-bold" : "bg-neutral-800 text-neutral-300"}`}>
                            {log.version}
                          </span>
                          {log.badge && (
                            <span className="text-[9px] font-bold text-amber-400 border border-amber-400/20 px-1.5 py-0.2 rounded uppercase animate-pulse">
                              {log.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono font-medium">{log.date}</span>
                      </div>
                      <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                        {log.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close prompt action */}
              <button
                onClick={() => setIsVersionModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold transition text-center shadow-lg cursor-pointer"
              >
                ยืนยันและยอมรับเงื่อนไขการปรับปรุง ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

