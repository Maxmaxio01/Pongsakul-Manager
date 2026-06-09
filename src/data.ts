import { AppSettings } from "./types";

export const APP_VERSION = "V.35";

export interface VersionChange {
  version: string;
  date: string;
  desc: string;
  badge?: string;
}

export const VERSION_LOGS: VersionChange[] = [
  { version: "V.35", date: "08/06/2026", desc: "เพิ่มการรองรับการติดตั้งและ Deploy บน Render.com อย่างสมบูรณ์แบบ ควบคุมพอร์ตตามพิกัดไดนามิก พร้อมติดตั้งเชื่อมต่อระบบการทำงานกับคีย์ Gemini API แบบคลาวด์", badge: "ปรับปรุงล่าสุด" },
  { version: "V.34", date: "08/06/2026", desc: "ยิกระดับ UX/UI สู่ดีไซน์ไฮเทค คอนกรีตดราฟต์โมเดล, ธีมวิศวกรรมเรืองแสงแบบล้ำยุค (Premium Glassmorphism Glow) และ HUD คอนโซลขนส่ง" },
  { version: "V.33", date: "07/06/2026", desc: "เพิ่มแถบทางเลือกตัวเลือกความยาวแผ่นระบบสัมผัสความเร็วสูง และลวดพรีสเตรสอัตโนมัติ" },
  { version: "V.32", date: "04/06/2026", desc: "ปรับปรุงหน้าวิเคราะห์จำลองน้ำหนัก และภาพวาดมิติเสาเข็มพร้อมค่าเว้นระยะปลอดภัย" },
  { version: "V.31", date: "01/06/2026", desc: "ฟังก์ชันสแกนด้วย AI วิเคราะห์ใบรายการส่งของด้วยรูปแบบกล่องข้อความอัจฉริยะ" }
];

export const defaultSettings: AppSettings = {
  prices: {
    normalBoardPrice: 195,
    mocBoardPrice: 230,
    i15Price: 85,
    // I-18
    i18NoTISPrice: 110,
    i18TISPrice: 135,
    i18JointPrice: 130,
    i18TISJointPrice: 150,
    // I-22
    i22NoTISPrice: 155,
    i22TISPrice: 175,
    i22JointPrice: 165,
    i22TISJointPrice: 185,
    // Others
    i26NoTISPrice: 185,
    i26TISPrice: 235,
    i30NoTISPrice: 215,
    i30TISPrice: 285,
    hexPilePrice: 65,
    // S-Piles default prices
    s18Price: 135,
    s22Price: 180,
    s26Price: 240,
    s30Price: 320,
    s35Price: 420,
    s40Price: 530,
    fence3Price: 60,
    fence4Price: 75,
    hcPriceSqm: 655,
    vatPercent: 7,
  },
  weights: {
    slab: 42.0,
    fence3: 14.0,
    fence4: 24.0,
    hex: 35.0,
    // I-Piles
    i15: 35.0,
    i18_no_tis: 68.0,
    i18_tis: 72.0,
    i22_no_tis: 105.0,
    i22_tis: 110.0,
    i26_no_tis: 145.0,
    i26_tis: 155.0,
    i30_no_tis: 195.0,
    i30_tis: 210.0,
    i35: 250.0,
    i40: 310.0,
    // S-Piles
    s18: 78.0,
    s22: 117.0,
    s26: 163.0,
    s30: 216.0,
    s35: 275.0,
    s40: 350.0,
  },
};

export const loadCapacityTable: Record<number, number[]> = {
  2.00: [600, 0, 0, 0, 0],
  3.00: [500, 600, 670, 770, 0],
  3.40: [300, 500, 560, 630, 0],
  3.75: [0, 360, 400, 480, 0],
  3.80: [0, 300, 380, 470, 0],
  4.00: [0, 280, 300, 400, 0],
  4.20: [0, 250, 290, 300, 0],
  4.40: [0, 0, 260, 290, 300],
  4.50: [0, 0, 250, 260, 290],
  4.80: [0, 0, 0, 250, 270],
  4.90: [0, 0, 0, 220, 250],
  5.00: [0, 0, 0, 200, 250],
};

export const weightOptions = [
  { value: "slab", label: "แผ่นพื้นสำเร็จรูป", weightKey: "slab" as const },
  { value: "fence3", label: "เสารั้ว 3\"", weightKey: "fence3" as const },
  { value: "fence4", label: "เสารั้ว 4\"", weightKey: "fence4" as const },
  { value: "hex", label: "เสาเข็ม หกเหลี่ยม", weightKey: "hex" as const },
  { value: "i15", label: "เสาเข็ม I-15", weightKey: "i15" as const },
  { value: "i18_no_tis", label: "เสาเข็ม I-18 (ธรรมดา)", weightKey: "i18_no_tis" as const },
  { value: "i18_tis", label: "เสาเข็ม I-18 (มอก.)", weightKey: "i18_tis" as const },
  { value: "i22_no_tis", label: "เสาเข็ม I-22 (ธรรมดา)", weightKey: "i22_no_tis" as const },
  { value: "i22_tis", label: "เสาเข็ม I-22 (มอก.)", weightKey: "i22_tis" as const },
  { value: "i26_no_tis", label: "เสาเข็ม I-26 (ธรรมดา)", weightKey: "i26_no_tis" as const },
  { value: "i26_tis", label: "เสาเข็ม I-26 (มอก.)", weightKey: "i26_tis" as const },
  { value: "i30_no_tis", label: "เสาเข็ม I-30 (ธรรมดา)", weightKey: "i30_no_tis" as const },
  { value: "i30_tis", label: "เสาเข็ม I-30 (มอก.)", weightKey: "i30_tis" as const },
  { value: "i35", label: "เสาเข็ม I-35", weightKey: "i35" as const },
  { value: "i40", label: "เสาเข็ม I-40", weightKey: "i40" as const },
  { value: "s18", label: "เสาเข็ม S-18", weightKey: "s18" as const },
  { value: "s22", label: "เสาเข็ม S-22", weightKey: "s22" as const },
  { value: "s26", label: "เสาเข็ม S-26", weightKey: "s26" as const },
  { value: "s30", label: "เสาเข็ม S-30", weightKey: "s30" as const },
  { value: "s35", label: "เสาเข็ม S-35", weightKey: "s35" as const },
  { value: "s40", label: "เสาเข็ม S-40", weightKey: "s40" as const },
];

export const truckCapacities = [
  { name: "รถบรรทุก 6 ล้อ", capacityKg: 7500, label: "7.5 ตัน" },
  { name: "รถบรรทุก 10 ล้อ", capacityKg: 13500, label: "13.5 ตัน" },
  { name: "รถบรรทุก 12 ล้อ", capacityKg: 16500, label: "16.5 ตัน" },
  { name: "รถเทเลอร์", capacityKg: 25000, label: "25.0 ตัน" },
  { name: "รถพ่วง", capacityKg: 31000, label: "31.0 ตัน" },
];
