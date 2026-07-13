const app = document.querySelector('#app');

const state = {
  role: 'client',
  loggedIn: false,
  clientView: 'today',
  adminView: 'dashboard',
  workoutOpen: false,
  exerciseIndex: 0,
  setsDone: [false, false, false],
  timer: 20,
  timerId: null,
  water: 4,
  habits: [true, false, false],
  mealPhoto: null,
  appointment: { date: 'Dienstag, 14. Juli', time: '09:30', type: 'Persönlicher Video-Check-in', status: 'Bestätigt' },
  messages: [
    { mine: false, text: 'Guten Morgen Anna! Heute steht dein Power-Workout an. Achte bei den Kniebeugen auf einen stabilen Rumpf. 💪', time: '08:12' },
    { mine: true, text: 'Guten Morgen Sergio! Ich bin bereit. Das Knie fühlt sich heute auch gut an.', time: '08:18' },
    { mine: false, text: 'Perfekt. Starte kontrolliert und gib mir danach kurz Feedback.', time: '08:20' }
  ],
  exercises: [
    { name: 'Kniebeugen', target: '3 × 10', rest: '60 Sek.', unit: 'Wdh.', values: [10,10,10], weight: [20,20,20], duration: false },
    { name: 'Push-ups', target: '3 × 12', rest: '60 Sek.', unit: 'Wdh.', values: [12,12,12], weight: [0,0,0], duration: false },
    { name: 'Plank', target: '3 × 20 Sek.', rest: '45 Sek.', unit: 'Sek.', values: [20,20,20], weight: [0,0,0], duration: true }
  ],
  clients: [
    { name:'Anna Weber', initials:'AW', plan:'Strong Start', adherence:86, status:'Aktiv', alert:false, last:'Heute, 08:18' },
    { name:'Jonas Klein', initials:'JK', plan:'Muscle Pro', adherence:72, status:'Check-in offen', alert:true, last:'Gestern' },
    { name:'Miriam Roth', initials:'MR', plan:'Lady Fit', adherence:94, status:'Aktiv', alert:false, last:'Vor 2 Std.' },
    { name:'Daniel Vogt', initials:'DV', plan:'Back in Motion', adherence:58, status:'Training verpasst', alert:true, last:'Vor 4 Tagen' }
  ],
  progress: { sessionsDone: 2, sessionsGoal: 3, totalSessions: 8, adherence: 86, performance: 12 },
  checkins: []
};

// --- Persistenz -----------------------------------------------------------
// Der Demo-Zustand überlebt einen Reload, damit sich die App wie ein echtes
// Produkt anfühlt. Flüchtige Dinge (laufender Timer, Blob-Vorschau des Fotos,
// offener Workout-Screen) werden bewusst nicht gespeichert.
const STORAGE_KEY = 'maestro-plan/v1';
const PERSIST_KEYS = ['role','loggedIn','clientView','adminView','water','habits','appointment','messages','exercises','clients','progress','checkins'];

function saveState() {
  try {
    const snapshot = {};
    for (const key of PERSIST_KEYS) snapshot[key] = state[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) { /* Speicher nicht verfügbar (z. B. Privatmodus) – Demo läuft trotzdem */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    for (const key of PERSIST_KEYS) if (key in data) state[key] = data[key];
  } catch (err) { /* Beschädigte Daten ignorieren und mit Defaults starten */ }
}

function resetState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* egal */ }
}

const icons = { today:'⌂', plan:'▦', nutrition:'◉', chat:'✦', appointments:'◷', more:'•••' };

function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

function brand(compact = false) {
  return `<div class="brand"><img class="brand-logo" src="assets/maestro-logo.png" alt="The Maestro Plan">${compact ? '' : '<div class="brand-copy"><strong>Maestro Plan</strong><small>Inspiring your health</small></div>'}</div>`;
}

