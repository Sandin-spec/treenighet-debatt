let VERSE_INDEX = [];
let VERSES = []; // optional cache of loaded verses
let byId = {};

const listEl = document.getElementById("list");
const qEl = document.getElementById("q");
const detailTitleEl = document.getElementById("detailTitle");
const detailEl = document.getElementById("detail");

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function getRouteId(){
  const h = location.hash || "";
  const m = h.match(/^#\/([^\/]+)$/);
  return m ? m[1] : null;
}

function renderList(filterText){
  const t = (filterText || "").trim().toLowerCase();
  const items = VERSE_INDEX.filter(v => {
    if(!t) return true;
    const hay = [v.ref, v.short, ...(v.tags||[])].join(" ").toLowerCase();
    return hay.includes(t);
  });

  const activeId = getRouteId();
  listEl.innerHTML = items.map(v => {
    const active = v.id === activeId ? "active" : "";
    return `
      <a class="item ${active}" href="#/${v.id}" data-id="${v.id}">
        <div class="ref">${escapeHtml(v.ref)}</div>
        <div class="onesentence">${escapeHtml(v.short)}</div>
        <div class="tags">
          ${(v.tags||[]).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </a>
    `;
  }).join("");

  if(items.length === 0){
    listEl.innerHTML = `<div class="cardbody muted">Inga träffar. Prova ett annat ord.</div>`;
  }
}

function setDetail(v){
  if(!v){
    detailTitleEl.textContent = "Välj en vers";
    detailEl.innerHTML = `
      <p class="muted">Klicka på en vers till vänster för att se fördjupningen.</p>
      <div class="block logic">
        <h3>Genomgående logiska poängen</h3>
        <p>I varje fall kräver treenigheten ett ontologiskt ramverk som texten inte uttrycker i själva versen.</p>
        <p class="small">Skillnad mellan: vad versen säger, och vad ett system behöver att den ska betyda.</p>
      </div>
    `;
    return;
  }

  detailTitleEl.textContent = v.ref;
  const shareLink = location.origin + location.pathname + "#/" + v.id;

  detailEl.innerHTML = `
    <div class="kicker">${escapeHtml((v.tags||[]).join(" · "))}</div>

    <div class="block logic">
      <h3>Vad kärnan</h3>
      <p><strong>${escapeHtml(v.short)}</strong></p>
    </div>

    <div class="block why">
      <h3>Utförlig förklaring</h3>
      ${(v.expanded?.logic||[]).map(p => `<p>${escapeHtml(p)}</p>`).join("")}
    </div>

    <div class="block logic">
      <h3>Varför det spelar roll</h3>
      ${(v.expanded?.why||[]).map(p => `<p>${escapeHtml(p)}</p>`).join("")}
    </div>

    <div class="block notes">
      <h3>Frågan att ställa</h3>
      ${(v.expanded?.notes||[]).map(p => `<p>${escapeHtml(p)}</p>`).join("")}
    </div>

    ${v.relatedIds && v.relatedIds.length ? `
    <div class="block logic">
      <h3>Relaterade verser</h3>
      <div class="tags">
        ${v.relatedIds.map(id => {
          const rv = byId[id];
          const label = rv ? rv.ref : id;
          return `<a class="tag" href="#/${id}" title="${escapeHtml(label)}">${escapeHtml(label)}</a>`;
        }).join("")}
      </div>
      <p class="small muted" style="margin-top:10px">Klicka för att hoppa direkt till nästa relevanta text.</p>
    </div>
    ` : ``}

    <div class="hr"></div>

    <div class="btnrow">
      <button id="copyBtn">Kopiera länk till denna vers</button>
      <button id="backBtn">Till listan</button>
    </div>
    <div class="footerhint">
      Tips: Du kan dela en specifik vers via hash, t.ex. <span class="small">#/${escapeHtml(v.id)}</span>
    </div>
    <div class="small muted">Länk: <span class="small" style="font-family:var(--mono)">${escapeHtml(shareLink)}</span></div>
  `;

  document.getElementById("backBtn").addEventListener("click", () => {
    location.hash = "";
  });

  document.getElementById("copyBtn").addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(shareLink);
      const btn = document.getElementById("copyBtn");
      btn.innerHTML = "Kopierat <span class='copyok'>✓</span>";
      setTimeout(() => btn.textContent = "Kopiera länk till denna vers", 1200);
    }catch(e){
      alert("Kunde inte kopiera. Markera länken manuellt och kopiera.");
    }
  });
}


/* Theme toggle */
function toggleTheme(){
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}
window.toggleTheme = toggleTheme;
(function(){
  const saved = localStorage.getItem("theme");
  if(saved === "dark"){ document.body.classList.add("dark"); }
})();

async function loadVerse(id){
  if(!id) return null;
  if(byId[id]) return byId[id];
  try{
    const res = await fetch(`data/verses/${id}.json`, { cache: "no-store" });
    if(!res.ok) throw new Error(`Kunde inte läsa data/verses/${id}.json`);
    const v = await res.json();
    byId[id] = v;
    return v;
  }catch(err){
    console.error(err);
    return null;
  }
}

async function renderFromRoute(){
  const id = getRouteId();
  // Render list direkt (snabbt)
  renderList(qEl ? qEl.value : "");

  if(!id){
    setDetail(null);
    return;
  }
  const v = await loadVerse(id);
  setDetail(v);
}

async function init(){
  try{
    const res = await fetch("data/index.json", { cache: "no-store" });
    if(!res.ok) throw new Error("Kunde inte läsa data/index.json");
    VERSE_INDEX = await res.json();
  }catch(err){
    console.error(err);
    if(detailEl) detailEl.innerHTML = `<p class="muted">Fel: Kunde inte ladda databasen (data/index.json).</p>`;
    return;
  }

  if(qEl) qEl.addEventListener("input", () => renderList(qEl.value));
  window.addEventListener("hashchange", () => { renderFromRoute(); });
  renderFromRoute();
}

init();
