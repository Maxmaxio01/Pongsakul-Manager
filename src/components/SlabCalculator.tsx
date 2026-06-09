import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { AppSettings, WeightItem } from "../types";
import { fmt, getLoadCapacity, roundToBeautifulPrice } from "../utils";
import { loadCapacityTable } from "../data";
import SlabVisualizer from "./SlabVisualizer";
import { 
  Check, 
  Info, 
  Hammer, 
  Sparkles, 
  Calculator, 
  Copy
} from "lucide-react";
import { motion } from "motion/react";

interface SlabCalculatorProps {
  settings: AppSettings;
  weightItems?: WeightItem[];
  setWeightItems?: Dispatch<SetStateAction<WeightItem[]>>;
  onNavigateToWeight?: () => void;
}

export default function SlabCalculator({ 
  settings,
  weightItems,
  setWeightItems,
  onNavigateToWeight
}: SlabCalculatorProps) {

  // Auto round prices state (sharing via localStorage)
  const [autoRoundPrice, setAutoRoundPrice] = useState<boolean>(() => {
    return localStorage.getItem("pongsakulAutoRoundPrice") === "true";
  });

  const [copiedSingle, setCopiedSingle] = useState(false);

  const handleCopySinglePrice = (val: number) => {
    navigator.clipboard.writeText(String(val));
    setCopiedSingle(true);
    setTimeout(() => setCopiedSingle(false), 1200);
  };

  const toggleAutoRoundPrice = () => {
    const newVal = !autoRoundPrice;
    setAutoRoundPrice(newVal);
    localStorage.setItem("pongsakulAutoRoundPrice", String(newVal));
    // Dispatch custom storage event so other mounted components can sync immediately if needed
    window.dispatchEvent(new Event("storage_round_price"));
  };

  useEffect(() => {
    const syncVal = () => {
      setAutoRoundPrice(localStorage.getItem("pongsakulAutoRoundPrice") === "true");
    };
    window.addEventListener("storage_round_price", syncVal);
    return () => window.removeEventListener("storage_round_price", syncVal);
  }, []);

  // --- SINGLE SLAB STATE ---
  const [boardType, setBoardType] = useState<string>("normal");
  const [customPrice, setCustomPrice] = useState<number | "">(0);
  const [length, setLength] = useState<number | "">(2.0);
  const [autoWireAdjust, setAutoWireAdjust] = useState<boolean>(true);
  const [wireCount, setWireCount] = useState<string>("4");
  const [totalArea, setTotalArea] = useState<number | "">(10.0);

  // Auto adjust wire count based on length
  useEffect(() => {
    if (autoWireAdjust) {
      const len = length === "" ? 0 : length;
      if (len <= 3.0) {
        setWireCount("4");
      } else if (len <= 4.0) {
        setWireCount("5");
      } else {
        setWireCount("7");
      }
    }
  }, [length, autoWireAdjust]);

  // Calculations for Single Slab
  const calcLength = length === "" ? 0 : length;
  const calcCustomPrice = customPrice === "" ? 0 : customPrice;
  const calcTotalArea = totalArea === "" ? 0 : totalArea;

  let step = 0;
  if (boardType === "normal" || boardType === "custom") {
    const basePrice = boardType === "custom" ? calcCustomPrice : settings.prices.normalBoardPrice;
    if (wireCount === "4") step = basePrice;
    else if (wireCount === "5") step = basePrice + 10;
    else if (wireCount === "6") step = basePrice + 20;
    else if (wireCount === "7") step = basePrice + 35;
    else if (wireCount === "8") step = basePrice + 55;
    else if (wireCount === "5_mm_5") step = settings.prices.normalBoardPrice + 55;
  } else if (boardType === "m.o.c" || boardType === "m.o.c_custom") {
    const basePrice = boardType === "m.o.c_custom" ? calcCustomPrice : settings.prices.mocBoardPrice;
    if (wireCount === "4") step = basePrice;
    else if (wireCount === "5") step = basePrice + 15;
    else if (wireCount === "6") step = basePrice + 30;
    else if (wireCount === "7") step = basePrice + 50;
    else if (wireCount === "8") step = basePrice + 75;
    else if (wireCount === "5_mm_5") step = settings.prices.mocBoardPrice + 75;
  }

  const rawFinalPrice = 0.35 * step * calcLength;
  const finalPrice = autoRoundPrice ? roundToBeautifulPrice(rawFinalPrice) : rawFinalPrice;
  const boardArea = 0.35 * calcLength;
  const boardCount = boardArea > 0 ? Math.ceil(calcTotalArea / boardArea) : 0;

  const weightPerMeter = settings.weights.slab;
  const totalWeight = weightPerMeter * calcLength * boardCount;

  const loadCapacity = getLoadCapacity(calcLength, wireCount);
  const colKeys = Object.keys(loadCapacityTable).map(Number).sort((a, b) => a - b);
  const rowLabels = ["4", "5", "6", "7", "8"];

  const getHighlightStatus = (rLabel: string, cKey: number) => {
    const wireIndexMap: Record<string, number> = { "4": 0, "5": 1, "6": 2, "7": 3, "8": 4 };
    let currentIdx = wireIndexMap[wireCount] !== undefined ? wireIndexMap[wireCount] : (wireCount === "5_mm_5" ? 4 : 0);
    const mappedRowIdx = wireIndexMap[rLabel];

    let closestLengthKey = colKeys.find((key) => key >= calcLength);
    if (!closestLengthKey) closestLengthKey = colKeys[colKeys.length - 1];
    else if (calcLength < colKeys[0]) closestLengthKey = colKeys[0];

    const isRowMatch = currentIdx === mappedRowIdx;
    const isColMatch = closestLengthKey === cKey;

    if (isRowMatch && isColMatch) return "activeCell";
    if (isRowMatch) return "rowMatch";
    if (isColMatch) return "colMatch";
    return "none";
  };

  return (
    <div className="space-y-6">
      
      {/* Selector header bar with Auto-Round Price Option */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-3 rounded-2xl border border-neutral-150 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-50 text-[#C62828] rounded-xl border border-red-100">
            <Calculator size={16} />
          </div>
          <div>
            <h3 className="font-bold text-neutral-800 text-sm">แผ่นพื้นสำเร็จรูปพงษ์สกุล</h3>
            <p className="text-[11px] text-neutral-500">คำนวณราคากลางแผ่นเดี่ยวและแสดงตารางพิกัดกำลังรับน้ำหนักปลอดภัย</p>
          </div>
        </div>

        {/* Beautiful Auto-Round Price Toggle Button */}
        <button
          onClick={toggleAutoRoundPrice}
          className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold border transition duration-150 shadow-sm cursor-pointer w-full sm:w-auto ${
            autoRoundPrice
              ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-600"
              : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600"
          }`}
          title="ปัดเศษราคาขึ้นให้ลงท้ายด้วย 5 หรือ 0 เพื่อราคาสุดสวยงามในการเสนอราคาลูกค้า"
        >
          <Sparkles size={14} className={autoRoundPrice ? "animate-spin text-white" : "text-amber-500"} />
          <span>🪄 ปรับราคาสวยอัตโนมัติ (ปัดขึ้นลงท้าย 5/0): {autoRoundPrice ? "เปิดใช้งาน ✅" : "ปิดอยู่ ❌"}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100">
                <div className="p-2 bg-red-50 text-[#C62828] rounded-lg">
                  <Hammer size={18} />
                </div>
                <h3 className="font-semibold text-neutral-800 text-lg">ข้อมูลการคำนวณแผ่นพื้นเดี่ยว</h3>
              </div>

              <div className="space-y-4">
                {/* Board Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-neutral-700">ชนิดแผ่นพื้น</label>
                  <select
                    value={boardType}
                    onChange={(e) => setBoardType(e.target.value)}
                    className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 transition border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <option value="normal">แผ่นพื้นธรรมดา</option>
                    <option value="m.o.c">แผ่นพื้น มอก. (TIS)</option>
                    <option value="custom">แผ่นพื้นธรรมดา (กำหนดราคาเอง)</option>
                    <option value="m.o.c_custom">แผ่นพื้น มอก. (กำหนดราคาเอง)</option>
                  </select>
                </div>

                {/* Custom price inputs if boardType has custom prefix */}
                {(boardType === "custom" || boardType === "m.o.c_custom") && (
                  <div className="flex flex-col gap-1.5 bg-red-50/50 p-4 rounded-xl border border-red-100">
                    <label className="text-sm font-semibold text-[#8B0000]">ราคานำเข้า (บาท/ตร.ม. ไม่รวมลวด ตั้งต้น)</label>
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomPrice(val === "" ? "" : parseFloat(val));
                      }}
                      className="w-full p-3 bg-white border border-red-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                      placeholder="ใส่ราคาตั้งต้นเอง"
                    />
                  </div>
                )}

                {/* Length input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-neutral-700 flex justify-between">
                    <span>ความยาวแผ่น (เมตร)</span>
                    <span className="text-xs text-neutral-500 font-mono">ขอบเขตแนะนำ: 1.0 - 5.0 ม.</span>
                  </label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLength(val === "" ? "" : parseFloat(val));
                    }}
                    step="0.1"
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                    placeholder="เช่น 2.0"
                  />
                </div>

                {/* Toggle switch for auto wire alignment */}
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-150 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-800">การปรับจำนวนลวดอัตโนมัติ</span>
                    <span className="text-xs text-neutral-500">
                      {autoWireAdjust ? "อ้างอิงกำลังรับตามความยาวแผ่น" : "กำหนดค่าด้วยตนเองทีละสเปค"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoWireAdjust(!autoWireAdjust)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoWireAdjust ? "bg-[#C41C1C]" : "bg-neutral-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        autoWireAdjust ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Wire Count Select List */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-neutral-700">จำนวนลวดสายอัดแรง (PC Wire)</label>
                  <select
                    disabled={autoWireAdjust}
                    value={wireCount}
                    onChange={(e) => setWireCount(e.target.value)}
                    className={`w-full p-3 border rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 ${
                      autoWireAdjust
                        ? "bg-neutral-150 border-neutral-200 text-neutral-400 cursor-not-allowed"
                        : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    <option value="4">ลวด 4 เส้น (เล็ก)</option>
                    <option value="5">ลวด 5 เส้น</option>
                    <option value="6">ลวด 6 เส้น</option>
                    <option value="7">ลวด 7 เส้น (ใหญ่)</option>
                    <option value="8">ลวด 8 เส้น</option>
                    <option value="5_mm_5">ลวด 5 มม. (5 เส้น)</option>
                  </select>
                  {autoWireAdjust && (
                    <span className="text-xs text-[#C62828] font-medium flex items-center gap-1">
                      <Check size={12} /> โหมดอัตโนมัติเลือกให้เป็น {wireCount === "5_mm_5" ? "ลวด 5 มม." : `ลวด ${wireCount} เส้น`}
                    </span>
                  )}
                </div>

                {/* Total Area */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-neutral-700">
                    พื้นที่ติดตั้งรวมที่ต้องการทั้งหมด (ตร.ม.)
                  </label>
                  <input
                    type="number"
                    value={totalArea}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTotalArea(val === "" ? "" : parseFloat(val));
                    }}
                    step="0.1"
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                    placeholder="เช่น 10.0"
                  />
                </div>
              </div>
            </div>

            {/* SVG Visual Model Projection inside Slab */}
            <SlabVisualizer length={length} wireCount={wireCount} />
          </div>

          {/* Calculation Summary Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-[#E53935] to-[#B71C1C] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between h-full min-h-[350px]">
              <div>
                <span className="text-xs font-semibold bg-white/20 text-white py-1 px-3 rounded-full uppercase tracking-wider">
                  ผลการคำนวณแผ่นพื้น
                </span>
                <div className="mt-6">
                  <span className="text-lg opacity-85 block">ราคาต่อแผ่น</span>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                      ฿{fmt(finalPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopySinglePrice(finalPrice)}
                      className={`p-2 rounded-xl transition duration-150 flex items-center justify-center cursor-pointer ${
                        copiedSingle
                          ? "bg-white/20 text-emerald-300 scale-105"
                          : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
                      }`}
                      title={`คัดลอกราคาต่อแผ่น (฿${fmt(finalPrice)})`}
                    >
                      {copiedSingle ? <Check size={16} className="stroke-[3]" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <span className="text-lg opacity-85 block mt-1 font-light">
                    (กว้าง 35 ซม. x ยาว {length.toFixed(2)} เมตร)
                  </span>
                </div>
              </div>

              <div className="border-t border-white/20 pt-5 mt-6 space-y-3 font-light text-neutral-100">
                <div className="flex justify-between items-center text-sm">
                  <span>สเปคลวดแผ่นพื้น:</span>
                  <strong className="text-white font-semibold">
                    {wireCount === "5_mm_5" ? "ลวด 5 มม. (5 เส้น)" : `ลวด PC ${wireCount} เส้น`}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>อัตราประมาณการ (Step):</span>
                  <strong className="text-white font-semibold">฿{fmt(step)} / ตร.ม.</strong>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>ความสามารถการรับน้ำหนักสูงสุด:</span>
                  <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                    {loadCapacity > 0 ? `${loadCapacity} กก./ตร.ม.` : "ไม่แสดงตามตาราง"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>จำนวนแผ่นที่แนะนำ:</span>
                  <strong className="text-white font-semibold text-base">{boardCount} แผ่น</strong>
                </div>
                <div className="flex justify-between items-center text-xs opacity-75">
                  <span>(ครอบคลุมพื้นที่ {fmt(totalArea)} ตร.ม. แผ่นละ {fmt(boardArea)} ตร.ม.)</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-white/15 pt-2">
                  <span>ประมาณการน้ำหนักรวมทั้งหมด:</span>
                  <strong className="text-amber-300 font-bold text-base">{fmt(totalWeight)} กก.</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Load Table Section (PONGSAKUL CONCRETE) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Info className="text-neutral-500" size={18} />
              <h4 className="font-semibold text-[#8B0000] text-sm md:text-base">
                ตารางกำหนดพิกัดแรงแบกทานสูงสุด (กก./ตร.ม.) - PONGSAKUL CONCRETE
              </h4>
            </div>
            <span className="text-xs text-neutral-400 font-medium hidden sm:inline-block">ไฮไลท์สอดคล้องสเปคปัจจุบันป้อนเข้า</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-150">
            <table className="min-w-full text-center text-xs font-sans">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-150 text-neutral-600 font-semibold font-sans">
                  <th className="py-3 px-2 border-r border-neutral-150 bg-neutral-100 font-bold font-sans">ลวด PC (เส้น)</th>
                  {colKeys.map((key) => {
                    let closestLengthKey = colKeys.find((k) => k >= length);
                    if (!closestLengthKey) closestLengthKey = colKeys[colKeys.length - 1];
                    else if (length < colKeys[0]) closestLengthKey = colKeys[0];
                    const isCurrentCol = closestLengthKey === key;
                    return (
                      <th
                        key={key}
                        className={`py-3 px-2 border-r border-neutral-150 min-w-[50px] font-mono ${
                          isCurrentCol ? "bg-red-50 text-[#C62828] font-bold ring-2 ring-red-500/10" : ""
                        }`}
                      >
                        {key.toFixed(2)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rowLabels.map((rLabel, rowIndex) => {
                  return (
                    <tr key={rLabel} className="border-b last:border-b-0 border-neutral-150 hover:bg-neutral-50/50">
                      <td className="py-2.5 px-2 border-r border-neutral-150 bg-neutral-50 font-semibold text-neutral-700 text-[13px]">
                        {rLabel} เส้น
                      </td>
                      {colKeys.map((cKey) => {
                        const capacities = loadCapacityTable[cKey];
                        const val = capacities ? capacities[rowIndex] : 0;
                        const cellStatus = getHighlightStatus(rLabel, cKey);

                        let cellClass = "text-neutral-500";
                        if (cellStatus === "activeCell") {
                          cellClass = "bg-[#C62828] text-white font-extrabold ring-4 ring-[#C62828]/20 scale-102 shadow-sm rounded-md transition-all";
                        } else if (cellStatus === "rowMatch") {
                          cellClass = "bg-red-50/60 text-[#C62828] font-medium";
                        } else if (cellStatus === "colMatch") {
                          cellClass = "bg-neutral-100 text-neutral-800 font-medium";
                        }

                        return (
                          <td
                            key={cKey}
                            className={`py-2 px-1 border-r border-neutral-150 font-mono text-center text-xs transition ${cellClass}`}
                          >
                            {val === 0 || val === undefined ? "-" : val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400 font-light italic">
            <span>*พิกัดมาตรฐานความปลอดภัย (Safety Weight Factors) อ้างอิงตามสัญญารับมอบการผลิตโรงงาน</span>
            <span>หน่วยวัดความยาวเป็นเมตร (ม.) และความจุแบกทานเป็น กก./ตร.ม.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