function login() {
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-visual">
        ${brand()}
        <div class="login-quote">
          <span class="eyebrow">Persönlich. Präzise. Energiegeladen.</span>
          <h1>Dein Plan.<br><span class="gold">Dein Tempo.</span><br>Dein Erfolg.</h1>
          <p>Individuelles Coaching von Sergio – überall an deiner Seite.</p>
        </div>
      </section>
      <section class="login-panel">
        <div class="login-form">
          <span class="eyebrow">Interaktiver Prototyp</span>
          <h2>Willkommen zurück</h2>
          <p style="color:#666">Wähle eine Perspektive und entdecke die Maestro Plan App.</p>
          <div class="role-picker" aria-label="Perspektive wählen">
            <button class="role-card ${state.role==='client'?'active':''}" data-role="client"><strong>Als Kunde</strong><small>Training & Coaching</small></button>
            <button class="role-card ${state.role==='trainer'?'active':''}" data-role="trainer"><strong>Als Sergio</strong><small>Trainer-Dashboard</small></button>
          </div>
          <div class="form-field"><label for="email">E-Mail</label><input id="email" value="${state.role==='client'?'anna@beispiel.de':'sergio@maestro-plan.de'}" /></div>
          <div class="form-field"><label for="password">Passwort</label><input id="password" type="password" value="prototyp" /></div>
          <button id="loginButton" class="btn btn-primary" style="width:100%;margin-top:12px">Demo starten →</button>
          <p style="color:#777;font-size:.8rem;text-align:center;margin-top:18px">Demo-Daten · Keine echten Gesundheitsdaten</p>
        </div>
      </section>
    </main>`;
  document.querySelectorAll('[data-role]').forEach(btn => btn.onclick = () => { state.role = btn.dataset.role; login(); });
  document.querySelector('#loginButton').onclick = () => { state.loggedIn = true; render(); };
  saveState();
}

function mobileHeader(title='Heute') {
  return `<header class="mobile-header">${brand(true)}<strong class="display">${title}</strong><button class="avatar" aria-label="Profil öffnen" data-view="more">AW</button></header>`;
}

function bottomNav() {
  const items = [['today','Heute'],['plan','Plan'],['nutrition','Ernährung'],['chat','Chat'],['appointments','Termine']];
  return `<nav class="bottom-nav" aria-label="Hauptnavigation">${items.map(([key,label]) => `<button data-view="${key}" class="${state.clientView===key?'active':''}"><span>${icons[key]}</span>${label}</button>`).join('')}</nav>`;
}

function bindMobileNav() {
  document.querySelectorAll('[data-view]').forEach(btn => btn.onclick = () => { state.clientView = btn.dataset.view; renderClient(); });
}

function clientToday() {
  const p = state.progress;
  const weekPct = Math.round(Math.min(p.sessionsDone, p.sessionsGoal) / p.sessionsGoal * 100);
  return `
    ${mobileHeader('Heute')}
    <main class="mobile-main">
      <section class="mobile-hero">
        <span class="eyebrow">Montag · 12. Juli</span>
        <h1>Guten Morgen,<br><span class="gold">Anna.</span></h1>
        <p>Du bist stärker als deine Ausreden. Lass uns loslegen.</p>
      </section>
      <div class="row-between" style="margin:18px 0 10px"><div><span class="eyebrow">Deine Woche</span><h2 style="margin:2px 0">${p.sessionsDone} von ${p.sessionsGoal} Einheiten</h2></div><strong class="lime">${weekPct}%</strong></div>
      <div class="progress-line"><span style="width:${weekPct}%"></span></div>
      <section style="margin-top:28px">
        <div class="row-between"><h2>Heute trainieren</h2><span class="tag green">Bereit</span></div>
        <article class="card session-card">
          <div class="session-image"><div><span class="tag">Strong Start · Woche 3</span><h2 style="margin:10px 0 0">Full Body Power</h2></div></div>
          <div class="card-pad">
            <div class="row-between muted"><span>⏱ 42 Minuten</span><span>⚡ Mittel</span><span>6 Übungen</span></div>
            <button id="startWorkout" class="btn btn-primary" style="width:100%;margin-top:18px">Training starten →</button>
          </div>
        </article>
      </section>
      ${state.appointment ? `<section class="personal-checkin" style="margin-top:28px">
        <div class="row-between"><div><span class="eyebrow">Persönlich mit Sergio</span><h2 style="margin:4px 0">Dein nächster Check-in</h2></div><span class="tag green">Bestätigt</span></div>
        <article class="card appointment-card">
          <div class="calendar-date"><strong>14</strong><small>JUL</small></div>
          <div class="appointment-copy"><strong>${state.appointment.type}</strong><span>${state.appointment.date} · ${state.appointment.time}</span><small class="muted">30 Min. · Video-Call</small></div>
          <button class="btn btn-primary btn-small" data-call="Anna Weber">Call starten</button>
        </article>
        <button class="btn btn-ghost btn-small" data-view="appointments" style="width:100%;margin-top:10px">Termin ansehen oder ändern →</button>
      </section>` : ''}
      <section style="margin-top:28px">
        <div class="row-between"><h2>Sergio sagt</h2><button class="btn btn-ghost btn-small" data-view="chat">Antworten</button></div>
        <div class="card card-pad row" style="align-items:flex-start"><div class="avatar" style="background:var(--gold);color:#222">SM</div><div><strong>„Konstanz schlägt Perfektion.“</strong><p class="muted" style="margin:5px 0 0">Achte heute auf einen stabilen Rumpf. Ich schaue mir deine Werte danach an.</p></div></div>
      </section>
      <section style="margin-top:28px"><h2>Dein Fortschritt</h2><div class="stats-row"><div class="stat"><strong>${p.totalSessions}</strong><small>Trainings</small></div><div class="stat"><strong>${p.adherence}%</strong><small>Plan erfüllt</small></div><div class="stat"><strong>+${p.performance}%</strong><small>Leistung</small></div></div></section>
    </main>${bottomNav()}`;
}

function clientPlan() {
  return `${mobileHeader('Trainingsplan')}<main class="mobile-main">
    <span class="eyebrow" style="display:block;margin-top:24px">Strong Start · Woche 3</span><h1 style="font-size:2.6rem">Deine Woche</h1>
    <div class="week-strip">${[['M',true,true],['D',false,false],['M',false,true],['D',false,false],['F',false,false],['S',false,false],['S',false,false]].map((d,i)=>`<div class="day ${d[1]?'active':''} ${d[2]&&!d[1]?'done':''}"><small>${d[0]}</small><strong>${12+i}</strong></div>`).join('')}</div>
    <div class="card card-pad">
      <div class="timeline-item done"><div class="timeline-dot"></div><div class="timeline-copy"><span class="tag green">Erledigt</span><h3 style="margin:8px 0 2px">Mittwoch · Upper Body</h3><span class="muted">38 Min. · 5 Übungen</span></div></div>
      <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-copy"><span class="tag">Heute</span><h3 style="margin:8px 0 2px">Freitag · Full Body Power</h3><span class="muted">42 Min. · 6 Übungen</span><br><button id="startWorkout" class="btn btn-primary btn-small" style="margin-top:12px">Starten</button></div></div>
      <div class="timeline-item"><div class="timeline-dot" style="border-color:#666"></div><div class="timeline-copy"><span class="muted">Nächste Woche</span><h3 style="margin:8px 0 2px">Montag · Lower Body</h3><span class="muted">45 Min. · 6 Übungen</span></div></div>
    </div>
    <div class="card card-pad" style="margin-top:18px"><span class="eyebrow">Trainingsziel</span><h2 style="margin:6px 0">3 Einheiten pro Woche</h2><p class="muted">Dein Plan wurde von Sergio zuletzt am 9. Juli angepasst.</p></div>
  </main>${bottomNav()}`;
}

function clientNutrition() {
  const meals = [['☀','Frühstück','Protein-Porridge · Beeren'],['◒','Mittagessen','Bowl · Hähnchen · Reis'],['◐','Snack','Skyr · Mandeln'],['☾','Abendessen','Lachs · Gemüse · Kartoffeln']];
  return `${mobileHeader('Ernährung')}<main class="mobile-main">
    <section style="padding-top:26px"><span class="eyebrow">Montag · Tagesplan</span><h1 style="font-size:2.6rem">Gut versorgt.<br><span class="gold">Stark im Training.</span></h1></section>
    <div class="stack">${meals.map((m,i)=>`<article class="meal-card"><div class="meal-icon">${m[0]}</div><div><strong>${m[1]}</strong><small class="muted" style="display:block">${m[2]}</small></div><button class="check ${i<2?'checked':''}" data-meal>${i<2?'✓':'○'}</button></article>`).join('')}</div>
    <section class="card card-pad meal-photo-card" style="margin-top:20px">
      <div class="row-between"><div><span class="eyebrow">Foto-Check-in</span><h2 style="margin:4px 0">Mahlzeit zeigen</h2></div><span class="meal-camera">▣</span></div>
      <p class="muted">Fotografiere deine Mahlzeit oder wähle ein Bild aus der Galerie. Sergio kann dir dazu persönliches Feedback geben.</p>
      ${state.mealPhoto ? `<div class="meal-photo-preview"><img src="${state.mealPhoto.previewUrl}" alt="Vorschau der ausgewählten Mahlzeit"><div class="meal-photo-overlay"><span class="tag green">Bereit zum Senden</span><button id="removeMealPhoto" class="icon-btn" aria-label="Mahlzeitenfoto entfernen">×</button></div></div><div class="form-field meal-note"><label for="mealPhotoNote">Notiz für Sergio</label><textarea id="mealPhotoNote" rows="2" placeholder="Was möchtest du Sergio dazu sagen?">${state.mealPhoto.note}</textarea></div><button id="saveMealPhoto" class="btn btn-primary" style="width:100%">Foto-Check-in speichern</button>` : `<input id="mealPhotoInput" class="visually-hidden" type="file" accept="image/*" capture="environment"><label for="mealPhotoInput" class="meal-photo-upload"><span class="meal-photo-plus">＋</span><strong>Foto aufnehmen oder auswählen</strong><small>Kamera und Galerie werden unterstützt</small></label>`}
    </section>
    <section class="card card-pad" style="margin-top:20px"><div class="row-between"><div><span class="eyebrow">Wasser</span><h2 style="margin:4px 0">${state.water} von 8 Gläsern</h2></div><span style="font-size:2rem">💧</span></div><div class="water">${Array.from({length:8},(_,i)=>`<button data-water="${i+1}" class="${i<state.water?'filled':''}" aria-label="${i+1} Gläser">${i<state.water?'✓':'+'}</button>`).join('')}</div></section>
    <section class="card card-pad" style="margin-top:20px"><span class="eyebrow">Deine Gewohnheiten</span><h2 style="margin:4px 0 10px">Heute im Fokus</h2>${['2 Portionen Gemüse','Keine Softdrinks','Langsam & bewusst essen'].map((h,i)=>`<label class="habit-row"><input type="checkbox" data-habit="${i}" ${state.habits[i]?'checked':''}><span>${h}</span></label>`).join('')}</section>
    <p class="muted" style="font-size:.8rem;margin:20px 4px">Hinweis: Dieser Plan dient dem allgemeinen Ernährungscoaching und ersetzt keine medizinische Beratung.</p>
  </main>${bottomNav()}`;
}

function clientChat() {
  return `${mobileHeader('Chat mit Sergio')}<main class="mobile-main" style="padding-top:22px">
    <div class="row" style="margin-bottom:24px"><div class="avatar" style="background:var(--gold);color:#222">SM</div><div><strong>Sergio Maestro</strong><small class="muted" style="display:block"><span class="status-dot"></span>Antwortet meist innerhalb 1 Std.</small></div></div>
    <div class="chat-list">${state.messages.map(m=>`<div class="message ${m.mine?'mine':''}">${m.text}<small>${m.time}</small></div>`).join('')}</div>
  </main><form class="chat-compose" id="chatForm"><button type="button" class="icon-btn" aria-label="Anhang">＋</button><input id="chatInput" aria-label="Nachricht" placeholder="Nachricht an Sergio …"><button class="icon-btn" aria-label="Senden">➤</button></form>${bottomNav()}`;
}

function clientAppointments() {
  return `${mobileHeader('Termine')}<main class="mobile-main">
    <section style="padding-top:26px"><span class="eyebrow">Persönliches Coaching</span><h1 style="font-size:2.6rem">Zeit für dich.<br><span class="gold">Direkt mit Sergio.</span></h1><p class="muted">Buche deinen Check-in, bespreche deinen Fortschritt und starte den Video-Call direkt aus der App.</p></section>
    ${state.appointment ? `<section><div class="row-between"><h2>Nächster Check-in</h2><span class="tag green">${state.appointment.status}</span></div><article class="card featured-appointment"><div class="appointment-hero"><div class="avatar coach-avatar">SM</div><div><span class="eyebrow">Video-Call mit Sergio</span><h2 style="margin:4px 0">${state.appointment.date}</h2><strong class="gold">${state.appointment.time} Uhr · 30 Minuten</strong></div></div><div class="appointment-agenda"><strong>Dein Check-in</strong><p class="muted">Trainingsfortschritt, Ernährung und deine Ziele für die kommende Woche.</p></div><button class="btn btn-primary" style="width:100%" data-call="Anna Weber">▶ Video-Call starten</button><div class="grid-2" style="margin-top:10px"><button class="btn btn-ghost btn-small" data-modal="booking">Verschieben</button><button class="btn btn-ghost btn-small" id="cancelAppointment">Absagen</button></div></article></section>` : `<section class="card card-pad empty-appointment"><div class="meal-camera" style="margin:auto">◷</div><h2 style="margin:12px 0 6px">Noch kein Check-in geplant</h2><p class="muted">Finde einen Termin, der gut in deine Woche passt.</p><button class="btn btn-primary" data-modal="booking">Termin mit Sergio buchen</button></section>`}
    <section style="margin-top:26px"><div class="row-between"><h2>Weitere Möglichkeiten</h2></div><div class="grid-2"><button class="quick-action" data-modal="booking"><strong>＋ Termin buchen</strong><span class="muted">Freie Zeiten ansehen</span></button><button class="quick-action" data-view="chat"><strong>✦ Sergio schreiben</strong><span class="muted">Kurze Frage stellen</span></button></div></section>
    <section class="card card-pad" style="margin-top:20px"><span class="eyebrow">So funktioniert es</span><div class="habit-row"><span class="tag">1</span><span>Passenden Termin auswählen</span></div><div class="habit-row"><span class="tag">2</span><span>Erinnerung vor dem Termin erhalten</span></div><div class="habit-row"><span class="tag">3</span><span>Call direkt hier starten</span></div></section>
  </main>${bottomNav()}`;
}

function clientMore() {
  return `${mobileHeader('Mehr')}<main class="mobile-main"><section class="card card-pad" style="margin-top:24px;text-align:center"><div class="avatar" style="width:76px;height:76px;margin:auto;font-size:1.3rem">AW</div><h2 style="margin:12px 0 0">Anna Weber</h2><span class="muted">Strong Start · seit 5 Wochen</span></section>
    <div class="grid-2" style="margin-top:18px"><button class="quick-action" data-modal="booking"><strong>📅 Termin buchen</strong><span class="muted">Persönlicher Check-in</span></button><button class="quick-action" data-modal="video"><strong>▶ Videothek</strong><span class="muted">Übungen & Wissen</span></button><button class="quick-action" data-modal="progress"><strong>↗ Fortschritt</strong><span class="muted">Werte & Fotos</span></button><button class="quick-action" data-modal="privacy"><strong>◇ Datenschutz</strong><span class="muted">Einwilligungen & Daten</span></button></div>
    <button id="logout" class="btn btn-ghost" style="width:100%;margin-top:22px">Demo verlassen</button>
  </main>${bottomNav()}`;
}

function renderClient() {
  clearInterval(state.timerId);
  saveState();
  if (state.workoutOpen) return renderWorkout();
  const views = {today:clientToday, plan:clientPlan, nutrition:clientNutrition, chat:clientChat, appointments:clientAppointments, more:clientMore};
  app.innerHTML = `<div class="phone-app">${views[state.clientView]()}</div>`;
  bindMobileNav();
  document.querySelector('#startWorkout')?.addEventListener('click', () => { state.workoutOpen=true; state.exerciseIndex=0; state.setsDone=[false,false,false]; renderWorkout(); });
  document.querySelectorAll('[data-meal]').forEach(btn => btn.onclick=()=>{ btn.classList.toggle('checked'); btn.textContent=btn.classList.contains('checked')?'✓':'○'; toast('Check-in gespeichert'); });
  document.querySelector('#mealPhotoInput')?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Bitte wähle eine Bilddatei aus'); return; }
    state.mealPhoto = { previewUrl: URL.createObjectURL(file), name: file.name, note: '', meal: 'Tages-Check-in', capturedAt: new Date().toISOString() };
    renderClient();
  });
  document.querySelector('#mealPhotoNote')?.addEventListener('input', event => { if (state.mealPhoto) state.mealPhoto.note = event.target.value; });
  document.querySelector('#removeMealPhoto')?.addEventListener('click', () => {
    if (state.mealPhoto?.previewUrl) URL.revokeObjectURL(state.mealPhoto.previewUrl);
    state.mealPhoto = null;
    renderClient();
  });
  document.querySelector('#saveMealPhoto')?.addEventListener('click', () => {
    const note = state.mealPhoto?.note?.trim() || '';
    state.messages.push({ mine:true, text: note ? `📷 Mahlzeiten-Check-in gesendet. ${note}` : '📷 Mahlzeiten-Check-in gesendet.', time:'Jetzt' });
    state.checkins.unshift({ type:'meal', client:'Anna Weber', label:'Mahlzeiten-Foto zur Bewertung', note, time:'Gerade eben' });
    if (state.mealPhoto?.previewUrl) URL.revokeObjectURL(state.mealPhoto.previewUrl);
    state.mealPhoto = null;
    toast('Foto-Check-in gesendet · Sergio wird informiert');
    renderClient();
  });
  document.querySelectorAll('[data-water]').forEach(btn => btn.onclick=()=>{ state.water=Number(btn.dataset.water); renderClient(); });
  document.querySelectorAll('[data-habit]').forEach(input => input.onchange=()=>{ state.habits[Number(input.dataset.habit)]=input.checked; toast('Gewohnheit aktualisiert'); });
  document.querySelector('#chatForm')?.addEventListener('submit', e=>{ e.preventDefault(); const input=document.querySelector('#chatInput'); if(!input.value.trim()) return; state.messages.push({mine:true,text:input.value.trim(),time:'Jetzt'}); renderClient(); });
  document.querySelectorAll('[data-modal]').forEach(btn=>btn.onclick=()=>showModal(btn.dataset.modal));
  document.querySelectorAll('[data-call]').forEach(btn=>btn.onclick=()=>showCallModal(btn.dataset.call));
  document.querySelector('#cancelAppointment')?.addEventListener('click',()=>{ state.appointment=null; toast('Termin wurde abgesagt'); renderClient(); });
  document.querySelector('#logout')?.addEventListener('click',()=>{ state.loggedIn=false; login(); });
}

function renderWorkout() {
  const ex = state.exercises[state.exerciseIndex];
  app.innerHTML = `<div class="phone-app">
    <div class="workout-top row-between"><button id="closeWorkout" class="icon-btn" aria-label="Training schließen">×</button><div style="text-align:center"><small class="muted">Übung ${state.exerciseIndex+1} von ${state.exercises.length}</small><div class="progress-line" style="width:180px;margin-top:6px"><span style="width:${(state.exerciseIndex+1)/state.exercises.length*100}%"></span></div></div><span class="tag">18:42</span></div>
    <main class="mobile-main">
      <div class="exercise-video"><button class="play" aria-label="Übungsvideo abspielen">▶</button></div>
      <section style="padding-top:24px"><span class="eyebrow">${ex.target} · Pause ${ex.rest}</span><h1 style="font-size:2.8rem">${ex.name}</h1><p class="muted">Rumpf stabil halten, Bewegung kontrolliert ausführen und gleichmäßig atmen.</p></section>
      ${ex.duration ? `<div class="card card-pad"><span class="eyebrow">Intervall-Timer</span><div class="timer" id="timer">00:${String(state.timer).padStart(2,'0')}</div><div class="grid-2"><button id="timerStart" class="btn btn-primary">${state.timer<20?'Weiter':'Start'}</button><button id="timerReset" class="btn btn-ghost">Zurücksetzen</button></div></div>` : ''}
      <h2 style="margin-top:24px">Deine Sätze</h2>
      <table class="set-table"><thead><tr><th>Satz</th><th>${ex.unit}</th><th>KG</th><th></th></tr></thead><tbody>${ex.values.map((v,i)=>`<tr><td>${i+1}</td><td><input inputmode="numeric" aria-label="Wert Satz ${i+1}" data-set-value="${i}" value="${v}"></td><td><input inputmode="numeric" aria-label="Gewicht Satz ${i+1}" data-set-weight="${i}" value="${ex.weight[i]||'–'}"></td><td><button class="check ${state.setsDone[i]?'checked':''}" data-set="${i}">${state.setsDone[i]?'✓':'○'}</button></td></tr>`).join('')}</tbody></table>
      <div class="card card-pad card-flat" style="margin-top:20px"><div class="row-between"><span>Empfundene Anstrengung</span><strong class="gold" id="rpeValue">7/10</strong></div><input id="rpe" type="range" min="1" max="10" value="7" style="width:100%;accent-color:var(--gold)"></div>
      <button id="nextExercise" class="btn btn-primary" style="width:100%;margin-top:20px">${state.exerciseIndex===state.exercises.length-1?'Training abschließen':'Nächste Übung →'}</button>
    </main></div>`;
  document.querySelector('#closeWorkout').onclick=()=>{ state.workoutOpen=false; renderClient(); };
  document.querySelectorAll('[data-set]').forEach(btn=>btn.onclick=()=>{ state.setsDone[Number(btn.dataset.set)]=!state.setsDone[Number(btn.dataset.set)]; renderWorkout(); });
  document.querySelectorAll('[data-set-value]').forEach(input=>input.onchange=()=>{ const i=Number(input.dataset.setValue); const n=parseInt(input.value,10); if(!Number.isNaN(n)) ex.values[i]=n; saveState(); });
  document.querySelectorAll('[data-set-weight]').forEach(input=>input.onchange=()=>{ const i=Number(input.dataset.setWeight); const n=parseInt(input.value,10); ex.weight[i]=Number.isNaN(n)?0:n; saveState(); });
  document.querySelector('#rpe').oninput=e=>document.querySelector('#rpeValue').textContent=`${e.target.value}/10`;
  document.querySelector('#timerStart')?.addEventListener('click',()=>{
    clearInterval(state.timerId); state.timerId=setInterval(()=>{ state.timer--; const el=document.querySelector('#timer'); if(el) el.textContent=`00:${String(Math.max(0,state.timer)).padStart(2,'0')}`; if(state.timer<=0){clearInterval(state.timerId);toast('Intervall geschafft!');}},1000);
  });
  document.querySelector('#timerReset')?.addEventListener('click',()=>{ state.timer=20; renderWorkout(); });
  document.querySelector('#nextExercise').onclick=()=>{
    clearInterval(state.timerId);
    if(state.exerciseIndex<state.exercises.length-1){state.exerciseIndex++;state.setsDone=[false,false,false];state.timer=20;renderWorkout();}
    else showWorkoutComplete();
  };
}

function showWorkoutComplete() {
  state.workoutOpen=false;
  const exerciseCount = state.exercises.length;
  const setCount = exerciseCount * 3;
  app.innerHTML=`<div class="phone-app"><main class="mobile-main" style="min-height:100vh;display:grid;place-items:center;text-align:center"><div><div style="font-size:5rem">⚡</div><span class="eyebrow">Training abgeschlossen</span><h1>Stark,<br><span class="gold">Anna!</span></h1><p class="muted">Du hast heute ${exerciseCount} Übungen und ${setCount} Sätze absolviert.</p><div class="stats-row" style="margin:24px 0"><div class="stat"><strong>31:24</strong><small>Zeit</small></div><div class="stat"><strong>${setCount}</strong><small>Sätze</small></div><div class="stat"><strong>7/10</strong><small>Intensität</small></div></div><div class="form-field" style="text-align:left"><label for="feedback">Notiz an Sergio</label><textarea id="feedback" rows="3" placeholder="Wie lief dein Training?"></textarea></div><button id="finishWorkout" class="btn btn-primary" style="width:100%">Ergebnis speichern</button></div></main></div>`;
  document.querySelector('#finishWorkout').onclick=()=>{
    completeWorkout(document.querySelector('#feedback')?.value.trim() || '');
    state.clientView='today';
    toast('Training gespeichert · Sergio wurde informiert');
    renderClient();
  };
}

// Ein abgeschlossenes Training wirkt sich real auf Fortschritt, Chat und die
// Trainer-Ansicht aus – der Kern eines geschlossenen Coaching-Loops.
function completeWorkout(note) {
  const p = state.progress;
  p.sessionsDone = Math.min(p.sessionsGoal, p.sessionsDone + 1);
  p.totalSessions += 1;
  p.adherence = Math.min(100, p.adherence + 2);
  p.performance += 1;
  const summary = `Training „Full Body Power" abgeschlossen · ${state.exercises.length} Übungen`;
  state.messages.push({ mine:true, text: note ? `${summary}. ${note}` : summary, time:'Jetzt' });
  state.checkins.unshift({ type:'workout', client:'Anna Weber', label:summary, note, time:'Gerade eben' });
  const anna = state.clients.find(c => c.name === 'Anna Weber');
  if (anna) { anna.adherence = p.adherence; anna.last = 'Gerade eben'; }
}

