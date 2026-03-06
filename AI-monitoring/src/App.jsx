import { useState, useEffect, useRef } from "react";

const CLASSROOMS = [
  { id: 1, name: "5-A Sinf", domain: "cam://192.168.1.101", floor: "1-qavat", subject: "Matematika", teacher: "Azimov B.", students: 28 },
  { id: 2, name: "5-B Sinf", domain: "cam://192.168.1.102", floor: "1-qavat", subject: "Fizika", teacher: "Karimova N.", students: 30 },
  { id: 3, name: "6-A Sinf", domain: "cam://192.168.1.103", floor: "2-qavat", subject: "Biologiya", teacher: "Toshmatov A.", students: 26 },
  { id: 4, name: "6-B Sinf", domain: "cam://192.168.1.104", floor: "2-qavat", subject: "Ingliz tili", teacher: "Yusupova M.", students: 29 },
  { id: 5, name: "7-A Sinf", domain: "cam://192.168.1.105", floor: "3-qavat", subject: "Kimyo", teacher: "Rahimov S.", students: 27 },
  { id: 6, name: "7-B Sinf", domain: "cam://192.168.1.106", floor: "3-qavat", subject: "Tarix", teacher: "Nazarova D.", students: 31 },
];

const HOUR_DATA = [
  { hour: "08:00", engagement: 72, attention: 68, behavior: 91 },
  { hour: "09:00", engagement: 85, attention: 79, behavior: 88 },
  { hour: "10:00", engagement: 61, attention: 55, behavior: 82 },
  { hour: "11:00", engagement: 90, attention: 88, behavior: 94 },
  { hour: "12:00", engagement: 45, attention: 40, behavior: 76 },
  { hour: "13:00", engagement: 78, attention: 72, behavior: 89 },
  { hour: "14:00", engagement: 83, attention: 81, behavior: 92 },
];

function generateStudentData(count) {
  const statuses = ["Diqqatli", "Chalg'igan", "Uxlab qolgan", "Faol", "Jimgina"];
  const colors = ["#00ff88", "#ffaa00", "#ff4455", "#00ccff", "#aa88ff"];
  return Array.from({ length: Math.min(count, 12) }, (_, i) => ({
    id: i + 1,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    score: Math.floor(Math.random() * 40) + 60,
    x: 15 + (i % 6) * 14,
    y: i < 6 ? 30 : 65,
  }));
}

