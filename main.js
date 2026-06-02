const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaCamera, FaBrain, FaDatabase, FaTag, FaCog, FaCheckCircle,
  FaImage, FaNetworkWired, FaLayerGroup, FaSearch, FaRobot,
  FaChartBar, FaCode, FaDownload, FaEye, FaMicrochip
} = require("react-icons/fa");

// ── Palette: Dark Tech (navy/teal accent) ────────────────────────
const C = {
  bg:      "0F172A",  // dark navy bg
  card:    "1E293B",  // card bg
  card2:   "162032",  // alt card
  navy:    "1B3A5C",
  teal:    "0D9488",
  accent:  "2DD4BF",
  blue:    "3B82F6",
  purple:  "8B5CF6",
  green:   "10B981",
  orange:  "F59E0B",
  red:     "EF4444",
  white:   "FFFFFF",
  muted:   "94A3B8",
  border:  "334155",
  yellow:  "FCD34D",
};

async function icon(Comp, color = "FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color: `#${color}`, size: String(size) })
  );
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

// ── helpers ──────────────────────────────────────────────────────
function numBadge(slide, x, y, num, color) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: 0.46, h: 0.46,
    fill: { color }, line: { color }
  });
  slide.addText(String(num), {
    x, y, w: 0.46, h: 0.46,
    fontSize: 14, bold: true, color: C.bg,
    align: "center", valign: "middle", margin: 0, fontFace: "Calibri"
  });
}

function darkCard(slide, x, y, w, h, accentColor) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.card }, line: { color: C.border }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.06, h,
    fill: { color: accentColor }, line: { color: accentColor }
  });
}

function sTitle(slide, title, sub) {
  slide.addText(title, {
    x: 0.5, y: 0.22, w: 9.1, h: 0.58,
    fontSize: 32, bold: true, color: C.white, fontFace: "Calibri", margin: 0
  });
  if (sub) slide.addText(sub, {
    x: 0.5, y: 0.82, w: 9.1, h: 0.3,
    fontSize: 13, color: C.accent, fontFace: "Calibri", italic: true, margin: 0
  });
}

let pres;