function showModal(type) {
  const content={
    booking:`<span class="eyebrow">Persönlicher Austausch</span><h2>Termin mit Sergio</h2><p class="muted">Wähle einen freien Coaching-Termin. Im produktiven MVP wird hier der Buchungsanbieter angebunden.</p><div class="stack">${['Dienstag, 14. Juli · 09:30','Mittwoch, 15. Juli · 17:00','Freitag, 17. Juli · 11:30'].map(x=>`<button class="btn btn-dark slot">${x}</button>`).join('')}</div>`,
    video:`<span class="eyebrow">Maestro Videothek</span><h2>Trainiere mit Sergio</h2><div class="stack"><div class="card card-pad card-flat"><strong>▶ Kniebeugen richtig ausführen</strong><small class="muted" style="display:block">Technik · 03:42 Min.</small></div><div class="card card-pad card-flat"><strong>▶ 10 Minuten Mobility</strong><small class="muted" style="display:block">Beweglichkeit · 10:18 Min.</small></div><div class="card card-pad card-flat"><strong>▶ Core Power Express</strong><small class="muted" style="display:block">Workout · 16:05 Min.</small></div></div>`,
    progress:`<span class="eyebrow">Letzte 8 Wochen</span><h2>Deine Entwicklung</h2><div class="chart">${[42,48,45,56,64,62,75,86].map((v,i)=>`<div class="bar ${i>5?'goldbar':''}" style="height:${v}%" title="${v}%"></div>`).join('')}</div><div class="grid-3" style="margin-top:20px"><div><strong class="gold">−2,4 kg</strong><small class="muted" style="display:block">Gewicht</small></div><div><strong class="gold">+12%</strong><small class="muted" style="display:block">Leistung</small></div><div><strong class="gold">86%</strong><small class="muted" style="display:block">Konstanz</small></div></div>`,
    privacy:`<span class="eyebrow">Deine Daten</span><h2>Privatsphäre & Kontrolle</h2><div class="stack"><button class="quick-action"><strong>Einwilligungen verwalten</strong><span class="muted">2 aktive Einwilligungen</span></button><button class="quick-action"><strong>Datenexport anfordern</strong><span class="muted">Maschinenlesbare Kopie</span></button><button class="quick-action"><strong>Konto löschen</strong><span class="muted">Kontrollierter Löschprozess</span></button></div>`
  };
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop"><div class="modal"><div class="row-between" style="align-items:flex-start"><div style="flex:1">${content[type]}</div><button class="icon-btn close-modal" aria-label="Schließen">×</button></div></div></div>`);
  document.querySelector('.close-modal').onclick=()=>document.querySelector('.modal-backdrop').remove();
  document.querySelector('.modal-backdrop').onclick=e=>{if(e.target.classList.contains('modal-backdrop'))e.currentTarget.remove();};
  document.querySelectorAll('.slot').forEach(btn=>btn.onclick=()=>{
    const [date,time] = btn.textContent.split(' · ');
    state.appointment = { date, time, type: 'Persönlicher Video-Check-in', status: 'Bestätigt' };
    document.querySelector('.modal-backdrop').remove();
    state.clientView='appointments';
    renderClient();
    toast(`Termin bestätigt: ${btn.textContent}`);
  });
}

