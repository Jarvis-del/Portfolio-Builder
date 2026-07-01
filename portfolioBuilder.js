/* ---------------- state ---------------- */
const state = {
  template: null,
  data: { name:'', title:'', bio:'', skills:[], projects:[], experience:'', education:'' },
  resumeFile: null,
  resumeUrl: null
};

const templates = [
  { id:'folio',   name:'Folio',   desc:'Editorial serif layout, cream paper, warm terracotta accent.', thumbClass:'thumb-folio',
    dot:'#c1602a', tags:['Editorial','Warm'], badge:'Popular' },
  { id:'console', name:'Console', desc:'Dark, monospace, code-inspired. For developers.', thumbClass:'thumb-console',
    dot:'#7fe89c', tags:['Dev','Dark mode'] },
  { id:'studio',  name:'Studio',  desc:'Bold geometric blocks, confident sans type.', thumbClass:'thumb-studio',
    dot:'#2c2a4a', tags:['Bold','Creative'] },
  { id:'atelier', name:'Atelier', desc:'Minimal, airy, lots of whitespace. Quietly confident.', thumbClass:'thumb-atelier',
    dot:'#1c1b18', tags:['Minimal'], badge:'Professional' },
  { id:'signal',  name:'Signal',  desc:'Dark UI with a warm sunset gradient accent.', thumbClass:'thumb-signal',
    dot:'#ff7a3c', tags:['Modern','Dark mode'] }
];

/* ---------------- render template gallery ---------------- */
const grid = document.getElementById('tplGrid');
templates.forEach(t=>{
  const card = document.createElement('div');
  card.className = 'tpl-card';
  card.dataset.id = t.id;
  card.innerHTML = `
    ${t.badge?`<div class="tpl-badge">${t.badge}</div>`:''}
    <div class="tpl-check">&#10003;</div>
    <div class="tpl-thumb ${t.thumbClass}">
      ${thumbInner(t.id)}
    </div>
    <div class="tpl-meta">
      <h3><span class="dot" style="background:${t.dot};"></span>${t.name}</h3>
      <p>${t.desc}</p>
      <div class="tpl-tags">${t.tags.map(tag=>`<span>${tag}</span>`).join('')}</div>
    </div>`;
  card.addEventListener('click', ()=>{
    document.querySelectorAll('.tpl-card').forEach(c=>c.classList.remove('selected'));
    card.classList.add('selected');
    state.template = t.id;
    goToStep(2);
  });
  grid.appendChild(card);
});

function thumbInner(id){
  if(id==='folio'){
    return `<div class="bar"></div><div class="bar2"></div><div class="lines"><div></div><div></div><div></div></div>`;
  }
  if(id==='console'){
    return `<div class="bar">&gt; whoami</div><div class="lines"><div></div><div></div></div><div class="chip">[ skills ]</div>`;
  }
  if(id==='studio'){
    return `<div class="block1"></div><div class="block2"></div><div class="lines"><div></div><div></div></div>`;
  }
  if(id==='atelier'){
    return `<div class="circle"></div><div class="bar"></div><div class="bar2"></div><div class="lines"><div></div><div></div></div>`;
  }
  if(id==='signal'){
    return `<div class="bar"></div><div class="lines"><div></div><div></div></div><div class="chip">available for work</div>`;
  }
  return '';
}

/* ---------------- step navigation ---------------- */
function goToStep(n){
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
  document.getElementById('step'+n).classList.add('active');
  const ind = document.getElementById('stepIndicator');
  const labels = ['1 Template','2 Details','3 Preview'];
  ind.innerHTML = labels.map((l,i)=> (i+1===n? '<b>'+l+'</b>' : l) ).join(' &nbsp;→&nbsp; ');
  window.scrollTo({top:0,behavior:'smooth'});
}
document.getElementById('backTo1').addEventListener('click', ()=>goToStep(1));
document.getElementById('backTo1b').addEventListener('click', ()=>goToStep(1));
document.getElementById('backTo2').addEventListener('click', ()=>goToStep(2));