async function main() {
  pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title  = "Hand Landmark Model — How to Build";

  // ══════════════════════════════════════════════════════
  // S1 — TITLE
  // ══════════════════════════════════════════════════════
  const s1 = pres.addSlide();
  s1.background = { color: C.bg };

  // Big title
  s1.addText("วิธีสร้าง Hand Landmark Model", {
    x: 0.5, y: 0.8, w: 9.1, h: 1.0,
    fontSize: 44, bold: true, color: C.white, fontFace: "Calibri", margin: 0
  });
  s1.addText("How to Build from Scratch", {
    x: 0.5, y: 1.78, w: 9.1, h: 0.45,
    fontSize: 20, color: C.accent, fontFace: "Calibri", margin: 0
  });
  s1.addText("ขั้นตอนการสร้าง Model ตรวจจับ 21 จุดบนมือตั้งแต่เริ่มต้น", {
    x: 0.5, y: 2.28, w: 9.1, h: 0.35,
    fontSize: 14, color: C.muted, fontFace: "Calibri", italic: true, margin: 0
  });

  // 5 step pills
  const steps = [
    { n: "1", label: "เก็บ Dataset",      color: C.teal },
    { n: "2", label: "Annotation",         color: C.blue },
    { n: "3", label: "Architecture",       color: C.purple },
    { n: "4", label: "Train",              color: C.orange },
    { n: "5", label: "Optimize & Export",  color: C.green },
  ];
  steps.forEach((s, i) => {
    const x = 0.45 + i * 1.95;
    s1.addShape(pres.shapes.RECTANGLE, {
      x, y: 3.15, w: 1.78, h: 0.62,
      fill: { color: C.card }, line: { color: s.color }
    });
    s1.addShape(pres.shapes.OVAL, {
      x: x + 0.08, y: 3.22, w: 0.36, h: 0.36,
      fill: { color: s.color }, line: { color: s.color }
    });
    s1.addText(s.n, {
      x: x + 0.08, y: 3.22, w: 0.36, h: 0.36,
      fontSize: 12, bold: true, color: C.bg, align: "center", valign: "middle", margin: 0
    });
    s1.addText(s.label, {
      x: x + 0.5, y: 3.22, w: 1.22, h: 0.36,
      fontSize: 11, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0
    });
  });

  // Reference
  s1.addText("อ้างอิง: Zhang et al. (2020) — MediaPipe Hands: On-device Real-time Hand Tracking | arXiv:2006.10214", {
    x: 0.5, y: 5.1, w: 9.1, h: 0.28,
    fontSize: 9, color: C.muted, fontFace: "Calibri", margin: 0
  });

  // ══════════════════════════════════════════════════════
  // S2 — STEP 1: เก็บ Dataset
  // ══════════════════════════════════════════════════════
  const s2 = pres.addSlide();
  s2.background = { color: C.bg };
  sTitle(s2, "ขั้นตอนที่ 1 — เก็บ Dataset", "Data Collection");

  // Step badge
  s2.addShape(pres.shapes.OVAL, {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fill: { color: C.teal }, line: { color: C.teal }
  });
  s2.addText("1", {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fontSize: 14, bold: true, color: C.bg, align: "center", valign: "middle", margin: 0
  });

  // Left: requirements
  darkCard(s2, 0.45, 1.2, 4.6, 3.95, C.teal);
  s2.addText("สิ่งที่ต้องมีใน Dataset", {
    x: 0.65, y: 1.35, w: 4.2, h: 0.38,
    fontSize: 14, bold: true, color: C.accent, fontFace: "Calibri", margin: 0
  });

  const reqs = [
    { icon: "📸", title: "จำนวนภาพ", detail: "อย่างน้อย 10,000-30,000 ภาพ\n(Google ใช้ ~30K ภาพจริง + Synthetic)" },
    { icon: "🤚", title: "ความหลากหลาย", detail: "หลายคน • หลายมุมกล้อง\nหลายแสง • หลายพื้นหลัง" },
    { icon: "📐", title: "Scale", detail: "มือขนาดใหญ่-เล็ก ระยะใกล้-ไกล\nมือซ้ายและขวา" },
    { icon: "🎭", title: "Synthetic Data", detail: "3D Hand Model render ทับ Background\nช่วยเพิ่มความหลากหลายโดยไม่ต้องถ่ายเพิ่ม" },
  ];
  reqs.forEach((r, i) => {
    const y = 1.85 + i * 0.78;
    s2.addText(r.icon, { x: 0.65, y, w: 0.4, h: 0.4, fontSize: 18, margin: 0 });
    s2.addText(r.title, {
      x: 1.12, y, w: 3.8, h: 0.28,
      fontSize: 12, bold: true, color: C.white, fontFace: "Calibri", margin: 0
    });
    s2.addText(r.detail, {
      x: 1.12, y: y + 0.28, w: 3.8, h: 0.42,
      fontSize: 10, color: C.muted, fontFace: "Calibri", margin: 0
    });
  });

  // Right: diagram types of variation
  darkCard(s2, 5.25, 1.2, 4.35, 3.95, C.blue);
  s2.addText("ความหลากหลายที่ Dataset ต้องครอบคลุม", {
    x: 5.45, y: 1.35, w: 3.95, h: 0.38,
    fontSize: 13, bold: true, color: C.blue, fontFace: "Calibri", margin: 0
  });

  const variations = [
    { label: "มุมกล้อง (Viewpoint)", pct: 95, color: C.teal },
    { label: "ระดับแสง (Lighting)", pct: 88, color: C.blue },
    { label: "ผิวหนัง (Skin Tone)", pct: 75, color: C.purple },
    { label: "ขนาดมือ (Scale)", pct: 82, color: C.orange },
    { label: "ท่าทาง (Pose)", pct: 90, color: C.green },
  ];
  variations.forEach((v, i) => {
    const y = 1.88 + i * 0.6;
    s2.addText(v.label, {
      x: 5.45, y, w: 2.2, h: 0.28,
      fontSize: 10.5, color: C.white, fontFace: "Calibri", margin: 0
    });
    // bar bg
    s2.addShape(pres.shapes.RECTANGLE, {
      x: 5.45, y: y + 0.3, w: 3.9, h: 0.18,
      fill: { color: C.border }, line: { color: C.border }
    });
    // bar fill
    s2.addShape(pres.shapes.RECTANGLE, {
      x: 5.45, y: y + 0.3, w: 3.9 * v.pct / 100, h: 0.18,
      fill: { color: v.color }, line: { color: v.color }
    });
    s2.addText(`${v.pct}%`, {
      x: 9.0, y: y + 0.28, w: 0.55, h: 0.22,
      fontSize: 10, bold: true, color: v.color, align: "right", fontFace: "Calibri", margin: 0
    });
  });

  // ══════════════════════════════════════════════════════
  // S3 — STEP 2: Annotation
  // ══════════════════════════════════════════════════════
  const s3 = pres.addSlide();
  s3.background = { color: C.bg };
  sTitle(s3, "ขั้นตอนที่ 2 — Annotation (Label ข้อมูล)", "การ label 21 จุดบนมือทุกภาพ");

  s3.addShape(pres.shapes.OVAL, {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fill: { color: C.blue }, line: { color: C.blue }
  });
  s3.addText("2", {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fontSize: 14, bold: true, color: C.bg, align: "center", valign: "middle", margin: 0
  });

  // Center: 21 landmark diagram (SVG-like using shapes)
  // Hand palm area
  s3.addShape(pres.shapes.OVAL, {
    x: 2.1, y: 2.5, w: 1.8, h: 2.2,
    fill: { color: "1A2535" }, line: { color: C.border }
  });
  s3.addText("Palm", {
    x: 2.1, y: 3.45, w: 1.8, h: 0.3,
    fontSize: 10, color: C.muted, align: "center", fontFace: "Calibri", margin: 0
  });

  // Landmark points (simplified hand)
  const lmPoints = [
    // wrist
    { x: 2.82, y: 4.6, id: "0", color: C.yellow, label: "Wrist" },
    // thumb
    { x: 1.85, y: 3.6, id: "1", color: C.teal },
    { x: 1.55, y: 3.0, id: "2", color: C.teal },
    { x: 1.35, y: 2.45, id: "3", color: C.teal },
    { x: 1.15, y: 1.95, id: "4", color: C.teal, label: "Thumb TIP" },
    // index
    { x: 2.2, y: 2.55, id: "5", color: C.blue },
    { x: 2.05, y: 1.95, id: "6", color: C.blue },
    { x: 1.95, y: 1.45, id: "7", color: C.blue },
    { x: 1.85, y: 1.02, id: "8", color: C.blue, label: "Index TIP" },
    // middle
    { x: 2.82, y: 2.42, id: "9", color: C.purple },
    { x: 2.78, y: 1.82, id: "10", color: C.purple },
    { x: 2.75, y: 1.32, id: "11", color: C.purple },
    { x: 2.72, y: 0.88, id: "12", color: C.purple, label: "Middle TIP" },
    // ring
    { x: 3.45, y: 2.55, id: "13", color: C.orange },
    { x: 3.52, y: 1.98, id: "14", color: C.orange },
    { x: 3.58, y: 1.48, id: "15", color: C.orange },
    { x: 3.62, y: 1.05, id: "16", color: C.orange, label: "Ring TIP" },
    // pinky
    { x: 4.05, y: 2.75, id: "17", color: C.red },
    { x: 4.18, y: 2.28, id: "18", color: C.red },
    { x: 4.28, y: 1.88, id: "19", color: C.red },
    { x: 4.38, y: 1.52, id: "20", color: C.red, label: "Pinky TIP" },
  ];

  lmPoints.forEach(p => {
    s3.addShape(pres.shapes.OVAL, {
      x: p.x, y: p.y, w: 0.22, h: 0.22,
      fill: { color: p.color }, line: { color: p.color }
    });
    s3.addText(p.id, {
      x: p.x, y: p.y, w: 0.22, h: 0.22,
      fontSize: 7, bold: true, color: C.bg, align: "center", valign: "middle", margin: 0
    });
  });

  // Right: annotation details
  darkCard(s3, 5.25, 1.18, 4.35, 4.0, C.blue);
  s3.addText("ข้อมูลที่ต้อง Label ต่อ 1 ภาพ", {
    x: 5.45, y: 1.32, w: 3.95, h: 0.38,
    fontSize: 14, bold: true, color: C.blue, fontFace: "Calibri", margin: 0
  });

  const annoItems = [
    { k: "จุดที่ต้อง label", v: "21 จุดต่อ 1 มือ" },
    { k: "ค่าต่อจุด", v: "x, y, z (3 ค่า)" },
    { k: "ค่าต่อภาพ", v: "21 × 3 = 63 ค่า" },
    { k: "Format พิกัด", v: "Normalized 0.0 – 1.0" },
    { k: "เครื่องมือ", v: "Labelme / CVAT / custom" },
    { k: "เวลาต่อภาพ", v: "~3-10 นาที (manual)" },
    { k: "ทางเลือก", v: "Semi-auto ด้วย existing model" },
  ];
  annoItems.forEach((item, i) => {
    const y = 1.88 + i * 0.47;
    s3.addShape(pres.shapes.RECTANGLE, {
      x: 5.45, y, w: 4.0, h: 0.4,
      fill: { color: i % 2 === 0 ? "1A2840" : C.card }, line: { color: C.border }
    });
    s3.addText(item.k, {
      x: 5.55, y: y + 0.06, w: 2.0, h: 0.28,
      fontSize: 10.5, color: C.muted, fontFace: "Calibri", margin: 0
    });
    s3.addText(item.v, {
      x: 7.55, y: y + 0.06, w: 1.8, h: 0.28,
      fontSize: 10.5, bold: true, color: C.white, fontFace: "Calibri", margin: 0
    });
  });

  // Bottom note
  s3.addText("💡 Google ใช้ Synthetic 3D Hand Model เพื่อลดภาระการ label ด้วยมือ ช่วยเพิ่มความหลากหลายและลด Bias", {
    x: 0.45, y: 5.05, w: 9.1, h: 0.3,
    fontSize: 10, color: C.accent, fontFace: "Calibri", italic: true, margin: 0
  });

  // ══════════════════════════════════════════════════════
  // S4 — STEP 3: Model Architecture
  // ══════════════════════════════════════════════════════
  const s4 = pres.addSlide();
  s4.background = { color: C.bg };
  sTitle(s4, "ขั้นตอนที่ 3 — Model Architecture", "โครงสร้าง Neural Network สำหรับ Hand Landmark");

  s4.addShape(pres.shapes.OVAL, {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fill: { color: C.purple }, line: { color: C.purple }
  });
  s4.addText("3", {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fontSize: 14, bold: true, color: C.bg, align: "center", valign: "middle", margin: 0
  });

  // Pipeline flow
  const pipeline = [
    { label: "Input Image\n224×224", color: C.teal,   sub: "Cropped palm region" },
    { label: "Encoder\nMobileNet", color: C.blue,    sub: "Feature extraction" },
    { label: "Decoder\nFPN", color: C.purple, sub: "Multi-scale context" },
    { label: "Regression\nHead", color: C.orange,   sub: "21 × (x,y,z)" },
    { label: "Output\n63 values", color: C.green,    sub: "Landmark coords" },
  ];

  pipeline.forEach((p, i) => {
    const x = 0.42 + i * 1.9;
    s4.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.18, w: 1.72, h: 1.5,
      fill: { color: C.card }, line: { color: p.color }
    });
    s4.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.18, w: 1.72, h: 0.05,
      fill: { color: p.color }, line: { color: p.color }
    });
    s4.addText(p.label, {
      x, y: 1.3, w: 1.72, h: 0.65,
      fontSize: 11, bold: true, color: C.white, align: "center", fontFace: "Calibri", margin: 0
    });
    s4.addText(p.sub, {
      x, y: 2.0, w: 1.72, h: 0.5,
      fontSize: 9.5, color: C.muted, align: "center", fontFace: "Calibri", margin: 0
    });
    if (i < pipeline.length - 1) {
      s4.addText("→", {
        x: x + 1.72, y: 1.7, w: 0.18, h: 0.3,
        fontSize: 14, color: C.muted, align: "center", margin: 0
      });
    }
  });

  // Two columns: 2 stages
  darkCard(s4, 0.45, 2.88, 4.62, 2.28, C.teal);
  s4.addText("Stage 1 — BlazePalm Detector", {
    x: 0.65, y: 3.02, w: 4.2, h: 0.38,
    fontSize: 13, bold: true, color: C.accent, fontFace: "Calibri", margin: 0
  });
  const stage1 = [
    "ตรวจหาฝ่ามือจากภาพทั้งหมด",
    "ใช้ Single-Shot Detector (SSD-like)",
    "Output = Bounding Box + Orientation",
    "ความแม่นยำ 95.7% average precision",
    "รันเฉพาะ Frame แรกหรือเมื่อ Track หาย",
  ];
  stage1.forEach((t, i) => {
    s4.addText("▸  " + t, {
      x: 0.65, y: 3.48 + i * 0.33, w: 4.2, h: 0.3,
      fontSize: 10.5, color: C.white, fontFace: "Calibri", margin: 0
    });
  });

  darkCard(s4, 5.22, 2.88, 4.38, 2.28, C.purple);
  s4.addText("Stage 2 — Hand Landmark Model", {
    x: 5.42, y: 3.02, w: 3.98, h: 0.38,
    fontSize: 13, bold: true, color: C.purple, fontFace: "Calibri", margin: 0
  });
  const stage2 = [
    "รับ cropped palm image จาก Stage 1",
    "CNN Regression → 21 × 3 = 63 ค่า",
    "ใช้ 2.5D Heatmap intermediate",
    "แม่นยำระดับ sub-pixel",
    "รันทุก Frame (เร็วกว่า detector)",
  ];
  stage2.forEach((t, i) => {
    s4.addText("▸  " + t, {
      x: 5.42, y: 3.48 + i * 0.33, w: 3.98, h: 0.3,
      fontSize: 10.5, color: C.white, fontFace: "Calibri", margin: 0
    });
  });

  // ══════════════════════════════════════════════════════
  // S5 — STEP 4: Training
  // ══════════════════════════════════════════════════════
  const s5 = pres.addSlide();
  s5.background = { color: C.bg };
  sTitle(s5, "ขั้นตอนที่ 4 — Training", "การฝึก Model ด้วย Dataset ที่เตรียมไว้");

  s5.addShape(pres.shapes.OVAL, {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fill: { color: C.orange }, line: { color: C.orange }
  });
  s5.addText("4", {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fontSize: 14, bold: true, color: C.bg, align: "center", valign: "middle", margin: 0
  });

  // Config cards
  const trainConfig = [
    { label: "Loss Function",   val: "Wing Loss\n(ดีกว่า MSE สำหรับ Landmark)",  color: C.red },
    { label: "Optimizer",       val: "Adam\nlr = 0.001 → decay",                  color: C.blue },
    { label: "Batch Size",       val: "32 – 64\n(ขึ้นกับ GPU VRAM)",               color: C.teal },
    { label: "Epochs",           val: "50 – 200\n(เฝ้าดู val loss)",               color: C.purple },
    { label: "Data Split",       val: "Train 80%\nVal 10% / Test 10%",             color: C.orange },
    { label: "Augmentation",    val: "Flip, Rotate, Brightness\nNoise, Crop",     color: C.green },
  ];
  trainConfig.forEach((tc, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.45 + col * 3.17, y = 1.18 + row * 1.5;
    darkCard(s5, x, y, 3.0, 1.35, tc.color);
    s5.addText(tc.label, {
      x: x + 0.18, y: y + 0.12, w: 2.7, h: 0.35,
      fontSize: 12, bold: true, color: tc.color, fontFace: "Calibri", margin: 0
    });
    s5.addText(tc.val, {
      x: x + 0.18, y: y + 0.5, w: 2.7, h: 0.72,
      fontSize: 10.5, color: C.white, fontFace: "Calibri", margin: 0
    });
  });

  // Training loop diagram
  darkCard(s5, 0.45, 4.22, 9.15, 0.98, C.yellow);
  s5.addText("Training Loop", {
    x: 0.65, y: 4.28, w: 8.75, h: 0.28,
    fontSize: 11, bold: true, color: C.yellow, fontFace: "Calibri", margin: 0
  });
  const loop = ["Load Batch", "Forward Pass", "Compute Loss\n(Wing Loss)", "Backprop\n(Gradient)", "Update Weights\n(Adam)", "Validate\nEvery Epoch"];
  loop.forEach((step, i) => {
    const x = 0.65 + i * 1.52;
    s5.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.58, w: 1.35, h: 0.48,
      fill: { color: "1A2535" }, line: { color: C.yellow }
    });
    s5.addText(step, {
      x, y: 4.58, w: 1.35, h: 0.48,
      fontSize: 9, color: C.white, align: "center", valign: "middle", fontFace: "Calibri", margin: 0
    });
    if (i < loop.length - 1) {
      s5.addText("→", {
        x: x + 1.35, y: 4.68, w: 0.17, h: 0.28,
        fontSize: 12, color: C.yellow, align: "center", margin: 0
      });
    }
  });

  // ══════════════════════════════════════════════════════
  // S6 — STEP 5: Validate & Optimize
  // ══════════════════════════════════════════════════════
  const s6 = pres.addSlide();
  s6.background = { color: C.bg };
  sTitle(s6, "ขั้นตอนที่ 5 — Validate & Optimize & Export", "ทดสอบ ปรับแต่ง และ Export Model");

  s6.addShape(pres.shapes.OVAL, {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fill: { color: C.green }, line: { color: C.green }
  });
  s6.addText("5", {
    x: 0.5, y: 0.22, w: 0.46, h: 0.46,
    fontSize: 14, bold: true, color: C.bg, align: "center", valign: "middle", margin: 0
  });

  // Left: Metrics
  darkCard(s6, 0.45, 1.18, 4.62, 2.55, C.green);
  s6.addText("Metrics ที่ใช้วัดความแม่นยำ", {
    x: 0.65, y: 1.32, w: 4.2, h: 0.38,
    fontSize: 13, bold: true, color: C.green, fontFace: "Calibri", margin: 0
  });
  const metrics = [
    { m: "PCK (% Correct Keypoints)", d: "จุดที่อยู่ในระยะ threshold ถือว่าถูก", v: "> 90%" },
    { m: "MPJPE", d: "Mean Per-Joint Position Error (mm)", v: "< 5 mm" },
    { m: "NME (Normalized Mean Error)", d: "Error หารด้วยขนาดมือ", v: "< 0.05" },
    { m: "FPS (Inference Speed)", d: "เฟรมต่อวินาที (Real-time ≥ 30)", v: "≥ 30 FPS" },
  ];
  metrics.forEach((me, i) => {
    const y = 1.82 + i * 0.46;
    s6.addText(me.m, {
      x: 0.65, y, w: 3.0, h: 0.24,
      fontSize: 10.5, bold: true, color: C.white, fontFace: "Calibri", margin: 0
    });
    s6.addText(me.d, {
      x: 0.65, y: y + 0.22, w: 2.8, h: 0.2,
      fontSize: 9, color: C.muted, fontFace: "Calibri", margin: 0
    });
    s6.addShape(pres.shapes.RECTANGLE, {
      x: 3.7, y: y + 0.02, w: 1.2, h: 0.28,
      fill: { color: C.green }, line: { color: C.green }
    });
    s6.addText(me.v, {
      x: 3.7, y: y + 0.02, w: 1.2, h: 0.28,
      fontSize: 10, bold: true, color: C.bg, align: "center", valign: "middle", fontFace: "Calibri", margin: 0
    });
  });

  // Right: Export formats
  darkCard(s6, 5.25, 1.18, 4.35, 2.55, C.teal);
  s6.addText("Export Formats", {
    x: 5.45, y: 1.32, w: 3.95, h: 0.38,
    fontSize: 13, bold: true, color: C.accent, fontFace: "Calibri", margin: 0
  });
  const exports = [
    { fmt: "TFLite (.tflite)",  use: "มือถือ Android/iOS",  color: C.teal },
    { fmt: "ONNX (.onnx)",      use: "ทั่วไป Cross-platform", color: C.blue },
    { fmt: "TensorRT (.engine)", use: "Jetson Nano (เร็วมาก)", color: C.purple },
    { fmt: "CoreML (.mlmodel)", use: "iPhone / Mac (Apple)", color: C.orange },
  ];
  exports.forEach((ex, i) => {
    const y = 1.88 + i * 0.5;
    s6.addShape(pres.shapes.RECTANGLE, {
      x: 5.45, y, w: 4.0, h: 0.42,
      fill: { color: "1A2535" }, line: { color: C.border }
    });
    s6.addShape(pres.shapes.RECTANGLE, {
      x: 5.45, y, w: 0.05, h: 0.42,
      fill: { color: ex.color }, line: { color: ex.color }
    });
    s6.addText(ex.fmt, {
      x: 5.6, y: y + 0.06, w: 2.2, h: 0.3,
      fontSize: 10.5, bold: true, color: C.white, fontFace: "Consolas", margin: 0
    });
    s6.addText(ex.use, {
      x: 7.85, y: y + 0.06, w: 1.5, h: 0.3,
      fontSize: 9.5, color: ex.color, fontFace: "Calibri", margin: 0
    });
  });

  // Bottom: Optimization techniques
  darkCard(s6, 0.45, 3.85, 9.15, 1.35, C.orange);
  s6.addText("เทคนิค Optimization", {
    x: 0.65, y: 3.98, w: 8.75, h: 0.35,
    fontSize: 13, bold: true, color: C.orange, fontFace: "Calibri", margin: 0
  });
  const opts = [
    { t: "Quantization",      d: "ลด Precision\n32-bit → 8-bit\nเร็วขึ้น 2-4x" },
    { t: "Pruning",           d: "ตัด Weight\nที่ไม่สำคัญออก\nModel เล็กลง" },
    { t: "Knowledge\nDistill", d: "ถ่ายความรู้จาก\nModel ใหญ่ไป\nModel เล็ก" },
    { t: "TensorRT\nFusion",   d: "รวม Layer\nสำหรับ GPU\n Jetson เร็วมาก" },
  ];
  opts.forEach((o, i) => {
    const x = 0.65 + i * 2.28;
    s6.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.38, w: 2.1, h: 0.72,
      fill: { color: "1A2535" }, line: { color: C.orange }
    });
    s6.addText(o.t, {
      x: x + 0.08, y: 4.4, w: 0.9, h: 0.68,
      fontSize: 10, bold: true, color: C.orange, fontFace: "Calibri", valign: "middle", margin: 0
    });
    s6.addText(o.d, {
      x: x + 0.98, y: 4.4, w: 1.05, h: 0.68,
      fontSize: 9, color: C.white, fontFace: "Calibri", valign: "middle", margin: 0
    });
  });

  // ══════════════════════════════════════════════════════
  // S7 — Comparison: ทำเองVsสำเร็จรูป
  // ══════════════════════════════════════════════════════
  const s7 = pres.addSlide();
  s7.background = { color: C.bg };
  sTitle(s7, "เปรียบเทียบ — ทำเอง vs ใช้ MediaPipe สำเร็จรูป", "ข้อดีข้อเสียของแต่ละแนวทาง");

  const compRows = [
    { aspect: "เวลาที่ใช้",           diy: "3-6 เดือน",         mp: "1 วัน",                  win: "mp" },
    { aspect: "Dataset ที่ต้องการ",  diy: "30,000+ ภาพ",        mp: "ไม่ต้องการ",               win: "mp" },
    { aspect: "ความยืดหยุ่น",        diy: "ปรับ Class เองได้",   mp: "ใช้ได้แค่ 21 จุดมาตรฐาน", win: "diy" },
    { aspect: "ความแม่นยำ",          diy: "ขึ้นกับ Dataset",     mp: "95.7% (tested by Google)", win: "mp" },
    { aspect: "ขนาด Model",          diy: "ปรับได้",             mp: "~8 MB (fixed)",            win: "diy" },
    { aspect: "รันบน Mobile/Edge",   diy: "ต้อง Optimize เอง",   mp: "รองรับทุก Platform",        win: "mp" },
    { aspect: "เรียนรู้",            diy: "ได้เรียนรู้ลึก",       mp: "ได้เรียน Integration",     win: "both" },
  ];

  // Header
  s7.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 1.18, w: 4.0, h: 0.38,
    fill: { color: C.navy }, line: { color: C.border }
  });
  s7.addText("ด้าน", {
    x: 0.45, y: 1.18, w: 4.0, h: 0.38,
    fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0
  });
  s7.addShape(pres.shapes.RECTANGLE, {
    x: 4.47, y: 1.18, w: 2.48, h: 0.38,
    fill: { color: C.purple }, line: { color: C.purple }
  });
  s7.addText("ทำเอง (DIY)", {
    x: 4.47, y: 1.18, w: 2.48, h: 0.38,
    fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0
  });
  s7.addShape(pres.shapes.RECTANGLE, {
    x: 6.97, y: 1.18, w: 2.63, h: 0.38,
    fill: { color: C.teal }, line: { color: C.teal }
  });
  s7.addText("MediaPipe (สำเร็จรูป)", {
    x: 6.97, y: 1.18, w: 2.63, h: 0.38,
    fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0
  });

  compRows.forEach((r, i) => {
    const y = 1.62 + i * 0.5;
    const bg = i % 2 === 0 ? C.card : "172030";

    s7.addShape(pres.shapes.RECTANGLE, {
      x: 0.45, y, w: 9.15, h: 0.46,
      fill: { color: bg }, line: { color: C.border }
    });
    s7.addText(r.aspect, {
      x: 0.6, y: y + 0.06, w: 3.8, h: 0.34,
      fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", margin: 0
    });
    const diyColor = r.win === "diy" ? C.yellow : C.muted;
    const mpColor  = r.win === "mp"  ? C.accent : (r.win === "both" ? C.accent : C.muted);
    s7.addText(r.diy, {
      x: 4.47, y: y + 0.06, w: 2.42, h: 0.34,
      fontSize: 10.5, color: diyColor, fontFace: "Calibri", align: "center", margin: 0
    });
    s7.addText(r.mp, {
      x: 6.97, y: y + 0.06, w: 2.57, h: 0.34,
      fontSize: 10.5, color: mpColor, fontFace: "Calibri", align: "center", margin: 0
    });
    if (r.win === "diy") {
      s7.addText("✓", { x: 4.3, y: y+0.08, w: 0.2, h: 0.3, fontSize: 13, color: C.yellow, margin: 0 });
    } else if (r.win === "mp") {
      s7.addText("✓", { x: 9.55, y: y+0.08, w: 0.2, h: 0.3, fontSize: 13, color: C.accent, margin: 0 });
    } else {
      s7.addText("✓✓", { x: 4.3, y: y+0.08, w: 0.3, h: 0.3, fontSize: 11, color: C.green, margin: 0 });
    }
  });

  s7.addText("สรุป: ในโปรเจคนี้ใช้ MediaPipe เป็นหลัก และทดลองเทรน YOLO11 เองด้วย Roboflow + Google Colab จึงเข้าใจทั้งสองแนวทาง", {
    x: 0.45, y: 5.12, w: 9.15, h: 0.25,
    fontSize: 10, color: C.accent, fontFace: "Calibri", italic: true, margin: 0
  });

  // ── Write ─────────────────────────────────────────────────────
  await pres.writeFile({ fileName: "HandLandmark_HowToBuild.pptx" });
  console.log("Done!");
}

main().catch(console.error);