function showCallModal(clientName='Anna Weber') {
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop call-backdrop"><div class="modal call-modal"><div class="call-stage"><span class="tag green">Sichere Verbindung bereit</span><div class="call-avatar-wrap"><div class="pulse-ring"></div><div class="avatar call-avatar">${clientName==='Anna Weber'?'SM':'AW'}</div></div><span class="eyebrow">Persönlicher Check-in</span><h2>${clientName==='Anna Weber'?'Sergio Maestro':clientName}</h2><p class="muted">Video und Mikrofon werden erst beim echten Anbieter freigegeben.</p><div class="call-controls"><button class="icon-btn" aria-label="Mikrofon">◉</button><button class="icon-btn" aria-label="Kamera">▣</button><button class="icon-btn end-call" aria-label="Call beenden">×</button></div><button id="joinCall" class="btn btn-primary" style="width:100%;margin-top:22px">Jetzt dem Call beitreten</button></div></div></div>`);
  document.querySelector('.end-call').onclick=()=>document.querySelector('.call-backdrop').remove();
  document.querySelector('#joinCall').onclick=()=>{
    document.querySelector('#joinCall').textContent='Verbindung wird aufgebaut …';
    setTimeout(()=>{ toast('Demo: Der Video-Call würde jetzt starten'); document.querySelector('.call-backdrop')?.remove(); },900);
  };
}