/* ---------------- resume upload (in-browser only) ---------------- */
const uploadBox = document.getElementById('uploadBox');
const fResume = document.getElementById('fResume');
uploadBox.addEventListener('click', ()=>fResume.click());
fResume.addEventListener('change', ()=>{
  const file = fResume.files[0];
  if(!file) return;
  if(file.type !== 'application/pdf'){
    alert('Please choose a PDF file.');
    fResume.value='';
    return;
  }
  state.resumeFile = file;
  if(state.resumeUrl) URL.revokeObjectURL(state.resumeUrl);
  state.resumeUrl = URL.createObjectURL(file);
  uploadBox.classList.add('has-file');
  document.getElementById('uploadLabel').innerHTML = 'Selected: <span class="filename">'+file.name+'</span> — click to change';
});

/* ---------------- form -> preview ---------------- */
document.getElementById('toPreview').addEventListener('click', ()=>{
  const name = document.getElementById('fName').value.trim();
  const errEl = document.getElementById('err-fName');
  if(!name){
    errEl.style.display='block';
    document.getElementById('fName').focus();
    return;
  }
  errEl.style.display='none';

  state.data.name = name;
  state.data.title = document.getElementById('fTitle').value.trim();
  state.data.bio = document.getElementById('fBio').value.trim();
  state.data.skills = document.getElementById('fSkills').value.split(',').map(s=>s.trim()).filter(Boolean);

  const p1t = document.getElementById('fProject1Title').value.trim();
  const p1d = document.getElementById('fProject1Desc').value.trim();
  const p2t = document.getElementById('fProject2Title').value.trim();
  const p2d = document.getElementById('fProject2Desc').value.trim();
  state.data.projects = [];
  if(p1t || p1d) state.data.projects.push({ title:p1t, desc:p1d });
  if(p2t || p2d) state.data.projects.push({ title:p2t, desc:p2d });

  state.data.experience = document.getElementById('fExperience').value.trim();
  state.data.education = document.getElementById('fEducation').value.trim();

  renderPreview();
  goToStep(3);
});

