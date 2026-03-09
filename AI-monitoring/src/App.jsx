import { useState, useEffect, useRef } from "react";

const ROOMS = [
  { id: 1, name: "Xona 101", teacher: "Azimov B.",   subject: "Matematika",  domain: "cam://192.168.1.101", floor: "1-qavat" },
  { id: 2, name: "Xona 102", teacher: "Karimova N.", subject: "Fizika",      domain: "cam://192.168.1.102", floor: "1-qavat" },
  { id: 3, name: "Xona 201", teacher: "Toshmatov A.",subject: "Biologiya",   domain: "cam://192.168.1.103", floor: "2-qavat" },
  { id: 4, name: "Xona 202", teacher: "Yusupova M.", subject: "Ingliz tili", domain: "cam://192.168.1.104", floor: "2-qavat" },
  { id: 5, name: "Xona 301", teacher: "Rahimov S.",  subject: "Kimyo",       domain: "cam://192.168.1.105", floor: "3-qavat" },
  { id: 6, name: "Xona 302", teacher: "Nazarova D.", subject: "Tarix",       domain: "cam://192.168.1.106", floor: "3-qavat" },
];

const CLASSES = ["5-A","5-B","6-A","6-B","7-A","7-B"];
const CLASS_SIZES = {"5-A":28,"5-B":30,"6-A":26,"6-B":29,"7-A":27,"7-B":31};

// period:null = break/bigbreak
const SCHEDULE = [
  { period:1, label:"1-dars",        start:"08:30",end:"09:15",type:"lesson" },
  { period:null,label:"Tanaffus",    start:"09:15",end:"09:20",type:"break",  duration:5 },
  { period:2, label:"2-dars",        start:"09:20",end:"10:05",type:"lesson" },
  { period:null,label:"Katta tanaffus",start:"10:05",end:"10:20",type:"bigbreak",duration:15 },
  { period:3, label:"3-dars",        start:"10:20",end:"11:05",type:"lesson" },
  { period:null,label:"Tanaffus",    start:"11:05",end:"11:10",type:"break",  duration:5 },
  { period:4, label:"4-dars",        start:"11:10",end:"11:55",type:"lesson" },
  { period:null,label:"Tanaffus",    start:"11:55",end:"12:00",type:"break",  duration:5 },
  { period:5, label:"5-dars",        start:"12:00",end:"12:45",type:"lesson" },
  { period:null,label:"Katta tanaffus",start:"12:45",end:"13:20",type:"bigbreak",duration:35 },
  { period:6, label:"6-dars",        start:"13:20",end:"14:05",type:"lesson" },
  { period:null,label:"Tanaffus",    start:"14:05",end:"14:10",type:"break",  duration:5 },
  { period:7, label:"7-dars",        start:"14:10",end:"14:55",type:"lesson" },
  { period:null,label:"Tanaffus/Dars tugadi",  start:"14:55",end:"15:00",type:"break",  duration:5 },
  { period:8, label:"8-dars",        start:"15:00",end:"15:45",type:"lesson" },
];

const ROTATION = {
  1:["5-A","5-B","6-A","6-B","7-A","7-B"],
  2:["6-B","5-A","7-A","5-B","7-B","6-A"],
  3:["7-A","6-B","5-B","7-B","6-A","5-A"],
  4:["5-B","7-A","7-B","6-A","5-A","6-B"],
  5:["7-B","6-A","5-A","7-A","6-B","5-B"],
  6:["6-A","7-B","6-B","5-A","5-B","7-A"],
  7:["5-A","6-A","7-B","5-B","7-A","6-B"],
};

function parseTime(str){ const [h,m]=str.split(":").map(Number); return h*60+m; }

function getCurrentSlot(totalMins){
  for(let i=0;i<SCHEDULE.length;i++){
    const s=SCHEDULE[i];
    const start=parseTime(s.start), end=parseTime(s.end);
    if(totalMins>=start && totalMins<end) return {slot:s,index:i,elapsed:totalMins-start,total:end-start};
  }
  return null;
}