function adminShell(content,title,view=state.adminView) {
  const nav=[['dashboard','⌂','Übersicht'],['clients','♙','Kunden'],['appointments','◷','Termine'],['plans','▦','Pläne'],['nutrition','◉','Ernährung'],['media','▶','Mediathek'],['chat','✦','Nachrichten']];
  return `<div class="admin-app"><aside class="sidebar">${brand()}<nav>${nav.map(n=>`<button data-admin="${n[0]}" class="${view===n[0]?'active':''}"><span>${n[1]}</span><b>${n[2]}</b></button>`).join('')}</nav><div class="sidebar-bottom"><div class="row"><div class="avatar" style="background:var(--gold);color:#222">SM</div><div class="user-copy"><strong>Sergio Maestro</strong><small class="muted" style="display:block">Personal Trainer</small></div></div></div></aside><div class="admin-main"><header class="admin-header"><div><small class="muted">Maestro Plan</small><strong class="display" style="display:block">${title}</strong></div><div class="row"><button class="btn btn-dark btn-small" data-preview>↗ Kundenvorschau</button><button id="logout" class="icon-btn" style="color:#333;border-color:#ccc" aria-label="Abmelden">⎋</button></div></header><main class="admin-content">${content}</main></div></div>`;
}

function adminDashboard() {
  const openCheckins = 7 + state.checkins.length;
  const liveFeed = state.checkins.length ? `<section class="card card-pad live-feed" style="margin:0 0 20px"><div class="row-between"><div><span class="eyebrow">Live von deinen Kunden</span><h2 style="margin:2px 0">Neue Check-ins</h2></div><span class="tag green">${state.checkins.length} neu</span></div><div class="stack" style="margin-top:12px">${state.checkins.slice(0,4).map(c=>`<div class="row-between"><div class="row"><div class="avatar">${(c.client||'AW').split(' ').map(w=>w[0]).join('').slice(0,2)}</div><div><strong>${c.client} · ${c.type==='workout'?'Training':'Ernährung'}</strong><small class="muted" style="display:block">${c.label}${c.note?` – „${c.note}"`:''}</small></div></div><div class="row" style="gap:8px;align-items:center"><small class="muted">${c.time}</small><button class="btn btn-ghost btn-small" data-admin="chat">Antworten</button></div></div>`).join('<div class="divider"></div>')}</div></section>` : '';
  return adminShell(`<div class="row-between"><div><span class="eyebrow">Montag, 12. Juli</span><h1 style="font-size:2.8rem;margin:4px 0">Guten Morgen, Sergio.</h1><p style="color:#666">Vier Kunden brauchen heute deine Aufmerksamkeit.</p></div><button class="btn btn-primary" data-admin="plans">＋ Plan erstellen</button></div>
  <section class="grid-4" style="margin:24px 0"><div class="card metric-card"><span class="muted">Aktive Kunden</span><strong>24</strong><span class="lime">+3 diesen Monat</span></div><div class="card metric-card"><span class="muted">Trainingsquote</span><strong>82%</strong><span class="gold">+6% zum Vormonat</span></div><div class="card metric-card"><span class="muted">Offene Check-ins</span><strong>${openCheckins}</strong><span style="color:#f3a85b">3 überfällig</span></div><div class="card metric-card"><span class="muted">Termine heute</span><strong>4</strong><button class="btn btn-ghost btn-small" data-admin="appointments">Nächster: 11:30 →</button></div></section>
  ${liveFeed}
  <section class="grid-2"><div class="card card-pad"><div class="row-between"><div><span class="eyebrow">Handlungsbedarf</span><h2>Heute wichtig</h2></div><span class="tag">4 Aufgaben</span></div><div class="stack"><div class="row-between"><div><strong>Jonas · Check-in prüfen</strong><small class="muted" style="display:block">Seit 2 Tagen offen</small></div><button class="btn btn-ghost btn-small">Öffnen</button></div><div class="divider"></div><div class="row-between"><div><strong>Daniel · Training verpasst</strong><small class="muted" style="display:block">Motivationsnachricht senden</small></div><button class="btn btn-ghost btn-small">Chat</button></div><div class="divider"></div><div class="row-between"><div><strong>Anna · Plan läuft aus</strong><small class="muted" style="display:block">Neuen Block vorbereiten</small></div><button class="btn btn-ghost btn-small">Plan</button></div></div></div><div class="card card-pad"><span class="eyebrow">Team-Aktivität</span><h2>Trainingsquote</h2><div class="chart">${[58,68,76,70,82,86,82].map((v,i)=>`<div class="bar ${i===6?'goldbar':''}" style="height:${v}%"><small style="position:absolute;bottom:-22px;color:var(--muted)">${['M','D','M','D','F','S','S'][i]}</small></div>`).join('')}</div></div></section>`, 'Übersicht','dashboard');
}