function CameraFeed({ classroom, isSelected, onClick }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const studentsRef = useRef(generateStudentData(classroom.students));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    const draw = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;

      // Background - classroom
      ctx.fillStyle = "#0a0e14";
      ctx.fillRect(0, 0, W, H);

      // Room floor
      const floorGrad = ctx.createLinearGradient(0, H * 0.5, 0, H);
      floorGrad.addColorStop(0, "#12181f");
      floorGrad.addColorStop(1, "#0d1117");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, H * 0.5, W, H * 0.5);

      // Grid lines (floor perspective)
      ctx.strokeStyle = "rgba(0,200,100,0.06)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(W * 0.5, H * 0.5);
        ctx.lineTo((i / 7) * W, H);
        ctx.stroke();
      }
      for (let j = 1; j < 4; j++) {
        ctx.beginPath();
        ctx.moveTo(0, H * 0.5 + (j / 4) * H * 0.5);
        ctx.lineTo(W, H * 0.5 + (j / 4) * H * 0.5);
        ctx.stroke();
      }

      // Blackboard
      ctx.fillStyle = "#0f2a1a";
      ctx.strokeStyle = "#1a4a2a";
      ctx.lineWidth = 1;
      ctx.fillRect(W * 0.15, H * 0.05, W * 0.7, H * 0.28);
      ctx.strokeRect(W * 0.15, H * 0.05, W * 0.7, H * 0.28);
      // Board text simulation
      ctx.strokeStyle = `rgba(180,220,180,${0.3 + Math.sin(t * 0.1) * 0.05})`;
      ctx.lineWidth = 0.8;
      for (let l = 0; l < 4; l++) {
        ctx.beginPath();
        ctx.moveTo(W * 0.2, H * 0.1 + l * 14);
        ctx.lineTo(W * 0.2 + W * 0.2 * Math.random() * 0.8 + W * 0.2, H * 0.1 + l * 14);
        ctx.stroke();
      }

      // Teacher dot
      const tx = W * 0.5 + Math.sin(t * 0.3) * W * 0.08;
      const ty = H * 0.42;
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00ffaa";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx, ty, 9, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,255,170,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Teacher label
      ctx.fillStyle = "#00ffaa";
      ctx.font = "bold 7px monospace";
      ctx.fillText("O'QITUVCHI", tx - 24, ty - 13);

      // Students
      studentsRef.current.forEach((s, i) => {
        const sx = (s.x / 100) * W;
        const sy = (s.y / 100) * H;
        const wobble = Math.sin(t * 0.5 + i) * 1.5;

        // Detection box
        ctx.strokeStyle = s.color + "88";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(sx - 8, sy - 10 + wobble, 16, 18);

        // Corner markers
        const corners = [[-8, -10], [8, -10], [-8, 8], [8, 8]];
        corners.forEach(([cx, cy]) => {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const signX = cx < 0 ? 1 : -1;
          const signY = cy < 0 ? 1 : -1;
          ctx.moveTo(sx + cx, sy + cy + wobble + signY * 3);
          ctx.lineTo(sx + cx, sy + cy + wobble);
          ctx.lineTo(sx + cx + signX * 3, sy + cy + wobble);
          ctx.stroke();
        });

        // Head dot
        ctx.beginPath();
        ctx.arc(sx, sy + wobble, 3, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
      });

      // Scan line
      const scanY = ((t * 30) % H);
      const scanGrad = ctx.createLinearGradient(0, scanY - 3, 0, scanY + 3);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "rgba(0,255,136,0.12)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 3, W, 6);

      // Noise overlay
      for (let n = 0; n < 30; n++) {
        const nx = Math.random() * W, ny = Math.random() * H;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
        ctx.fillRect(nx, ny, 1, 1);
      }

      // Top overlay
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, W, 18);
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 7px monospace";
      ctx.fillText(`● REC  ${classroom.domain}`, 5, 12);
      ctx.fillStyle = "#ffffff88";
      ctx.fillText(new Date().toLocaleTimeString(), W - 45, 12);

      // Bottom overlay
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, H - 16, W, 16);
      ctx.fillStyle = "#aaffcc";
      ctx.font = "6px monospace";
      ctx.fillText(`${classroom.teacher}  |  ${classroom.subject}  |  ${classroom.students} o'quvchi`, 5, H - 5);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [classroom]);

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        cursor: "pointer",
        border: isSelected ? "2px solid #00ff88" : "1px solid #1a2a1a",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: isSelected ? "0 0 20px rgba(0,255,136,0.3)" : "0 2px 8px rgba(0,0,0,0.5)",
        transition: "all 0.2s",
      }}
    >
      <canvas ref={canvasRef} width={260} height={160} style={{ display: "block", width: "100%", height: "auto" }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: isSelected ? "transparent" : "rgba(0,0,0,0)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

function AIAnalysisPanel({ classroom }) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setAnalysis(null);
    setError(null);

    const prompt = `Sen maktab sinf kuzatuv tizimining AI analitikasisin. Quyidagi sinf uchun tahlil ber:

Sinf: ${classroom.name}
Fan: ${classroom.subject}
O'qituvchi: ${classroom.teacher}
O'quvchilar soni: ${classroom.students}
Qavat: ${classroom.floor}

Quyidagi JSON formatida javob ber (faqat JSON, boshqa hech narsa yo'q):
{
  "umumiyHolat": "YAXSHI|OʻRTACHA|YOMON",
  "diqqatDarajasi": <0-100 son>,
  "faollikDarajasi": <0-100 son>,
  "intizomDarajasi": <0-100 son>,
  "xulosa": "<2 jumlali qisqa tahlil>",
  "ogohlantirishlar": ["<ogohlantirish 1>", "<ogohlantirish 2 agar bo'lsa>"],
  "tavsiyalar": ["<tavsiya 1>", "<tavsiya 2>"],
  "oʻqituvchiMunosabati": "<O'qituvchi-o'quvchi munosabati haqida 1 jumla>",
  "muammoliOʻquvchilar": <0-${classroom.students} son>
}`;

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    })
      .then(r => r.json())
      .then(data => {
        const text = data.content?.[0]?.text || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setAnalysis(parsed);
        setLoading(false);
      })
      .catch(() => {
        setError("AI tahlil yuklanmadi");
        setLoading(false);
      });
  }, [classroom.id]);

  const statusColor = {
    "YAXSHI": "#00ff88",
    "OʻRTACHA": "#ffaa00",
    "YOMON": "#ff4455",
  };

  return (
    <div style={{ fontFamily: "'Courier New', monospace", color: "#c8ffd8", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, borderBottom: "1px solid #1a3a1a", paddingBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88", animation: "pulse 1.5s infinite" }} />
        <span style={{ fontSize: 11, color: "#88ffaa", letterSpacing: 2 }}>AI TAHLIL TIZIMI</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#446644" }}>{classroom.domain}</span>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#446644" }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⟳</div>
          <div style={{ fontSize: 11, letterSpacing: 2 }}>AI TAHLIL QILMOQDA...</div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 4 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: 3, height: 16, background: "#00ff88",
                animation: `bar ${0.8}s ${i * 0.15}s infinite alternate`,
                opacity: 0.3 + (i * 0.15),
              }} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: "#ff4455", textAlign: "center", padding: "20px", fontSize: 11 }}>
          ⚠ {error}
        </div>
      )}

      {analysis && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              padding: "4px 12px", border: `1px solid ${statusColor[analysis.umumiyHolat] || "#aaa"}`,
              color: statusColor[analysis.umumiyHolat] || "#aaa", fontSize: 11, letterSpacing: 3,
              fontWeight: "bold",
            }}>
              {analysis.umumiyHolat}
            </div>
            <div style={{ fontSize: 10, color: "#668866" }}>
              {classroom.teacher} — {classroom.subject}
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "DIQQAT", value: analysis.diqqatDarajasi, color: "#00ccff" },
              { label: "FAOLLIK", value: analysis.faollikDarajasi, color: "#00ff88" },
              { label: "INTIZOM", value: analysis.intizomDarajasi, color: "#ffaa00" },
            ].map(m => (
              <div key={m.label} style={{ background: "#060e06", border: "1px solid #1a2a1a", padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#446644", letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: "bold", color: m.color, lineHeight: 1 }}>{m.value}</div>
                <div style={{ marginTop: 6, height: 3, background: "#1a2a1a", borderRadius: 2 }}>
                  <div style={{ width: `${m.value}%`, height: "100%", background: m.color, borderRadius: 2, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Xulosa */}
          <div style={{ background: "#050d05", border: "1px solid #1a3a1a", padding: "10px 12px", borderLeft: "3px solid #00ff88" }}>
            <div style={{ fontSize: 9, color: "#446644", letterSpacing: 2, marginBottom: 5 }}>XULOSA</div>
            <div style={{ fontSize: 11, lineHeight: 1.6, color: "#aaffcc" }}>{analysis.xulosa}</div>
          </div>

          {/* O'qituvchi munosabati */}
          <div style={{ background: "#050d05", border: "1px solid #1a3a1a", padding: "10px 12px", borderLeft: "3px solid #00ccff" }}>
            <div style={{ fontSize: 9, color: "#446644", letterSpacing: 2, marginBottom: 5 }}>O'QITUVCHI MUNOSABATI</div>
            <div style={{ fontSize: 11, lineHeight: 1.6, color: "#aaddff" }}>{analysis["oʻqituvchiMunosabati"]}</div>
          </div>

          {/* Ogohlantirishlar */}
          {analysis.ogohlantirishlar?.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: "#ff8844", letterSpacing: 2, marginBottom: 6 }}>⚠ OGOHLANTIRISHLAR</div>
              {analysis.ogohlantirishlar.map((w, i) => (
                <div key={i} style={{ fontSize: 10, color: "#ffaa88", padding: "4px 0", borderBottom: "1px solid #1a0a0a", display: "flex", gap: 6 }}>
                  <span style={{ color: "#ff4455" }}>›</span> {w}
                </div>
              ))}
            </div>
          )}

          {/* Tavsiyalar */}
          <div>
            <div style={{ fontSize: 9, color: "#44ff88", letterSpacing: 2, marginBottom: 6 }}>✓ TAVSIYALAR</div>
            {analysis.tavsiyalar?.map((t, i) => (
              <div key={i} style={{ fontSize: 10, color: "#88ffaa", padding: "4px 0", borderBottom: "1px solid #0a1a0a", display: "flex", gap: 6 }}>
                <span style={{ color: "#00ff88" }}>›</span> {t}
              </div>
            ))}
          </div>

          {/* Muammoli o'quvchilar */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#446644", marginTop: 4 }}>
            <span>Muammoli o'quvchilar:</span>
            <span style={{ color: analysis["muammoliOʻquvchilar"] > 3 ? "#ff4455" : "#ffaa00", fontWeight: "bold" }}>
              {analysis["muammoliOʻquvchilar"]} / {classroom.students}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function HourlyChart({ data }) {
  const maxVal = 100;
  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 50 }}>
              {[
                { v: d.engagement, c: "#00ff88" },
                { v: d.attention, c: "#00ccff" },
                { v: d.behavior, c: "#ffaa00" },
              ].map((b, j) => (
                <div key={j} style={{
                  width: 4, height: (b.v / maxVal) * 50,
                  background: b.c, opacity: 0.8, borderRadius: "1px 1px 0 0",
                }} />
              ))}
            </div>
            <div style={{ fontSize: 7, color: "#446644", whiteSpace: "nowrap" }}>{d.hour}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 8, justifyContent: "center" }}>
        {[["Faollik", "#00ff88"], ["Diqqat", "#00ccff"], ["Intizom", "#ffaa00"]].map(([l, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8, color: "#668866" }}>
            <div style={{ width: 6, height: 6, background: c }} /> {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(CLASSROOMS[0]);
  const [activeTab, setTab] = useState("grid");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#030806",
      fontFamily: "'Courier New', monospace",
      color: "#c8ffd8",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes bar { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }
        @keyframes scanline { 0%{top:-2px} 100%{top:100%} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060e06; }
        ::-webkit-scrollbar-thumb { background: #1a3a1a; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#030806", borderBottom: "1px solid #0d2010",
        padding: "12px 24px", display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 28, height: 28, border: "1px solid #00ff88",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#00ff88",
        }}>◈</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: "bold", letterSpacing: 3, color: "#00ff88" }}>
            CLASSWATCH AI
          </div>
          <div style={{ fontSize: 8, color: "#446644", letterSpacing: 2 }}>
            SINF KUZATUV TIZIMI v2.0
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: "bold", color: "#00ff88", letterSpacing: 2 }}>
              {time.toLocaleTimeString()}
            </div>
            <div style={{ fontSize: 8, color: "#446644" }}>
              {time.toLocaleDateString("uz-UZ")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { v: CLASSROOMS.length, l: "KAMERA" },
              { v: CLASSROOMS.reduce((a, c) => a + c.students, 0), l: "O'QUVCHI" },
              { v: CLASSROOMS.length, l: "FAOL" },
            ].map(s => (
              <div key={s.l} style={{
                border: "1px solid #1a3a1a", padding: "4px 10px", textAlign: "center",
                minWidth: 60,
              }}>
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#00ff88" }}>{s.v}</div>
                <div style={{ fontSize: 7, color: "#446644", letterSpacing: 1 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        borderBottom: "1px solid #0d2010", padding: "0 24px",
        display: "flex", gap: 0,
      }}>
        {[["grid", "▦  KAMERALAR"], ["analysis", "◈  TAHLIL"], ["hourly", "▬  SOATLIK"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: "none", border: "none", borderBottom: activeTab === id ? "2px solid #00ff88" : "2px solid transparent",
            color: activeTab === id ? "#00ff88" : "#446644", padding: "10px 16px",
            cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "inherit",
            transition: "all 0.2s",
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 110px)" }}>
        {/* Left: Camera Grid */}
        <div style={{
          width: activeTab === "analysis" ? "45%" : "100%",
          borderRight: "1px solid #0d2010", overflowY: "auto", padding: 16,
          display: activeTab === "hourly" ? "none" : "block",
        }}>
          {activeTab !== "hourly" && (
            <>
              <div style={{ fontSize: 9, color: "#446644", letterSpacing: 3, marginBottom: 12 }}>
                ● JONLI KAMERA OQIMI — {CLASSROOMS.length} SINF
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: activeTab === "analysis" ? "1fr 1fr" : "repeat(3, 1fr)",
                gap: 8,
              }}>
                {CLASSROOMS.map(c => (
                  <div key={c.id}>
                    <div style={{ fontSize: 8, color: "#446644", marginBottom: 3, letterSpacing: 1 }}>
                      {c.name} — {c.floor}
                    </div>
                    <CameraFeed
                      classroom={c}
                      isSelected={selected?.id === c.id}
                      onClick={() => { setSelected(c); if (activeTab === "grid") setTab("analysis"); }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: AI Analysis */}
        {activeTab === "analysis" && (
          <div style={{
            flex: 1, overflowY: "auto", padding: 20,
            background: "#040b04",
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#446644", letterSpacing: 3, marginBottom: 6 }}>
                TANLANGAN SINF
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CLASSROOMS.map(c => (
                  <button key={c.id} onClick={() => setSelected(c)} style={{
                    background: selected?.id === c.id ? "#0a2a0a" : "none",
                    border: `1px solid ${selected?.id === c.id ? "#00ff88" : "#1a3a1a"}`,
                    color: selected?.id === c.id ? "#00ff88" : "#446644",
                    padding: "3px 10px", cursor: "pointer", fontSize: 9,
                    fontFamily: "inherit", letterSpacing: 1,
                  }}>{c.name}</button>
                ))}
              </div>
            </div>
            {selected && <AIAnalysisPanel key={selected.id} classroom={selected} />}
          </div>
        )}

        {/* Hourly Tab */}
        {activeTab === "hourly" && (
          <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
            <div style={{ fontSize: 9, color: "#446644", letterSpacing: 3, marginBottom: 20 }}>
              ▬ BUGUNGI SOATLIK MA'LUMOTLAR
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {CLASSROOMS.map(c => (
                <div key={c.id} style={{
                  border: "1px solid #1a3a1a", padding: 14, background: "#040b04",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#88ffaa", fontWeight: "bold" }}>{c.name}</div>
                    <div style={{ fontSize: 9, color: "#446644" }}>{c.subject}</div>
                  </div>
                  <HourlyChart data={HOUR_DATA.map(d => ({
                    ...d,
                    engagement: Math.max(30, d.engagement + Math.floor((Math.random() - 0.5) * 20)),
                    attention: Math.max(30, d.attention + Math.floor((Math.random() - 0.5) * 20)),
                    behavior: Math.max(50, d.behavior + Math.floor((Math.random() - 0.5) * 15)),
                  }))} />
                  <div style={{ marginTop: 8, fontSize: 9, color: "#446644", display: "flex", justifyContent: "space-between" }}>
                    <span>{c.teacher}</span>
                    <span>{c.students} ta</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary table */}
            <div style={{ marginTop: 24, border: "1px solid #1a3a1a" }}>
              <div style={{ background: "#060e06", padding: "8px 14px", fontSize: 9, letterSpacing: 2, color: "#446644", borderBottom: "1px solid #1a3a1a" }}>
                SOATLIK UMUMIY STATISTIKA
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a3a1a" }}>
                    {["SOAT", "FAOLLIK", "DIQQAT", "INTIZOM", "HOLAT"].map(h => (
                      <th key={h} style={{ padding: "6px 14px", textAlign: "left", color: "#446644", fontWeight: "normal", letterSpacing: 1, fontSize: 8 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOUR_DATA.map((d, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0a1a0a" }}>
                      <td style={{ padding: "6px 14px", color: "#88ffaa" }}>{d.hour}</td>
                      <td style={{ padding: "6px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 40, height: 3, background: "#1a3a1a", borderRadius: 2 }}>
                            <div style={{ width: `${d.engagement}%`, height: "100%", background: "#00ff88", borderRadius: 2 }} />
                          </div>
                          <span style={{ color: "#00ff88", fontSize: 9 }}>{d.engagement}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "6px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 40, height: 3, background: "#1a3a1a", borderRadius: 2 }}>
                            <div style={{ width: `${d.attention}%`, height: "100%", background: "#00ccff", borderRadius: 2 }} />
                          </div>
                          <span style={{ color: "#00ccff", fontSize: 9 }}>{d.attention}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "6px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 40, height: 3, background: "#1a3a1a", borderRadius: 2 }}>
                            <div style={{ width: `${d.behavior}%`, height: "100%", background: "#ffaa00", borderRadius: 2 }} />
                          </div>
                          <span style={{ color: "#ffaa00", fontSize: 9 }}>{d.behavior}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "6px 14px" }}>
                        <span style={{
                          fontSize: 8, padding: "2px 7px", letterSpacing: 1,
                          border: `1px solid ${d.engagement > 75 ? "#00ff88" : d.engagement > 55 ? "#ffaa00" : "#ff4455"}`,
                          color: d.engagement > 75 ? "#00ff88" : d.engagement > 55 ? "#ffaa00" : "#ff4455",
                        }}>
                          {d.engagement > 75 ? "YAXSHI" : d.engagement > 55 ? "O'RTACHA" : "YOMON"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}