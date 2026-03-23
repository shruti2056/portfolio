/* ============================================================
   BACKGROUND CANVAS — Aurora mesh (dark) / Watercolour (light)
============================================================ */
(function(){
  const cv  = document.getElementById('bgCanvas');
  const ctx = cv.getContext('2d');
  let W, H, t = 0;

  function isLight(){ return document.body.classList.contains('light'); }

  function resize(){
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    initDark(); initLight();
  }
  window.addEventListener('resize', resize);

  /* DARK — aurora plasma mesh */
  const V1=[155,89,255], V2=[232,90,213], V3=[99,60,180], V4=[200,130,255];
  function lerpC(a,b,f){ return a.map((v,i)=>Math.round(v+(b[i]-v)*f)); }
  function rgbaC(c,a){ return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

  let meshNodes=[], COLS=0, ROWS=0;
  const CELL=90;

  function initDark(){
    COLS = Math.ceil(W/CELL)+2; ROWS = Math.ceil(H/CELL)+2;
    meshNodes=[];
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) meshNodes.push({
      bx:c*CELL-CELL, by:r*CELL-CELL,
      ox:(Math.random()-.5)*CELL*.6, oy:(Math.random()-.5)*CELL*.6,
      phase:Math.random()*Math.PI*2, speed:.004+Math.random()*.006, amp:18+Math.random()*22,
    });
  }
  function meshPos(n,time){ return { x:n.bx+n.ox+Math.sin(time*n.speed+n.phase)*n.amp, y:n.by+n.oy+Math.cos(time*n.speed*.7+n.phase+1)*n.amp }; }

  function drawMesh(time){
    for(let r=0;r<ROWS-1;r++) for(let c=0;c<COLS-1;c++){
      const i=r*COLS+c;
      const a=meshPos(meshNodes[i],time), b=meshPos(meshNodes[i+1],time),
            d=meshPos(meshNodes[i+COLS],time), e=meshPos(meshNodes[i+COLS+1],time);
      const hue=(Math.sin(time*.0015+c*.3+r*.2)*.5+.5);
      const col=lerpC(lerpC(V1,V2,hue),V3,Math.sin(time*.0008+r*.15)*.5+.5);
      const col2=lerpC(V2,V4,Math.cos(time*.001+c*.2)*.5+.5);
      const alpha=.04+Math.abs(Math.sin(time*.001+i*.05))*.05;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.lineTo(e.x,e.y); ctx.closePath();
      ctx.fillStyle=rgbaC(col,alpha); ctx.fill();
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(e.x,e.y); ctx.lineTo(d.x,d.y); ctx.closePath();
      ctx.fillStyle=rgbaC(col2,alpha*.8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.moveTo(a.x,a.y); ctx.lineTo(d.x,d.y);
      ctx.strokeStyle=rgbaC(V4,.06); ctx.lineWidth=.5; ctx.stroke();
    }
  }

  const halos=[
    {cx:.18,cy:.28,r:.14,sides:6,rot:0,speed:.003,col:V2},
    {cx:.82,cy:.55,r:.18,sides:8,rot:1,speed:-.002,col:V4},
    {cx:.5,cy:.85,r:.10,sides:3,rot:2,speed:.005,col:V1},
    {cx:.72,cy:.18,r:.08,sides:5,rot:0,speed:.004,col:V3},
  ];
  function drawHalo(h){
    const cx=h.cx*W, cy=h.cy*H, r=h.r*Math.min(W,H); h.rot+=h.speed;
    for(let k=3;k>=1;k--){
      const rk=r*(k/3); ctx.beginPath();
      for(let s=0;s<=h.sides;s++){ const a=(s/h.sides)*Math.PI*2+h.rot; s===0?ctx.moveTo(cx+Math.cos(a)*rk,cy+Math.sin(a)*rk):ctx.lineTo(cx+Math.cos(a)*rk,cy+Math.sin(a)*rk); }
      ctx.closePath(); ctx.strokeStyle=rgbaC(h.col,.07+k*.04); ctx.lineWidth=.7; ctx.stroke();
    }
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(h.rot*1.5);
    for(let arm=0;arm<4;arm++){ const a=arm*Math.PI/2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*r*.25,Math.sin(a)*r*.25); ctx.strokeStyle=rgbaC(h.col,.12); ctx.lineWidth=.6; ctx.stroke(); }
    ctx.restore();
  }

  const GLYPHS=['∞','∂','∑','√','π','∆','◈','⬡','⌬','⍟','⊕','⋆','⟁','⊗'];
  let glyphParticles=[];
  function initGlyphs(){
    glyphParticles=[];
    for(let i=0;i<18;i++) glyphParticles.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,char:GLYPHS[Math.floor(Math.random()*GLYPHS.length)],size:12+Math.floor(Math.random()*18),alpha:.04+Math.random()*.1,col:[V1,V2,V3,V4][Math.floor(Math.random()*4)],life:Math.random(),ls:.001+Math.random()*.002});
  }
  function drawGlyphs(){
    glyphParticles.forEach(g=>{
      g.life+=g.ls;
      if(g.life>1){ g.life=0; g.x=Math.random()*W; g.y=Math.random()*H; g.char=GLYPHS[Math.floor(Math.random()*GLYPHS.length)]; return; }
      const a=g.life<.3?g.life/.3:g.life>.7?(1-g.life)/.3:1;
      ctx.font=`${g.size}px 'Space Grotesk',sans-serif`; ctx.fillStyle=rgbaC(g.col,g.alpha*a); ctx.fillText(g.char,g.x,g.y);
      g.x+=g.vx; g.y+=g.vy; if(g.x<0)g.x=W; if(g.x>W)g.x=0; if(g.y<0)g.y=H; if(g.y>H)g.y=0;
    });
  }

  /* LIGHT — watercolour blobs + mandala */
  const LV1=[167,139,250],LV2=[216,180,254],LV3=[232,90,213],LV4=[251,207,232];
  let blobs=[], mandalaAngle=0, constellationPts=[];
  function initLight(){
    blobs=[];
    for(let i=0;i<22;i++) blobs.push({x:Math.random()*W,y:Math.random()*H,rx:50+Math.random()*120,ry:40+Math.random()*100,rot:Math.random()*Math.PI,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,vrot:(Math.random()-.5)*.003,alpha:.04+Math.random()*.06,col:[LV1,LV2,LV3,LV4][Math.floor(Math.random()*4)],phase:Math.random()*Math.PI*2,phaseSpeed:.003+Math.random()*.004});
    constellationPts=[];
    for(let i=0;i<50;i++) constellationPts.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2,alpha:.08+Math.random()*.18,col:[LV1,LV2,LV3][Math.floor(Math.random()*3)]});
  }
  function drawBlobs(){
    blobs.forEach(b=>{
      b.phase+=b.phaseSpeed; const pulse=.85+Math.sin(b.phase)*.15;
      ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.rot); ctx.beginPath(); ctx.ellipse(0,0,b.rx*pulse,b.ry*pulse,0,0,Math.PI*2);
      ctx.fillStyle=`rgba(${b.col[0]},${b.col[1]},${b.col[2]},${b.alpha})`; ctx.fill(); ctx.restore();
      b.x+=b.vx; b.y+=b.vy; b.rot+=b.vrot;
      if(b.x<-b.rx)b.x=W+b.rx; if(b.x>W+b.rx)b.x=-b.rx; if(b.y<-b.ry)b.y=H+b.ry; if(b.y>H+b.ry)b.y=-b.ry;
    });
  }
  function drawMandala(){
    mandalaAngle+=.004; const cx=W*.5,cy=H*.5,maxR=Math.min(W,H)*.22,rings=5,petals=12;
    for(let ring=rings;ring>=1;ring--){ const r=maxR*(ring/rings);
      for(let p=0;p<petals;p++){ const a=mandalaAngle*(ring%2===0?1:-1)+(p/petals)*Math.PI*2,a2=a+Math.PI*2/petals,col=[LV1,LV2,LV3,LV4][(ring+p)%4];
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,a,a2); ctx.closePath();
        ctx.strokeStyle=`rgba(${col[0]},${col[1]},${col[2]},${.04+ring*.015})`; ctx.lineWidth=.7; ctx.stroke();
        ctx.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},${.008+ring*.006})`; ctx.fill();
      }
    }
    ctx.beginPath(); ctx.arc(cx,cy,8,0,Math.PI*2); ctx.fillStyle=`rgba(${LV3[0]},${LV3[1]},${LV3[2]},.18)`; ctx.fill();
  }
  function drawConstellation(){
    constellationPts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(${p.col[0]},${p.col[1]},${p.col[2]},${p.alpha})`; ctx.fill(); });
    for(let i=0;i<constellationPts.length;i++) for(let j=i+1;j<constellationPts.length;j++){
      const a=constellationPts[i],b=constellationPts[j],dx=a.x-b.x,dy=a.y-b.y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<120){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(${LV2[0]},${LV2[1]},${LV2[2]},${(1-dist/120)*.1})`; ctx.lineWidth=.5; ctx.stroke(); }
    }
  }

  function draw(){ t++; ctx.clearRect(0,0,W,H); if(isLight()){ drawBlobs(); drawMandala(); drawConstellation(); } else { drawMesh(t); halos.forEach(drawHalo); drawGlyphs(); } requestAnimationFrame(draw); }

  W=cv.width=window.innerWidth; H=cv.height=window.innerHeight;
  initDark(); initGlyphs(); initLight(); draw();
})();

/* ============================================================
   STORAGE HELPERS
============================================================ */
function saveToStorage(key,value){ try{ localStorage.setItem(key,value); }catch(e){} }
function loadFromStorage(key){ try{ return localStorage.getItem(key); }catch(e){ return null; } }

/* ============================================================
   CLOUDINARY + JSONBIN CONFIG (for photo sync only)
   1. Cloudinary: sign up → Dashboard copy Cloud name
      Settings → Upload → Add unsigned preset → copy name
   2. JSONBin: sign up → New Bin {} → copy Bin ID + Master Key
============================================================ */
const CLOUD_NAME    = 'YOUR_CLOUD_NAME';
const UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';
const JSONBIN_ID    = 'YOUR_BIN_ID';
const JSONBIN_KEY   = 'YOUR_JSONBIN_API_KEY';
const CONFIGURED    = CLOUD_NAME !== 'YOUR_CLOUD_NAME' && JSONBIN_ID !== 'YOUR_BIN_ID';

async function uploadToCloudinary(file){
  if(!CONFIGURED) return null;
  const fd = new FormData(); fd.append('file',file); fd.append('upload_preset',UPLOAD_PRESET);
  try{ const res=await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,{method:'POST',body:fd}); const data=await res.json(); return data.secure_url||null; }catch(e){ return null; }
}
async function remoteLoad(){
  if(!CONFIGURED) return null;
  try{ const res=await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`,{headers:{'X-Master-Key':JSONBIN_KEY,'X-Bin-Meta':'false'}}); return await res.json(); }catch(e){ return null; }
}
async function remoteWrite(data){
  if(!CONFIGURED) return;
  try{ await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`,{method:'PUT',headers:{'Content-Type':'application/json','X-Master-Key':JSONBIN_KEY},body:JSON.stringify(data)}); }catch(e){}
}

/* sync photo on load */
(async function syncOnLoad(){
  const remote = await remoteLoad();
  if(!remote) return;
  if(remote.photoUrl) applyPhoto(remote.photoUrl, remote.photoName||'photo');
})();

/* ============================================================
   PHOTO UPLOAD
============================================================ */
function applyPhoto(src, name){
  const img = document.getElementById('photoImg');
  img.src = src; img.style.display = 'block';
  document.getElementById('photoPlaceholder').style.display = 'none';
  const short = name && name.length>18 ? name.slice(0,15)+'...' : (name||'photo').toUpperCase();
  document.getElementById('photoName').textContent = short;
  const badge = document.getElementById('photoBadge');
  badge.textContent = 'LOADED'; badge.style.color = 'var(--green)';
}

document.getElementById('photoInput').addEventListener('change', async function(){
  const file = this.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    applyPhoto(e.target.result, file.name);
    const badge = document.getElementById('photoBadge');
    badge.textContent = 'UPLOADING…'; badge.style.color = 'var(--cyan)';
    const url = await uploadToCloudinary(file);
    if(url){
      saveToStorage('sc_photo_url',url); saveToStorage('sc_photo_name',file.name); saveToStorage('sc_photo_data','');
      applyPhoto(url, file.name);
      const remote = await remoteLoad()||{}; remote.photoUrl=url; remote.photoName=file.name; await remoteWrite(remote);
    } else {
      saveToStorage('sc_photo_data',e.target.result); saveToStorage('sc_photo_name',file.name);
    }
  };
  reader.readAsDataURL(file);
});

/* restore photo on load */
(function(){
  const img = document.getElementById('photoImg');
  if(img.getAttribute('src') && img.getAttribute('src').length>0){
    img.style.display='block'; document.getElementById('photoPlaceholder').style.display='none';
    document.getElementById('photoBadge').textContent='LOADED'; document.getElementById('photoBadge').style.color='var(--green)'; return;
  }
  const url=loadFromStorage('sc_photo_url'), b64=loadFromStorage('sc_photo_data'), name=loadFromStorage('sc_photo_name');
  if(url) applyPhoto(url,name); else if(b64) applyPhoto(b64,name);
})();

/* ============================================================
   CURSOR
============================================================ */
const cur=document.getElementById('cur'), curR=document.getElementById('cur-r');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; cur.style.left=mx+'px'; cur.style.top=my+'px'; });
(function aR(){ rx+=(mx-rx)*.1; ry+=(my-ry)*.1; curR.style.left=rx+'px'; curR.style.top=ry+'px'; requestAnimationFrame(aR); })();
document.querySelectorAll('a,button,.tag,.cc,.ach,.cl').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ cur.style.width='14px'; cur.style.height='14px'; curR.style.width='44px'; curR.style.height='44px'; });
  el.addEventListener('mouseleave',()=>{ cur.style.width='8px'; cur.style.height='8px'; curR.style.width='30px'; curR.style.height='30px'; });
});

/* ============================================================
   PROGRESS BAR & NAV
============================================================ */
window.addEventListener('scroll',()=>{
  const s=document.documentElement;
  document.getElementById('prog').style.width=(s.scrollTop/(s.scrollHeight-s.clientHeight)*100)+'%';
  document.getElementById('nav').classList.toggle('scrolled',window.scrollY>60);
});

/* ============================================================
   THEME TOGGLE
============================================================ */
(function(){ if(localStorage.getItem('sc_theme')==='light') document.body.classList.add('light'); })();
document.getElementById('themeBtn').addEventListener('click',()=>{
  const isLight=document.body.classList.toggle('light');
  localStorage.setItem('sc_theme',isLight?'light':'dark');
  const icon=document.getElementById('themeIcon');
  if(isLight){ icon.innerHTML='<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'; }
  else { icon.innerHTML='<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'; }
});

/* ============================================================
   CERT VIEWER MODAL
============================================================ */
function openCertViewer(title, url){
  const modal=document.getElementById('certViewModal');
  document.getElementById('certViewTitle').textContent='// '+title;
  document.getElementById('certViewFrame').src=url;
  document.getElementById('certViewOpen').href=url;
  modal.style.display='flex'; document.body.style.overflow='hidden';
}
function closeCertViewer(){
  const modal=document.getElementById('certViewModal');
  modal.style.display='none'; document.getElementById('certViewFrame').src=''; document.body.style.overflow='';
}
document.getElementById('certViewModal').addEventListener('click',function(e){ if(e.target===this) closeCertViewer(); });

/* ============================================================
   RESUME VIEWER MODAL
============================================================ */
function openResumeViewer(){ const m=document.getElementById('resumeModal'); m.style.display='flex'; document.body.style.overflow='hidden'; }
function closeResumeViewer(){ const m=document.getElementById('resumeModal'); m.style.display='none'; document.body.style.overflow=''; }
document.getElementById('resumeModal').addEventListener('click',function(e){ if(e.target===this) closeResumeViewer(); });

/* global Escape key */
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    document.body.style.overflow='';
    closeResumeViewer(); closeCertViewer();
  }
});

/* ============================================================
   CONTACT FORM — EmailJS
   SETUP: sign up free at emailjs.com → replace YOUR_* below
============================================================ */
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

(function(){ if(typeof emailjs!=='undefined'&&EMAILJS_PUBLIC_KEY!=='YOUR_PUBLIC_KEY') emailjs.init({publicKey:EMAILJS_PUBLIC_KEY}); })();

document.getElementById('sendBtn').addEventListener('click',function(){
  const name=document.getElementById('fname').value.trim();
  const email=document.getElementById('femail').value.trim();
  const msg=document.getElementById('fmsg').value.trim();
  const fb=document.getElementById('formFeedback'), btn=this;

  if(!name){ showFbError('Please enter your name.'); return; }
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showFbError('Please enter a valid email address.'); return; }
  if(!msg){ showFbError('Please write a message first.'); return; }

  if(typeof emailjs!=='undefined'&&EMAILJS_PUBLIC_KEY!=='YOUR_PUBLIC_KEY'){
    btn.textContent='Sending...'; btn.style.opacity='.7'; btn.disabled=true;
    emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,{from_name:name,from_email:email,message:msg,to_email:'shruti.asn@rediffmail.com'})
    .then(()=>{
      fb.style.color='var(--green)'; fb.textContent="◆ Message sent! I'll get back to you soon."; fb.style.display='block';
      btn.textContent='Sent ✓'; btn.style.background='var(--green)'; btn.style.opacity='1';
      document.getElementById('fname').value=''; document.getElementById('femail').value=''; document.getElementById('fmsg').value='';
      setTimeout(()=>{ btn.textContent='Send Message →'; btn.style.background=''; btn.disabled=false; fb.style.display='none'; },5000);
    })
    .catch(err=>{ console.error('EmailJS error:',err); fallbackMailto(name,email,msg); btn.textContent='Send Message →'; btn.style.opacity='1'; btn.disabled=false; });
  } else {
    fallbackMailto(name,email,msg);
  }
});

function fallbackMailto(name,email,msg){
  const subject=encodeURIComponent('Portfolio Enquiry from '+name);
  const body=encodeURIComponent('Hi Shruti,\n\n'+msg+'\n\n---\nFrom: '+name+'\nReply-to: '+email);
  window.open('mailto:shruti.asn@rediffmail.com?subject='+subject+'&body='+body);
  const fb=document.getElementById('formFeedback');
  fb.style.color='var(--cyan)'; fb.textContent='◆ Opening your email app — message is pre-filled and ready to send.'; fb.style.display='block';
  setTimeout(()=>{ fb.style.display='none'; },5000);
}
function showFbError(msg){ const fb=document.getElementById('formFeedback'); fb.style.color='#ff6b6b'; fb.textContent='✕ '+msg; fb.style.display='block'; setTimeout(()=>{ fb.style.display='none'; },3500); }

/* ============================================================
   SCROLL REVEAL
============================================================ */
const io=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('on'); }); },{threshold:.08});
document.querySelectorAll('.rev').forEach(el=>io.observe(el));