function adminClients() {
  return adminShell(`<div class="row-between"><div><span class="eyebrow">Coaching</span><h1 style="font-size:2.8rem">Meine Kunden</h1></div><button class="btn btn-primary" id="invite">＋ Kunde einladen</button></div><div class="card card-pad"><div class="row-between" style="margin-bottom:12px"><input aria-label="Kunden suchen" placeholder="Kunden suchen …" style="padding:11px 14px;border-radius:10px;border:1px solid var(--line);background:#202224;color:#fff;min-width:260px"><span class="muted">24 aktive Kunden</span></div><table class="client-table"><thead><tr><th>Kunde</th><th>Status</th><th>Plan</th><th>Quote</th><th>Letzte Aktivität</th></tr></thead><tbody>${state.clients.map((c,i)=>`<tr class="client-row" data-client="${i}"><td><div class="row"><div class="avatar">${c.initials}</div><strong>${c.name}</strong></div></td><td><span class="status-dot ${c.alert?'warn':''}"></span>${c.status}</td><td>${c.plan}</td><td><strong class="${c.adherence>80?'lime':'gold'}">${c.adherence}%</strong></td><td class="muted">${c.last}</td></tr>`).join('')}</tbody></table></div>`, 'Kunden','clients');
}

function adminAppointments() {
  const appointments=[
    {time:'09:30',name:'Anna Weber',initials:'AW',topic:'Wochen-Check-in',status:'Bereit',live:true},
    {time:'11:30',name:'Jonas Klein',initials:'JK',topic:'Trainingsplanung',status:'In 2 Std.',live:false},
    {time:'15:00',name:'Miriam Roth',initials:'MR',topic:'Fortschrittsgespräch',status:'Heute',live:false},
    {time:'17:30',name:'Daniel Vogt',initials:'DV',topic:'Motivations-Check-in',status:'Heute',live:false}
  ];
  return adminShell(`<div class="row-between"><div><span class="eyebrow">Persönliche Betreuung</span><h1 style="font-size:2.8rem">Termine & Video-Calls</h1><p style="color:#666">Alle persönlichen Check-ins an einem Ort.</p></div><button class="btn btn-primary" id="newAppointment">＋ Termin anlegen</button></div><div class="grid-3" style="margin:24px 0"><div class="card metric-card"><span class="muted">Heute</span><strong>4</strong><span class="lime">Alle bestätigt</span></div><div class="card metric-card"><span class="muted">Diese Woche</span><strong>17</strong><span class="gold">8 Video · 9 vor Ort</span></div><div class="card metric-card"><span class="muted">Nächster Call</span><strong>09:30</strong><span class="muted">Anna Weber</span></div></div><section class="card card-pad"><div class="row-between"><div><span class="eyebrow">Montag, 12. Juli</span><h2>Heutige Check-ins</h2></div><span class="tag green">4 bestätigt</span></div><div class="appointment-list">${appointments.map(a=>`<article class="admin-appointment ${a.live?'is-live':''}"><div class="appointment-time"><strong>${a.time}</strong><small>30 Min.</small></div><div class="avatar">${a.initials}</div><div class="appointment-copy"><strong>${a.name}</strong><span>${a.topic} · Video</span><small class="muted">${a.status}</small></div><div class="row"><button class="btn ${a.live?'btn-primary':'btn-dark'} btn-small" data-call="${a.name}">${a.live?'▶ Call starten':'Call öffnen'}</button><button class="icon-btn appointment-menu" aria-label="Terminoptionen">•••</button></div></article>`).join('')}</div></section>`, 'Termine & Calls','appointments');
}