/* ---------------- preview renderers ---------------- */
function esc(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function nl2br(s){ return esc(s).replace(/\n/g,'<br>'); }

function projectsInner(d, o){
  return d.projects.map(p=>`<div style="margin-bottom:14px;padding:16px 18px;background:${o.itemBg};border:1px solid ${o.itemBorder};border-radius:${o.radius||'10px'};">
    ${p.title?`<div style="font-weight:700;font-size:14.5px;color:${o.titleColor};margin-bottom:6px;font-family:${o.titleFont||'inherit'};">${esc(p.title)}</div>`:''}
    ${p.desc?`<div style="font-size:13.5px;line-height:1.7;color:${o.descColor};">${nl2br(p.desc)}</div>`:''}
  </div>`).join('');
}

function resumeBlockHtml(style){
  if(!state.resumeUrl) return '';
  const styles = {
    folio:  `style="display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:11px 22px;background:#1c1b18;border-radius:24px;color:#faf7f0;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:.01em;"`,
    console:`style="display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:10px 18px;background:#13201a;border:1px solid #2a4536;border-radius:6px;color:#7fe89c;text-decoration:none;font-family:'JetBrains Mono',monospace;font-size:12.5px;"`,
    studio: `style="display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:12px 24px;background:#fff;color:#15141f;text-decoration:none;font-size:13px;font-weight:700;border-radius:9px;"`,
    atelier:`style="display:inline-flex;align-items:center;gap:8px;margin-top:24px;padding:10px 22px;border:1px solid #1c1b18;border-radius:24px;color:#1c1b18;text-decoration:none;font-size:13px;font-weight:600;"`,
    signal: `style="display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:11px 22px;border-radius:24px;background:linear-gradient(95deg,#ffb13c,#ff7a3c);color:#1a1108;text-decoration:none;font-size:13px;font-weight:700;"`
  };
  const label = style==='console' ? 'download_resume.pdf' : 'Download resume (PDF)';
  return `<a href="${state.resumeUrl}" download="${esc(state.resumeFile.name)}" ${styles[style]}>${label}</a>`;
}

function renderPreview(){
  const d = state.data;
  const frame = document.getElementById('previewFrame');
  frame.innerHTML = builders[state.template](d);
}

const builders = {
  folio: (d)=>`
    <div style="background:#faf7f0;font-family:'Inter',-apple-system,sans-serif;color:#1c1b18;">
      <div class="pf-section" style="padding-bottom:40px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:26px;">
          <div style="width:34px;height:2px;background:#c1602a;"></div>
          <div style="font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#c1602a;font-weight:600;">${esc(d.title||'Portfolio')}</div>
        </div>
        <h1 style="font-family:'Fraunces',serif;font-size:56px;line-height:1.05;margin:0 0 18px;font-weight:500;letter-spacing:-0.02em;">${esc(d.name)}</h1>
        <p style="font-size:16.5px;line-height:1.75;max-width:540px;color:#52503f;">${nl2br(d.bio)}</p>
        ${resumeBlockHtml('folio')}
      </div>
      ${d.skills.length?`<div class="pf-section" style="padding-top:0;padding-bottom:36px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#9b9580;margin:0 0 16px;font-weight:600;">Skills</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px;">
          ${d.skills.map(s=>`<span style="background:#fff;border:1px solid #e4dfd0;padding:7px 15px;font-size:13px;border-radius:20px;color:#3a3829;">${esc(s)}</span>`).join('')}
        </div></div>`:''}
      ${d.projects.length?`<div class="pf-section" style="padding-top:32px;padding-bottom:36px;border-top:1px solid #e8e3d4;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#9b9580;margin:0 0 16px;font-weight:600;">Projects</div>
        ${projectsInner(d,{itemBg:'#fff',itemBorder:'#e8e3d4',titleColor:'#1c1b18',descColor:'#52503f',titleFont:"'Fraunces',serif"})}</div>`:''}
      ${d.experience?`<div class="pf-section" style="padding-top:32px;padding-bottom:36px;border-top:1px solid #e8e3d4;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#9b9580;margin:0 0 16px;font-weight:600;">Experience</div>
        <p style="font-size:15.5px;line-height:1.8;max-width:600px;color:#52503f;">${nl2br(d.experience)}</p></div>`:''}
      ${d.education?`<div class="pf-section" style="padding-top:32px;border-top:1px solid #e8e3d4;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#9b9580;margin:0 0 16px;font-weight:600;">Education</div>
        <p style="font-size:15.5px;line-height:1.8;max-width:600px;color:#52503f;">${nl2br(d.education)}</p></div>`:''}
    </div>`,

  console: (d)=>`
    <div style="background:#0c1210;color:#e3f5e8;font-family:'JetBrains Mono',monospace;">
      <div class="pf-section" style="padding-bottom:34px;">
        <div style="color:#7fe89c;font-size:13px;margin-bottom:14px;opacity:.85;">$ whoami</div>
        <h1 style="font-size:36px;margin:0 0 8px;color:#f3fff6;font-weight:600;letter-spacing:-0.01em;">${esc(d.name)}</h1>
        <div style="display:inline-block;color:#7fe89c;font-size:13px;background:#13201a;border:1px solid #1f3327;padding:4px 12px;border-radius:5px;margin-bottom:20px;">${esc(d.title||'')}</div>
        <p style="font-size:14px;line-height:1.85;max-width:600px;color:#a9c4af;margin-top:18px;">${nl2br(d.bio)}</p>
        ${resumeBlockHtml('console')}
      </div>
      ${d.skills.length?`<div class="pf-section" style="padding-top:0;padding-bottom:34px;border-top:1px solid #16201a;">
        <div style="color:#5c7a64;font-size:12px;margin:26px 0 14px;letter-spacing:.05em;">// skills</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${d.skills.map(s=>`<span style="background:#121c16;border:1px solid #233a2a;color:#7fe89c;padding:6px 13px;font-size:12.5px;border-radius:5px;">${esc(s)}</span>`).join('')}
        </div></div>`:''}
      ${d.projects.length?`<div class="pf-section" style="padding-top:0;padding-bottom:34px;border-top:1px solid #16201a;">
        <div style="color:#5c7a64;font-size:12px;margin:26px 0 14px;letter-spacing:.05em;">// projects</div>
        ${projectsInner(d,{itemBg:'#121c16',itemBorder:'#233a2a',titleColor:'#7fe89c',descColor:'#bcd8c1'})}</div>`:''}
      ${d.experience?`<div class="pf-section" style="padding-top:0;padding-bottom:34px;border-top:1px solid #16201a;">
        <div style="color:#5c7a64;font-size:12px;margin:26px 0 14px;letter-spacing:.05em;">// experience</div>
        <p style="font-size:14px;line-height:1.9;max-width:620px;color:#bcd8c1;">${nl2br(d.experience)}</p></div>`:''}
      ${d.education?`<div class="pf-section" style="padding-top:0;border-top:1px solid #16201a;">
        <div style="color:#5c7a64;font-size:12px;margin:26px 0 14px;letter-spacing:.05em;">// education</div>
        <p style="font-size:14px;line-height:1.9;max-width:620px;color:#bcd8c1;">${nl2br(d.education)}</p></div>`:''}
    </div>`,

  studio: (d)=>`
    <div style="background:#f5f3ee;font-family:'Inter',-apple-system,sans-serif;color:#15141f;">
      <div style="background:#2c2a4a;color:#fff;" class="pf-section">
        <div style="display:inline-block;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#cfcbff;font-weight:600;background:rgba(255,255,255,.08);padding:5px 13px;border-radius:20px;margin-bottom:18px;">${esc(d.title||'Portfolio')}</div>
        <h1 style="font-family:'Sora',sans-serif;font-size:44px;margin:0 0 14px;font-weight:800;letter-spacing:-0.02em;line-height:1.08;">${esc(d.name)}</h1>
        <p style="font-size:15.5px;line-height:1.75;max-width:560px;color:#c3c1e6;">${nl2br(d.bio)}</p>
        ${resumeBlockHtml('studio')}
      </div>
      ${d.skills.length?`<div class="pf-section" style="padding-bottom:32px;">
        <div style="font-family:'Sora',sans-serif;font-size:11.5px;text-transform:uppercase;letter-spacing:.14em;color:#8a8678;margin:0 0 16px;font-weight:700;">Skills</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px;">
          ${d.skills.map(s=>`<span style="background:#fff;border:1px solid #e2dfd5;padding:8px 16px;font-size:13px;font-weight:600;border-radius:9px;">${esc(s)}</span>`).join('')}
        </div></div>`:''}
      ${d.projects.length?`<div class="pf-section" style="padding-top:0;padding-bottom:32px;">
        <div style="font-family:'Sora',sans-serif;font-size:11.5px;text-transform:uppercase;letter-spacing:.14em;color:#8a8686;margin:0 0 16px;font-weight:700;">Projects</div>
        ${projectsInner(d,{itemBg:'#fff',itemBorder:'#e2dfd5',titleColor:'#2c2a4a',descColor:'#2a2935',titleFont:"'Sora',sans-serif"})}</div>`:''}
      ${d.experience?`<div class="pf-section" style="padding-top:0;padding-bottom:32px;">
        <div style="font-family:'Sora',sans-serif;font-size:11.5px;text-transform:uppercase;letter-spacing:.14em;color:#8a8686;margin:0 0 16px;font-weight:700;">Experience</div>
        <p style="font-size:15.5px;line-height:1.8;max-width:620px;color:#2a2935;">${nl2br(d.experience)}</p></div>`:''}
      ${d.education?`<div class="pf-section" style="padding-top:0;">
        <div style="font-family:'Sora',sans-serif;font-size:11.5px;text-transform:uppercase;letter-spacing:.14em;color:#8a8686;margin:0 0 16px;font-weight:700;">Education</div>
        <p style="font-size:15.5px;line-height:1.8;max-width:620px;color:#2a2935;">${nl2br(d.education)}</p></div>`:''}
    </div>`,

  atelier: (d)=>`
    <div style="background:#ffffff;font-family:'Inter',-apple-system,sans-serif;color:#1c1b18;">
      <div class="pf-section" style="padding-bottom:40px;text-align:center;padding-top:64px;">
        <div style="width:68px;height:68px;border-radius:50%;background:#1c1b18;margin:0 auto 26px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;color:#fff;letter-spacing:.02em;">${esc((d.name||'?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase())}</div>
        <h1 style="font-size:30px;margin:0 0 8px;font-weight:600;letter-spacing:-0.01em;">${esc(d.name)}</h1>
        <div style="color:#9b8f7a;font-size:13.5px;margin-bottom:22px;letter-spacing:.03em;">${esc(d.title||'')}</div>
        <p style="font-size:15px;line-height:1.85;max-width:460px;margin:0 auto;color:#5a5749;">${nl2br(d.bio)}</p>
        ${resumeBlockHtml('atelier')}
      </div>
      ${d.skills.length?`<div class="pf-section" style="padding-top:0;padding-bottom:34px;border-top:1px solid #efece4;text-align:center;">
        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:30px;">
          ${d.skills.map(s=>`<span style="font-size:12.5px;color:#3a3829;background:#f7f5ef;padding:6px 14px;border-radius:16px;">${esc(s)}</span>`).join('')}
        </div></div>`:''}
      ${d.projects.length?`<div class="pf-section" style="padding-top:0;padding-bottom:34px;border-top:1px solid #efece4;max-width:540px;margin:0 auto;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#9b8f7a;margin:28px 0 14px;font-weight:600;">Projects</div>
        ${projectsInner(d,{itemBg:'#f7f5ef',itemBorder:'#efece4',titleColor:'#1c1b18',descColor:'#3a3829'})}</div>`:''}
      ${d.experience?`<div class="pf-section" style="padding-top:0;border-top:1px solid #efece4;max-width:540px;margin:0 auto;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#9b8f7a;margin:28px 0 14px;font-weight:600;">Experience</div>
        <p style="font-size:15px;line-height:1.85;color:#3a3829;">${nl2br(d.experience)}</p></div>`:''}
      ${d.education?`<div class="pf-section" style="padding-top:0;border-top:1px solid #efece4;max-width:540px;margin:0 auto;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#9b8f7a;margin:28px 0 14px;font-weight:600;">Education</div>
        <p style="font-size:15px;line-height:1.85;color:#3a3829;">${nl2br(d.education)}</p></div>`:''}
    </div>`,

  signal: (d)=>`
    <div style="background:#0e151c;font-family:'Inter',-apple-system,sans-serif;color:#e8edf2;">
      <div class="pf-section" style="padding-bottom:36px;">
        <div style="display:inline-block;background:#192530;color:#ffb13c;font-size:11.5px;padding:5px 14px;border-radius:20px;margin-bottom:20px;letter-spacing:.04em;font-weight:500;">${esc(d.title||'Portfolio')}</div>
        <h1 style="font-family:'Space Grotesk',sans-serif;font-size:42px;margin:0 0 16px;font-weight:700;letter-spacing:-0.02em;line-height:1.08;background:linear-gradient(95deg,#ffb13c,#ff7a3c 60%,#ff5f8f);-webkit-background-clip:text;background-clip:text;color:transparent;">${esc(d.name)}</h1>
        <p style="font-size:15.5px;line-height:1.8;max-width:580px;color:#9fb0bd;">${nl2br(d.bio)}</p>
        ${resumeBlockHtml('signal')}
      </div>
      ${d.skills.length?`<div class="pf-section" style="padding-top:0;padding-bottom:32px;border-top:1px solid #182229;">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:11.5px;text-transform:uppercase;letter-spacing:.14em;color:#5c6f7c;margin:26px 0 16px;font-weight:600;">Skills</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px;">
          ${d.skills.map(s=>`<span style="background:#141d25;border:1px solid #223040;color:#dde6ec;padding:7px 15px;font-size:13px;border-radius:8px;">${esc(s)}</span>`).join('')}
        </div></div>`:''}
      ${d.projects.length?`<div class="pf-section" style="padding-top:0;padding-bottom:32px;border-top:1px solid #182229;">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:11.5px;text-transform:uppercase;letter-spacing:.14em;color:#5c6f7c;margin:26px 0 16px;font-weight:600;">Projects</div>
        ${projectsInner(d,{itemBg:'#141d25',itemBorder:'#223040',titleColor:'#ffb13c',descColor:'#c2cfd8',titleFont:"'Space Grotesk',sans-serif"})}</div>`:''}
      ${d.experience?`<div class="pf-section" style="padding-top:0;padding-bottom:32px;border-top:1px solid #182229;">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:11.5px;text-transform:uppercase;letter-spacing:.14em;color:#5c6f7c;margin:26px 0 16px;font-weight:600;">Experience</div>
        <p style="font-size:15px;line-height:1.85;max-width:620px;color:#c2cfd8;">${nl2br(d.experience)}</p></div>`:''}
      ${d.education?`<div class="pf-section" style="padding-top:0;border-top:1px solid #182229;">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:11.5px;text-transform:uppercase;letter-spacing:.14em;color:#5c6f7c;margin:26px 0 16px;font-weight:600;">Education</div>
        <p style="font-size:15px;line-height:1.85;max-width:620px;color:#c2cfd8;">${nl2br(d.education)}</p></div>`:''}
    </div>`
};