function CameraFeed({room, currentClass, isSelected, onClick}){
  const canvasRef=useRef(null);
  const animRef=useRef(null);
  const tc=useRef(0);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");
    const W=canvas.width, H=canvas.height;
    const count=currentClass ? CLASS_SIZES[currentClass] : 0;

    const draw=()=>{
      tc.current+=0.018;
      const t=tc.current;
      ctx.fillStyle="#040a06"; ctx.fillRect(0,0,W,H);

      if(!currentClass){
        ctx.fillStyle="rgba(0,100,40,0.04)"; ctx.fillRect(0,0,W,H);
        ctx.strokeStyle="rgba(0,255,100,0.04)"; ctx.lineWidth=0.5;
        for(let i=0;i<6;i++){
          ctx.beginPath();ctx.moveTo(0,i*(H/5));ctx.lineTo(W,i*(H/5));ctx.stroke();
          ctx.beginPath();ctx.moveTo(i*(W/5),0);ctx.lineTo(i*(W/5),H);ctx.stroke();
        }
        ctx.fillStyle="rgba(0,255,100,0.25)"; ctx.font="7px monospace"; ctx.textAlign="center";
        ctx.fillText("BO'SH XONA",W/2,H/2-5);
        ctx.fillStyle="rgba(0,255,100,0.12)"; ctx.font="5.5px monospace";
        ctx.fillText("TANAFFUS",W/2,H/2+8); ctx.textAlign="left";
      } else {
        // perspective grid
        ctx.strokeStyle="rgba(0,200,80,0.045)"; ctx.lineWidth=0.5;
        for(let i=0;i<7;i++){
          ctx.beginPath();ctx.moveTo(W*0.5,H*0.48);ctx.lineTo((i/6)*W,H);ctx.stroke();
        }
        for(let j=1;j<4;j++){
          ctx.beginPath();ctx.moveTo(0,H*0.48+(j/4)*H*0.52);ctx.lineTo(W,H*0.48+(j/4)*H*0.52);ctx.stroke();
        }
        // board
        ctx.fillStyle="#0a2212"; ctx.strokeStyle="#153a20"; ctx.lineWidth=1;
        ctx.fillRect(W*0.1,H*0.04,W*0.8,H*0.27); ctx.strokeRect(W*0.1,H*0.04,W*0.8,H*0.27);
        ctx.strokeStyle="rgba(160,220,160,0.18)"; ctx.lineWidth=0.7;
        for(let l=0;l<3;l++){
          ctx.beginPath();ctx.moveTo(W*0.15,H*0.1+l*13);ctx.lineTo(W*0.15+W*(0.25+Math.sin(t*0.05+l)*0.2),H*0.1+l*13);ctx.stroke();
        }
        // teacher
        const tx=W*0.5+Math.sin(t*0.28)*W*0.06, ty=H*0.42;
        ctx.beginPath();ctx.arc(tx,ty,4,0,Math.PI*2);ctx.fillStyle="#00ffaa";ctx.fill();
        ctx.beginPath();ctx.arc(tx,ty,7.5,0,Math.PI*2);ctx.strokeStyle="rgba(0,255,170,0.28)";ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle="#00ffaa";ctx.font="bold 5.5px monospace";ctx.fillText("O'QITUVCHI",tx-19,ty-10);
        // students
        const cols=6, rows=Math.ceil(Math.min(count,30)/cols);
        for(let i=0;i<Math.min(count,30);i++){
          const col=i%cols, row=Math.floor(i/cols);
          const sx=W*0.08+col*(W*0.84/cols)+W*0.07;
          const sy=H*0.53+row*(H*0.38/Math.max(rows,1));
          const wb=Math.sin(t*0.4+i*0.8)*1.1;
          const clrs=["#00ff88","#00ccff","#ffaa00","#ff8888","#aa88ff"];
          const c=clrs[i%clrs.length];
          ctx.strokeStyle=c+"55";ctx.lineWidth=0.7;ctx.strokeRect(sx-5,sy-6+wb,10,12);
          ctx.beginPath();ctx.arc(sx,sy+wb,2.2,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();
        }
      }

      // scanline
      const sy=((t*26)%H);
      const sg=ctx.createLinearGradient(0,sy-2,0,sy+2);
      sg.addColorStop(0,"transparent");sg.addColorStop(0.5,"rgba(0,255,100,0.09)");sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg;ctx.fillRect(0,sy-2,W,4);
      // noise
      for(let n=0;n<18;n++){
        ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.022})`;
        ctx.fillRect(Math.random()*W,Math.random()*H,1,1);
      }
      // top bar
      ctx.fillStyle="rgba(0,0,0,0.55)";ctx.fillRect(0,0,W,15);
      ctx.fillStyle=currentClass?"#00ff88":"#ff4444";ctx.font="bold 5.5px monospace";
      ctx.fillText(currentClass?"● REC":"● STANDBY",4,10);
      ctx.fillStyle="#ffffff55";ctx.font="5px monospace";
      ctx.fillText(room.domain,W*0.28,10);
      ctx.fillText(new Date().toLocaleTimeString(),W-40,10);
      // bottom bar
      ctx.fillStyle="rgba(0,0,0,0.55)";ctx.fillRect(0,H-14,W,14);
      ctx.fillStyle="#aaffcc";ctx.font="5px monospace";
      ctx.fillText(currentClass?`${currentClass}  |  ${CLASS_SIZES[currentClass]} o'q  |  ${room.subject}`:`${room.subject}  |  DARS YO'Q`,4,H-4);

      animRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(animRef.current);
  },[room,currentClass]);

  return(
    <div onClick={onClick} style={{cursor:"pointer",border:isSelected?"2px solid #00ff88":"1px solid #162216",
      borderRadius:3,overflow:"hidden",boxShadow:isSelected?"0 0 16px rgba(0,255,136,0.22)":"none",transition:"all 0.2s"}}>
      <canvas ref={canvasRef} width={230} height={142} style={{display:"block",width:"100%",height:"auto"}}/>
    </div>
  );
}

function AIPanel({room,currentClass,currentSlot}){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);

  useEffect(()=>{
    if(!currentClass||!currentSlot){setData(null);return;}
    setLoading(true);setData(null);setError(null);
    const prompt=`Sen maktab AI kuzatuv tizimisan. Tahlil qil:

Xona: ${room.name} (${room.floor})
O'qituvchi: ${room.teacher} — Fan: ${room.subject}
Kelgan sinf: ${currentClass} (${CLASS_SIZES[currentClass]} o'quvchi)
Joriy: ${currentSlot.label} (${currentSlot.start}–${currentSlot.end})

FAQAT JSON (boshqa hech narsa yo'q):
{"umumiyHolat":"YAXSHI|OʻRTACHA|YOMON","diqqat":0,"faollik":0,"intizom":0,"xulosa":"","munosabat":"","darsOqimi":"","ogohlantirishlar":[],"tavsiyalar":[],"muammolilar":0}`;

    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
        messages:[{role:"user",content:prompt}]})
    }).then(r=>r.json()).then(d=>{
      const txt=d.content?.[0]?.text||"";
      setData(JSON.parse(txt.replace(/```json|```/g,"").trim()));
      setLoading(false);
    }).catch(()=>{setError("Tahlil yuklanmadi");setLoading(false);});
  },[room.id,currentClass,currentSlot?.label]);

  const SC={"YAXSHI":"#00ff88","OʻRTACHA":"#ffaa00","YOMON":"#ff4455"};

  if(!currentClass) return(
    <div style={{textAlign:"center",padding:"50px 20px",color:"#2a4a2a"}}>
      <div style={{fontSize:28,marginBottom:10}}>◌</div>
      <div style={{fontSize:10,letterSpacing:2}}>TANAFFUS VAQTI</div>
      <div style={{fontSize:8,marginTop:6,color:"#1a3a1a"}}>Keyingi dars boshlanishini kuting</div>
    </div>
  );

  return(
    <div style={{fontFamily:"monospace",color:"#c8ffd8"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,borderBottom:"1px solid #1a3a1a",paddingBottom:10}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 8px #00ff88",animation:"pulse 1.5s infinite"}}/>
        <span style={{fontSize:9,color:"#88ffaa",letterSpacing:2}}>AI REAL-VAQT TAHLILI</span>
        <span style={{marginLeft:"auto",fontSize:8,color:"#446644"}}>{room.name}</span>
      </div>
      {loading&&(
        <div style={{textAlign:"center",padding:"28px 0",color:"#446644"}}>
          <div style={{fontSize:8,letterSpacing:3,marginBottom:10}}>TAHLIL QILINMOQDA</div>
          <div style={{display:"flex",justifyContent:"center",gap:3}}>
            {[0,1,2,3,4].map(i=>(
              <div key={i} style={{width:3,height:18,background:"#00ff88",
                animation:`bar 0.7s ${i*0.12}s infinite alternate`,opacity:0.2+i*0.16}}/>
            ))}
          </div>
        </div>
      )}
      {error&&<div style={{color:"#ff4455",fontSize:10,padding:16}}>⚠ {error}</div>}
      {data&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{padding:"3px 10px",border:`1px solid ${SC[data.umumiyHolat]||"#aaa"}`,
              color:SC[data.umumiyHolat]||"#aaa",fontSize:9,letterSpacing:3}}>{data.umumiyHolat}</div>
            <div style={{fontSize:8,color:"#668866"}}>{currentClass} · {CLASS_SIZES[currentClass]} o'quvchi</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[["DIQQAT",data.diqqat,"#00ccff"],["FAOLLIK",data.faollik,"#00ff88"],["INTIZOM",data.intizom,"#ffaa00"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#050d05",border:"1px solid #1a2a1a",padding:"6px 4px",textAlign:"center"}}>
                <div style={{fontSize:7,color:"#446644",letterSpacing:1,marginBottom:3}}>{l}</div>
                <div style={{fontSize:20,fontWeight:"bold",color:c}}>{v}</div>
                <div style={{marginTop:4,height:2,background:"#1a2a1a"}}>
                  <div style={{width:`${v}%`,height:"100%",background:c,transition:"width 1s"}}/>
                </div>
              </div>
            ))}
          </div>
          {[["XULOSA",data.xulosa,"#00ff88"],["DARS OQIMI",data.darsOqimi,"#00ccff"],["O'QITUVCHI MUNOSABATI",data.munosabat,"#ffaa00"]].map(([l,v,c])=>v&&(
            <div key={l} style={{background:"#050d05",border:"1px solid #1a3a1a",padding:"7px 10px",borderLeft:`3px solid ${c}`}}>
              <div style={{fontSize:7,color:"#446644",letterSpacing:2,marginBottom:3}}>{l}</div>
              <div style={{fontSize:9,lineHeight:1.6,color:c+"bb"}}>{v}</div>
            </div>
          ))}
          {data.ogohlantirishlar?.filter(Boolean).length>0&&(
            <div>
              <div style={{fontSize:7,color:"#ff8844",letterSpacing:2,marginBottom:4}}>⚠ OGOHLANTIRISHLAR</div>
              {data.ogohlantirishlar.filter(Boolean).map((w,i)=>(
                <div key={i} style={{fontSize:9,color:"#ffaa88",padding:"3px 0",borderBottom:"1px solid #1a0a0a"}}>› {w}</div>
              ))}
            </div>
          )}
          <div>
            <div style={{fontSize:7,color:"#44ff88",letterSpacing:2,marginBottom:4}}>✓ TAVSIYALAR</div>
            {data.tavsiyalar?.map((t,i)=>(
              <div key={i} style={{fontSize:9,color:"#88ffaa",padding:"3px 0",borderBottom:"1px solid #0a1a0a"}}>› {t}</div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#446644"}}>
            <span>Muammoli o'quvchilar:</span>
            <span style={{color:data.muammolilar>3?"#ff4455":"#ffaa00",fontWeight:"bold"}}>
              {data.muammolilar} / {CLASS_SIZES[currentClass]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function BellTimer({slot,elapsed,total}){
  const remaining=total-elapsed;
  const pct=(elapsed/total)*100;
  const mins=Math.floor(remaining);
  const secs=Math.round((remaining-mins)*60);
  const color=slot?.type==="bigbreak"?"#ffaa00":slot?.type==="break"?"#ff8844":"#00ff88";
  const icon=slot?.type==="bigbreak"?"☕":slot?.type==="break"?"🔔":"📚";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"6px 12px",
      border:`1px solid ${color}33`,background:`${color}07`,borderRadius:2,flex:1}}>
      <div style={{fontSize:8,color,letterSpacing:1.5,minWidth:90}}>
        {icon} {slot?.label?.toUpperCase()||""}
      </div>
      <div style={{flex:1,height:3,background:"#1a3a1a",borderRadius:2,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:2,transition:"width 1s linear"}}/>
      </div>
      <div style={{fontSize:13,fontWeight:"bold",color,fontFamily:"monospace",minWidth:44,textAlign:"right"}}>
        {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
      </div>
    </div>
  );
}

function ScheduleTable({selectedRoomId,currentSlotIndex}){
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:9,minWidth:800}}>
        <thead>
          <tr style={{borderBottom:"1px solid #1a3a1a"}}>
            <th style={{padding:"7px 12px",textAlign:"left",color:"#446644",fontWeight:"normal",fontSize:7,letterSpacing:1,whiteSpace:"nowrap",minWidth:130}}>
              XONA / O'QITUVCHI
            </th>
            {SCHEDULE.map((s,i)=>(
              <th key={i} style={{padding:"5px 6px",textAlign:"center",fontSize:7,whiteSpace:"nowrap",
                color:s.type==="lesson"?"#88ffaa":s.type==="bigbreak"?"#ffaa00":"#446644",
                fontWeight:s.type==="lesson"?"bold":"normal",letterSpacing:0.5,
                background:i===currentSlotIndex?"rgba(0,255,136,0.07)":"transparent",
                borderBottom:i===currentSlotIndex?"2px solid #00ff88":"2px solid transparent"}}>
                {s.label}<br/>
                <span style={{fontSize:6,opacity:0.5}}>{s.start}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROOMS.map(room=>(
            <tr key={room.id} style={{borderBottom:"1px solid #0d1a0d",
              background:room.id===selectedRoomId?"rgba(0,255,136,0.03)":"transparent"}}>
              <td style={{padding:"6px 12px",whiteSpace:"nowrap"}}>
                <div style={{fontSize:9,color:room.id===selectedRoomId?"#00ff88":"#88ffaa",fontWeight:"bold"}}>{room.name}</div>
                <div style={{fontSize:7,color:"#446644"}}>{room.teacher} · {room.subject}</div>
              </td>
              {SCHEDULE.map((s,i)=>{
                const cls=s.type==="lesson"?ROTATION[s.period]?.[room.id-1]:null;
                return(
                  <td key={i} style={{padding:"5px 6px",textAlign:"center",
                    background:i===currentSlotIndex?"rgba(0,255,136,0.05)":"transparent"}}>
                    {s.type==="lesson"&&cls?(
                      <div style={{background:"#0a1a0a",border:"1px solid #1a3a1a",padding:"2px 5px",
                        fontSize:8,color:"#88ffaa",display:"inline-block",borderRadius:2,
                        boxShadow:i===currentSlotIndex?"0 0 6px rgba(0,255,136,0.2)":"none"}}>
                        {cls}
                      </div>
                    ):s.type==="bigbreak"?(
                      <div style={{fontSize:8,color:"#ffaa00"}}>☕{s.duration}′</div>
                    ):s.type==="break"?(
                      <div style={{fontSize:7,color:"#2a4a2a"}}>—{s.duration}′</div>
                    ):null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App(){
  const [tab,setTab]=useState("cameras");
  const [selectedRoom,setSelectedRoom]=useState(ROOMS[0]);
  const [simMin,setSimMin]=useState(null);
  const [realMin,setRealMin]=useState(()=>{const n=new Date();return n.getHours()*60+n.getMinutes()+n.getSeconds()/60;});
  const [clockTime,setClockTime]=useState(new Date());

  useEffect(()=>{
    const t=setInterval(()=>{
      setClockTime(new Date());
      const n=new Date();setRealMin(n.getHours()*60+n.getMinutes()+n.getSeconds()/60);
    },1000);
    return()=>clearInterval(t);
  },[]);

  const currentMins=simMin!==null?simMin:realMin;
  const slotInfo=getCurrentSlot(currentMins);
  const currentSlotIndex=slotInfo?.index??null;
  const currentSlot=slotInfo?.slot;

  const currentClass=currentSlot?.type==="lesson"?ROTATION[currentSlot.period]?.[selectedRoom.id-1]:null;
  const roomCurrentClasses=ROOMS.map(r=>currentSlot?.type==="lesson"?ROTATION[currentSlot.period]?.[r.id-1]:null);

  const nextLesson=SCHEDULE.slice((currentSlotIndex||0)+1).find(s=>s.type==="lesson");
  const nextClassForRoom=nextLesson?ROTATION[nextLesson.period]?.[selectedRoom.id-1]:null;

  const simHH=String(Math.floor((simMin??currentMins)/60)).padStart(2,"0");
  const simMM=String(Math.floor((simMin??currentMins)%60)).padStart(2,"0");

  return(
    <div style={{minHeight:"100vh",background:"#030806",fontFamily:"'Courier New',monospace",color:"#c8ffd8"}}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes bar{from{transform:scaleY(0.3)}to{transform:scaleY(1)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#060e06;}
        ::-webkit-scrollbar-thumb{background:#1a3a1a;border-radius:2px;}
        button:hover{opacity:0.85;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#030806",borderBottom:"1px solid #0d2010",padding:"9px 18px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{border:"1px solid #00ff88",padding:"4px 7px",fontSize:13,color:"#00ff88"}}>◈</div>
        <div>
          <div style={{fontSize:12,fontWeight:"bold",letterSpacing:3,color:"#00ff88"}}>CLASSWATCH AI</div>
          <div style={{fontSize:6,color:"#446644",letterSpacing:2}}>O'QITUVCHI XONALARI · SINF ROTATSIYASI</div>
        </div>
        <div style={{flex:1,marginLeft:12}}>
          {slotInfo&&<BellTimer slot={currentSlot} elapsed={slotInfo.elapsed} total={slotInfo.total}/>}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",gap:2,alignItems:"flex-end"}}>
            <div style={{fontSize:6,color:"#446644",letterSpacing:1}}>VAQT SIMULYATSIYASI</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <input type="range" min={480} max={885} step={1}
                value={simMin!==null?simMin:currentMins}
                onChange={e=>setSimMin(Number(e.target.value))}
                style={{width:90,accentColor:"#00ff88"}}/>
              <button onClick={()=>setSimMin(null)} style={{background:"none",border:"1px solid #1a3a1a",
                color:"#446644",fontSize:6,padding:"2px 5px",cursor:"pointer",fontFamily:"inherit",letterSpacing:1}}>
                REAL
              </button>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:17,fontWeight:"bold",color:"#00ff88",letterSpacing:2,lineHeight:1}}>
              {simMin!==null?`${simHH}:${simMM}`:clockTime.toLocaleTimeString()}
            </div>
            <div style={{fontSize:6,color:"#446644"}}>{clockTime.toLocaleDateString("uz-UZ")}</div>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{borderBottom:"1px solid #0d2010",padding:"0 18px",display:"flex",gap:0,alignItems:"center"}}>
        {[["cameras","▦  KAMERALAR"],["analysis","◈  AI TAHLIL"],["schedule","▬  JADVAL"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{background:"none",border:"none",
            borderBottom:tab===id?"2px solid #00ff88":"2px solid transparent",
            color:tab===id?"#00ff88":"#446644",padding:"8px 14px",cursor:"pointer",
            fontSize:8,letterSpacing:2,fontFamily:"inherit",transition:"all 0.2s"}}>
            {lbl}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:14,alignItems:"center",fontSize:8,color:"#446644"}}>
          <span>Faol: <span style={{color:"#00ff88"}}>{currentSlot?.type==="lesson"?ROOMS.length:0}/{ROOMS.length}</span></span>
          <span>Bu xonada: <span style={{color:"#00ccff"}}>{currentClass||"—"}</span></span>
          {nextClassForRoom&&<span>Keyingi: <span style={{color:"#ffaa00"}}>{nextClassForRoom} ({nextLesson?.start})</span></span>}
        </div>
      </div>

      <div style={{display:"flex",height:"calc(100vh - 105px)"}}>
        {/* CAMERAS */}
        {tab==="cameras"&&(
          <div style={{flex:1,overflowY:"auto",padding:14}}>
            <div style={{fontSize:7,color:"#446644",letterSpacing:3,marginBottom:10}}>
              ● O'QITUVCHI XONALARI — JONLI OQIM
              {currentSlot&&<span style={{marginLeft:14,color:currentSlot.type==="lesson"?"#00ff88":"#ffaa00"}}>
                {" "}{currentSlot.label.toUpperCase()} · {currentSlot.start}–{currentSlot.end}
              </span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {ROOMS.map((room,ri)=>{
                const cls=roomCurrentClasses[ri];
                return(
                  <div key={room.id} onClick={()=>{setSelectedRoom(room);setTab("analysis");}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <div style={{fontSize:8,color:"#88ffaa",fontWeight:"bold"}}>
                        {room.name} <span style={{color:"#446644",fontWeight:"normal"}}>· {room.subject}</span>
                      </div>
                      {cls
                        ?<div style={{fontSize:7,background:"#0a2a0a",border:"1px solid #1a3a1a",padding:"1px 6px",color:"#00ff88"}}>{cls}</div>
                        :<div style={{fontSize:7,color:"#ff4444"}}>BO'SH</div>
                      }
                    </div>
                    <CameraFeed room={room} currentClass={cls} isSelected={selectedRoom?.id===room.id} onClick={()=>{}}/>
                    <div style={{fontSize:7,color:"#446644",marginTop:2,display:"flex",justifyContent:"space-between"}}>
                      <span>{room.teacher}</span><span>{room.floor}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ANALYSIS */}
        {tab==="analysis"&&(
          <>
            <div style={{width:"43%",borderRight:"1px solid #0d2010",overflowY:"auto",padding:14}}>
              <div style={{fontSize:7,color:"#446644",letterSpacing:3,marginBottom:10}}>XONA TANLANG</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {ROOMS.map((room,ri)=>{
                  const cls=roomCurrentClasses[ri];
                  return(
                    <div key={room.id} onClick={()=>setSelectedRoom(room)} style={{cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <div style={{fontSize:8,color:selectedRoom?.id===room.id?"#00ff88":"#88ffaa",fontWeight:"bold"}}>{room.name}</div>
                        {cls
                          ?<div style={{fontSize:7,background:"#0a2a0a",border:"1px solid #1a3a1a",padding:"1px 6px",color:"#00ff88"}}>{cls}</div>
                          :<div style={{fontSize:7,color:"#ff4444"}}>BO'SH</div>
                        }
                      </div>
                      <CameraFeed room={room} currentClass={cls} isSelected={selectedRoom?.id===room.id} onClick={()=>{}}/>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:18,background:"#040b04"}}>
              <AIPanel room={selectedRoom} currentClass={currentClass} currentSlot={currentSlot}/>
            </div>
          </>
        )}

        {/* SCHEDULE */}
        {tab==="schedule"&&(
          <div style={{flex:1,overflowY:"auto",padding:18}}>
            <div style={{fontSize:7,color:"#446644",letterSpacing:3,marginBottom:10}}>
              ▬ KUNLIK JADVAL — XONALAR & SINFLAR ROTATSIYASI (45 DAQIQA)
            </div>
            <div style={{display:"flex",gap:14,marginBottom:14,fontSize:7,color:"#446644",flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,background:"rgba(0,255,136,0.07)",border:"1px solid #00ff88"}}/><span>Joriy vaqt</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,background:"#0a1a0a",border:"1px solid #1a3a1a"}}/><span>Sinf</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span>☕</span><span>Katta tanaffus</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{color:"#ff8844"}}>2-darsdan keyin:</span>
                <span style={{color:"#ffaa00"}}>10 daqiqa tanaffus</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{color:"#ff8844"}}>5-darsdan keyin:</span>
                <span style={{color:"#ffaa00"}}>40 daqiqa tanaffus</span>
              </div>
            </div>

            <ScheduleTable selectedRoomId={selectedRoom?.id} currentSlotIndex={currentSlotIndex}/>

            {/* Period cards */}
            <div style={{marginTop:18}}>
              <div style={{fontSize:7,color:"#446644",letterSpacing:3,marginBottom:10}}>
                DARS BLOKLARI — ROTATSIYA TAFSILOTI
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {SCHEDULE.filter(s=>s.type==="lesson").map(s=>(
                  <div key={s.period} style={{border:"1px solid #1a3a1a",padding:10,background:"#040b04",
                    borderTop:currentSlot?.period===s.period?"2px solid #00ff88":"1px solid #1a3a1a"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                      <div style={{fontSize:9,color:"#88ffaa",fontWeight:"bold"}}>{s.label}</div>
                      <div style={{fontSize:7,color:"#446644"}}>{s.start}–{s.end}</div>
                    </div>
                    {ROOMS.map((room,ri)=>(
                      <div key={room.id} style={{display:"flex",justifyContent:"space-between",
                        padding:"2px 0",borderBottom:"1px solid #0a1a0a",fontSize:8}}>
                        <span style={{color:"#446644"}}>{room.name}</span>
                        <span style={{color:currentSlot?.period===s.period&&selectedRoom.id===room.id?"#00ff88":"#88ffaa"}}>
                          → {ROTATION[s.period]?.[ri]}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}