function adminPlans() {
  return adminShell(`<div class="row-between"><div><span class="eyebrow">Plan-Builder</span><h1 style="font-size:2.8rem">Full Body Power</h1><p style="color:#666">Strong Start · Version 3 · Entwurf</p></div><div class="row"><button class="btn btn-dark" id="saveDraft">Entwurf speichern</button><button class="btn btn-primary" id="assignPlan">Anna zuweisen</button></div></div><div class="builder"><div class="card card-pad"><div class="row-between"><h2>Trainingseinheit</h2><span class="tag">42 Minuten</span></div><div class="form-field" style="color:#fff"><label>Beschreibung für den Kunden</label><textarea rows="2">Ganzkörpertraining mit Fokus auf Kraft, Stabilität und saubere Technik.</textarea></div><div id="exerciseBuilder">${state.exercises.map((e,i)=>exerciseBuilderRow(e,i)).join('')}</div><button id="addExercise" class="btn btn-ghost" style="width:100%;margin-top:10px">＋ Übung hinzufügen</button><div class="divider"></div><div class="row-between"><div><strong>Änderungen erzeugen eine neue Version</strong><small class="muted" style="display:block">Historische Ergebnisse bleiben unverändert.</small></div><span class="tag green">Versionierung aktiv</span></div></div><aside class="card card-pad"><span class="eyebrow">Live-Vorschau</span><h2>So sieht Anna den Plan</h2><div class="preview-phone"><div class="preview-screen"><small class="gold">STRONG START · WOCHE 3</small><h2 style="margin:8px 0">Full Body Power</h2><p class="muted">42 Min. · ${state.exercises.length} Übungen</p>${state.exercises.map((e,i)=>`<div class="row-between" style="padding:12px 0;border-bottom:1px solid var(--line)"><div><strong>${i+1}. ${e.name}</strong><small class="muted" style="display:block">${e.target}</small></div><span>›</span></div>`).join('')}<button class="btn btn-primary" style="width:100%;margin-top:22px">Training starten</button></div></div></aside></div>`, 'Trainingspläne','plans');
}

