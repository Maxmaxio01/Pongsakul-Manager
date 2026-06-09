import { useState } from "react";
import { AppSettings } from "../types";
import { fmt } from "../utils";
import PileVisualizer from "./PileVisualizer";
import { Hammer } from "lucide-react";

interface PileCalculatorProps {
  settings: AppSettings;
}

export default function PileCalculator({ settings }: PileCalculatorProps) {
  const [pileType, setPileType] = useState<string>("hex");
  const [pileConnection, setPileConnection] = useState<string>("single");
  const [pileStandard, setPileStandard] = useState<string>("no_tis");
  const [pileLength, setPileLength] = useState<number | "">(2.0);
  const [pileCount, setPileCount] = useState<number | "">(10);

  const isI18OrI22 = pileType === "i18" || pileType === "i22";
  const hasStandardOption = pileType === "i18" || pileType === "i22" || pileType === "i26" || pileType === "i30";
  
  const isTis = hasStandardOption && pileStandard === "tis";
  const isJoint = isI18OrI22 && pileConnection === "joint";

  const calcPileLength = pileLength === "" ? 0 : pileLength;
  const calcPileCount = pileCount === "" ? 0 : pileCount;

  // Price & weight per meter deduction
  let pricePerMeter = 0;
  let weightPerMeter = 0;

  if (pileType === "i15") {
    pricePerMeter = settings.prices.i15Price;
    weightPerMeter = settings.weights.i15;
  } else if (pileType === "hex") {
    pricePerMeter = settings.prices.hexPilePrice;
    weightPerMeter = settings.weights.hex;
  } else if (pileType === "fence3") {
    pricePerMeter = settings.prices.fence3Price;
    weightPerMeter = settings.weights.fence3;
  } else if (pileType === "fence4") {
    pricePerMeter = settings.prices.fence4Price;
    weightPerMeter = settings.weights.fence4;
  } else if (pileType === "i18") {
    weightPerMeter = isTis ? settings.weights.i18_tis : settings.weights.i18_no_tis;
    if (isJoint) {
      pricePerMeter = isTis ? settings.prices.i18TISJointPrice : settings.prices.i18JointPrice;
    } else {
      pricePerMeter = isTis ? settings.prices.i18TISPrice : settings.prices.i18NoTISPrice;
    }
  } else if (pileType === "i22") {
    weightPerMeter = isTis ? settings.weights.i22_tis : settings.weights.i22_no_tis;
    if (isJoint) {
      pricePerMeter = isTis ? settings.prices.i22TISJointPrice : settings.prices.i22JointPrice;
    } else {
      pricePerMeter = isTis ? settings.prices.i22TISPrice : settings.prices.i22NoTISPrice;
    }
  } else if (pileType === "i26") {
    pricePerMeter = isTis ? settings.prices.i26TISPrice : settings.prices.i26NoTISPrice;
    weightPerMeter = isTis ? settings.weights.i26_tis : settings.weights.i26_no_tis;
  } else if (pileType === "i30") {
    pricePerMeter = isTis ? settings.prices.i30TISPrice : settings.prices.i30NoTISPrice;
    weightPerMeter = isTis ? settings.weights.i30_tis : settings.weights.i30_no_tis;
  } else if (pileType === "s18") {
    pricePerMeter = settings.prices.s18Price;
    weightPerMeter = settings.weights.s18;
  } else if (pileType === "s22") {
    pricePerMeter = settings.prices.s22Price;
    weightPerMeter = settings.weights.s22;
  } else if (pileType === "s26") {
    pricePerMeter = settings.prices.s26Price;
    weightPerMeter = settings.weights.s26;
  } else if (pileType === "s30") {
    pricePerMeter = settings.prices.s30Price;
    weightPerMeter = settings.weights.s30;
  } else if (pileType === "s35") {
    pricePerMeter = settings.prices.s35Price;
    weightPerMeter = settings.weights.s35;
  } else if (pileType === "s40") {
    pricePerMeter = settings.prices.s40Price;
    weightPerMeter = settings.weights.s40;
  }

  const pricePerPile = pricePerMeter * calcPileLength;
  const totalPrice = pricePerPile * calcPileCount;
  const totalWeight = weightPerMeter * calcPileLength * calcPileCount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Input controls */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100">
            <div className="p-2 bg-red-50 text-[#C62828] rounded-lg">
              <Hammer size={18} />
            </div>
            <h3 className="font-semibold text-neutral-800 text-lg">สเปคเสาเข็ม / เสารั้ว</h3>
          </div>

          <div className="space-y-4">
            {/* Pile Type option list */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700">ชนิดและขนาดเสาเข็ม</label>
              <select
                value={pileType}
                onChange={(e) => setPileType(e.target.value)}
                className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 transition border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
              >
                <optgroup label="เสาเข็มไอ (I-Shape Pile)">
                  <option value="i15">เสาเข็มไอ I-15</option>
                  <option value="i18">เสาเข็มไอ I-18</option>
                  <option value="i22">เสาเข็มไอ I-22</option>
                  <option value="i26">เสาเข็มไอ I-26</option>
                  <option value="i30">เสาเข็มไอ I-30</option>
                </optgroup>
                <optgroup label="เสาสี่เหลี่ยมตัน (Solid Square Pile) - ใหม่ ✨">
                  <option value="s18">เสาสี่เหลี่ยมตัน S-18</option>
                  <option value="s22">เสาสี่เหลี่ยมตัน S-22</option>
                  <option value="s26">เสาสี่เหลี่ยมตัน S-26</option>
                  <option value="s30">เสาสี่เหลี่ยมตัน S-30</option>
                  <option value="s35">เสาสี่เหลี่ยมตัน S-35</option>
                  <option value="s40">เสาสี่เหลี่ยมตัน S-40</option>
                </optgroup>
                <optgroup label="เสาเข็มประเภทอื่นๆ & เสารั้ว">
                  <option value="hex">เสาเข็ม หกเหลี่ยมกลวง</option>
                  <option value="fence3">เสารั้วลวดหนาม 3"</option>
                  <option value="fence4">เสารั้วลวดหนาม 4"</option>
                </optgroup>
              </select>
            </div>

            {/* Connection option for I18 / I22 */}
            {isI18OrI22 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-700">ลักษณะท่อนเสาเข็ม</label>
                <select
                  value={pileConnection}
                  onChange={(e) => setPileConnection(e.target.value)}
                  className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 transition border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                >
                  <option value="single">ท่อนเดียว (Single Pile)</option>
                  <option value="joint">ท่อนต่อเชื่อมหูสลัก (Joint Pile)</option>
                </select>
              </div>
            )}

            {/* Standard specifications TIS / Normal */}
            {hasStandardOption && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-700">มาตรฐานการรองรับ</label>
                <select
                  value={pileStandard}
                  onChange={(e) => setPileStandard(e.target.value)}
                  className="w-full p-3 bg-neutral-50 hover:bg-neutral-100 transition border border-neutral-200 rounded-xl font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-[#C62828]"
                >
                  <option value="no_tis">เกรดธรรมดาทั่วไป (ไม่มีสัญลักษณ์ มอก.)</option>
                  <option value="tis">เกรดผ่านรับรองมาตรฐาน มอก. (TIS Standard)</option>
                </select>
              </div>
            )}

            {/* Pole length input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700 flex justify-between">
                <span>ความยาวเสาต่อท่อน (เมตร)</span>
                <span className="text-xs text-neutral-500 font-mono">ใส่แบบทศนิยมได้</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={pileLength}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPileLength(val === "" ? "" : parseFloat(val));
                  }}
                  step="0.1"
                  className="w-full p-3 pr-12 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition-all-custom"
                  placeholder="เช่น 2.0"
                />
                {pileLength !== "" && (
                  <button
                    type="button"
                    onClick={() => setPileLength("")}
                    className="absolute right-3.5 top-3.5 text-xs text-neutral-400 hover:text-[#C62828] font-bold transition"
                  >
                    ล้าง
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {[2.0, 3.0, 4.0, 6.0, 8.0, 10.0, 12.0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPileLength(preset)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                      pileLength === preset
                        ? "bg-[#C62828] text-white border-transparent shadow-[#C62828]/20 shadow-sm scale-102"
                        : "bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {preset.toFixed(1)} ม.
                  </button>
                ))}
              </div>
            </div>

            {/* Pile count */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-700">จำนวนเสาเข็ม/เสารั้วที่สั่งซื้อ (ต้น)</label>
              <input
                type="number"
                value={pileCount}
                onChange={(e) => {
                  const val = e.target.value;
                  setPileCount(val === "" ? "" : parseInt(val));
                }}
                step="1"
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition-all-custom"
                placeholder="เช่น 10"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {[5, 10, 20, 30, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPileCount(preset)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                      pileCount === preset
                        ? "bg-[#C62828] text-white border-transparent shadow-[#C62828]/20 shadow-sm scale-102"
                        : "bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {preset} ต้น
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic visual representation */}
        <PileVisualizer pileType={pileType} isJoint={isJoint} isTis={isTis} length={calcPileLength} />
      </div>

      {/* Summary box outputs */}
      <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
        <div className="bg-gradient-to-br from-[#E53935] to-[#B71C1C] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between h-full min-h-[350px]">
          <div>
            <span className="text-xs font-semibold bg-white/20 text-white py-1 px-3 rounded-full uppercase tracking-wider">
              ผลการประมาณราคาเสาเข็ม
            </span>
            <div className="mt-6">
              <span className="text-lg opacity-85 block">ยอดราคารวมสุทธิ</span>
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                ฿{fmt(totalPrice)}
              </span>
              <span className="text-sm opacity-85 block mt-2 font-light">
                (รายละเอียด: {calcPileCount} ต้น ท่อนละ {calcPileLength.toFixed(2)} เมตร)
              </span>
            </div>
          </div>

          <div className="border-t border-white/20 pt-5 mt-6 space-y-3 font-light text-neutral-100">
            <div className="flex justify-between items-center text-sm">
              <span>อัตราค่าเสาเฉลี่ย:</span>
              <strong className="text-white font-semibold">฿{fmt(pricePerMeter)} / เมตร</strong>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>เกรดมาตรฐานรับรอง:</span>
              <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded text-xs">
                {isTis ? "มอก. (TIS Approved)" : "ธรรมดาทั่วไป"}
              </span>
            </div>
            {isI18OrI22 && (
              <div className="flex justify-between items-center text-sm">
                <span>รูปแบบโครงสร้างการเชื่อม:</span>
                <strong className="text-white font-medium">{isJoint ? "ใช้แผ่นเหล็กเชื่อมต่อหัว" : "ท่อนชิ้นเดียวยาวตลอด"}</strong>
              </div>
            )}
            <div className="flex justify-between items-center text-sm border-t border-white/15 pt-2">
              <span>ราคาต่อหนึ่งต้นเสา:</span>
              <strong className="text-white font-semibold text-base">฿{fmt(pricePerPile)}</strong>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>ประมาณการน้ำหนักสุทธิ:</span>
              <span className="text-amber-300 font-bold text-base">{fmt(totalWeight)} กก.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