function exerciseBuilderRow(e,i){ return `<div class="exercise-row"><span class="muted">☷</span><div><strong>${e.name}</strong><small class="muted" style="display:block">Pause: ${e.rest}</small></div><input value="3 Sätze" aria-label="Sätze ${e.name}"><input value="${e.target.split('×')[1]?.trim()||e.target}" aria-label="Ziel ${e.name}"><button class="icon-btn remove-exercise" data-remove="${i}" aria-label="Übung entfernen">×</button></div>`; }

function adminGeneric(view) {
  const lastFromAnna = [...state.messages].reverse().find(m => m.mine);
  const chatItems = [
    `Anna: „${lastFromAnna ? lastFromAnna.text.slice(0,42) : 'Ich bin bereit.'}“`,
    'Jonas: „Kannst du meinen Plan prüfen?“',
    'Miriam: „Training erledigt!“'
  ];
  const data={nutrition:['Ernährungspläne','Pläne und Gewohnheiten',['Anna · Balanced Performance','Jonas · Muscle Fuel','Miriam · Lady Fit Nutrition']],media:['Mediathek','Videos, PDFs und Bilder',['Kniebeugen richtig ausführen · Video','Maestro Personal · PDF','10 Minuten Mobility · Video']],chat:['Nachrichten','Persönlicher Kundenaustausch',chatItems]};
  const [title,sub,items]=data[view];
  return adminShell(`<div class="row-between"><div><span class="eyebrow">${sub}</span><h1 style="font-size:2.8rem">${title}</h1></div><button class="btn btn-primary">＋ Neu anlegen</button></div><div class="grid-3">${items.map((x,i)=>`<div class="card card-pad"><span class="tag ${i===0?'green':''}">${i===0?'Aktiv':'Vorlage'}</span><h2 style="margin:14px 0 6px">${x}</h2><p class="muted">Zuletzt bearbeitet ${i+1} Tag${i?'en':''}</p><button class="btn btn-ghost btn-small">Öffnen →</button></div>`).join('')}</div>`,title,view);
}

function renderAdmin() {
  saveState();
  const views={dashboard:adminDashboard,clients:adminClients,appointments:adminAppointments,plans:adminPlans,nutrition:()=>adminGeneric('nutrition'),media:()=>adminGeneric('media'),chat:()=>adminGeneric('chat')};
  app.innerHTML=views[state.adminView]();
  document.querySelectorAll('[data-admin]').forEach(btn=>btn.onclick=()=>{state.adminView=btn.dataset.admin;renderAdmin();});
  document.querySelectorAll('[data-preview]').forEach(btn=>btn.onclick=()=>{state.role='client';state.clientView='today';renderClient();toast('Kundenvorschau geöffnet');});
  document.querySelectorAll('[data-call]').forEach(btn=>btn.onclick=()=>showCallModal(btn.dataset.call));
  document.querySelector('#logout')?.addEventListener('click',()=>{state.loggedIn=false;login();});
  document.querySelector('#invite')?.addEventListener('click',()=>showAdminModal('Kundin einladen','Ein sicherer Einladungslink wird per E-Mail versendet. Es gibt keine offene Registrierung.'));
  document.querySelector('#newAppointment')?.addEventListener('click',()=>showAdminModal('Neuen Check-in planen','Wähle einen Kunden und sende anschließend eine persönliche Termineinladung.'));
  document.querySelectorAll('[data-client]').forEach(row=>row.onclick=()=>showClientDetail(state.clients[Number(row.dataset.client)]));
  document.querySelector('#saveDraft')?.addEventListener('click',()=>toast('Entwurf als Version 3 gespeichert'));
  document.querySelector('#assignPlan')?.addEventListener('click',()=>toast('Full Body Power wurde Anna zugewiesen'));
  document.querySelector('#addExercise')?.addEventListener('click',()=>{state.exercises.push({name:'Mountain Climbers',target:'3 × 30 Sek.',rest:'45 Sek.',unit:'Sek.',values:[30,30,30],weight:[0,0,0],duration:true});renderAdmin();toast('Übung hinzugefügt');});
  document.querySelectorAll('[data-remove]').forEach(btn=>btn.onclick=()=>{state.exercises.splice(Number(btn.dataset.remove),1);renderAdmin();});
}

function showClientDetail(c) {
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop"><div class="modal"><div class="row-between"><div class="row"><div class="avatar">${c.initials}</div><div><h2 style="margin:0">${c.name}</h2><span class="muted">${c.plan}</span></div></div><button class="icon-btn close-modal">×</button></div><div class="grid-3" style="margin:24px 0"><div><strong class="gold">${c.adherence}%</strong><small class="muted" style="display:block">Trainingsquote</small></div><div><strong class="gold">8</strong><small class="muted" style="display:block">Einheiten</small></div><div><strong class="gold">+12%</strong><small class="muted" style="display:block">Leistung</small></div></div><div class="chart">${[40,48,52,60,58,68,76,c.adherence].map(v=>`<div class="bar" style="height:${v}%"></div>`).join('')}</div><div class="grid-3" style="margin-top:30px"><button class="btn btn-dark">Plan anpassen</button><button class="btn btn-dark">Nachricht</button><button class="btn btn-primary">Termin</button></div></div></div>`);
  document.querySelector('.close-modal').onclick=()=>document.querySelector('.modal-backdrop').remove();
}

function showAdminModal(title,text){
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop"><div class="modal"><div class="row-between"><div><span class="eyebrow">Maestro Plan</span><h2>${title}</h2></div><button class="icon-btn close-modal">×</button></div><p class="muted">${text}</p><div class="form-field"><label>E-Mail-Adresse</label><input placeholder="kunde@beispiel.de"></div><button class="btn btn-primary" style="width:100%" id="sendInvite">Einladung vorbereiten</button></div></div>`);
  document.querySelector('.close-modal').onclick=()=>document.querySelector('.modal-backdrop').remove();
  document.querySelector('#sendInvite').onclick=()=>{document.querySelector('.modal-backdrop').remove();toast('Einladung wurde vorbereitet');};
}

function render() { state.role==='client' ? renderClient() : renderAdmin(); }

// --- Bootstrap ------------------------------------------------------------
loadState();
state.loggedIn ? render() : login();

// Service Worker für Offline-Betrieb registrieren (nur über http/https aktiv).
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* Offline-Modus optional */ });
  });
}
