// js/events.js
import { auth, db } from "./firebase-config.js";
import {
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection, getDocs, query, orderBy, where, addDoc, doc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- NAV buttons ---
document.getElementById("btnLogout")?.addEventListener("click", ()=>signOut(auth));

onAuthStateChanged(auth, (user)=>{
  document.getElementById("navLogin").style.display = user? "none":"inline";
  document.getElementById("navMy").style.display = user? "inline":"none";
  document.getElementById("navAdmin").style.display = "inline";
});

// --- Filters ---
const searchEl = document.getElementById("searchText");
const fromEl = document.getElementById("fromDate");
const toEl = document.getElementById("toDate");
const deptEl = document.getElementById("deptFilter");
document.getElementById("btnSearch")?.addEventListener("click", loadEvents);
document.getElementById("btnReset")?.addEventListener("click", ()=>{
  searchEl.value=""; fromEl.value=""; toEl.value=""; deptEl.value="";
  loadEvents();
});

// --- Load & render events ---
async function loadEvents(){
  const list = document.getElementById("eventsList");
  list.innerHTML = "<div class='card'>Loading...</div>";
  let qRef = collection(db, "events");
  // for simplicity, client-side filter after fetching ordered by date
  const snap = await getDocs(query(qRef, orderBy("date","asc")));
  let html = "";
  let count = 0;
  const txt = searchEl.value.trim().toLowerCase();
  const from = fromEl.value;
  const to = toEl.value;
  const dept = deptEl.value;

  snap.forEach(d=>{
    const e = d.data(); e.id = d.id;
    // filters
    if(dept && e.dept !== dept) return;
    if(from && e.date < from) return;
    if(to && e.date > to) return;
    if(txt && !(e.title?.toLowerCase().includes(txt) || e.venue?.toLowerCase().includes(txt))) return;
    count++;
    const today = new Date().toISOString().slice(0,10);
    const status = e.date < today ? "Expired" : (e.date===today? "Ongoing" : "Upcoming");
    html += renderEventCard(e, status);
  });
  document.getElementById("eventCount").textContent = count;
  list.innerHTML = html || "<div class='card'>No events</div>";

  // wire buttons
  document.querySelectorAll(".btn-register").forEach(btn=>{
    btn.addEventListener("click", ()=>openRegister(btn.dataset.id, btn.dataset.title));
  });
}

function renderEventCard(e, status){
  return `<div class="card event">
    <div class="meta">
      <div>
        <div style="font-weight:700;font-size:18px">${e.title}</div>
        <div class="small">${e.date} • ${e.venue}</div>
      </div>
      <span class="pill">${e.dept}</span>
    </div>
    <div class="row">
      <div class="status">${status}</div>
      <button class="btn primary btn-register" data-id="${e.id}" data-title="${e.title}" ${status==="Expired"?"disabled":""}>Register</button>
    </div>
  </div>`;
}

// --- Register modal ---
const modal = document.getElementById("registerModal");
document.getElementById("closeModal")?.addEventListener("click", ()=>modal.classList.add("hidden"));

let currentEventId = null;
function openRegister(eventId, title){
  currentEventId = eventId;
  document.getElementById("regEventTitle").textContent = title;
  modal.classList.remove("hidden");
}

document.getElementById("btnDoRegister")?.addEventListener("click", async ()=>{
  const user = auth.currentUser;
  if(!user){ alert("Please login first"); return; }
  const name = document.getElementById("regName").value.trim();
  const roll = document.getElementById("regRoll").value.trim();
  const dept = document.getElementById("regDept").value;
  const year = document.getElementById("regYear").value;

  if(!currentEventId) return;
  if(!name || !roll){ alert("Please enter name & roll no"); return; }

  // prevent duplicate registration
  // (simple check client-side; for strict rule, create composite index or rule in Firestore)
  const regsSnap = await getDocs(query(collection(db,"registrations"),
    where("eventId","==",currentEventId), where("userId","==",user.uid)));
  if(!regsSnap.empty){ alert("You have already registered"); return; }

  await addDoc(collection(db,"registrations"), {
    eventId: currentEventId,
    userId: user.uid,
    email: user.email,
    name, roll, dept, year,
    registeredAt: serverTimestamp()
  });

  // Optional: Trigger Email extension: create a doc in 'mail' to send confirmation
  // await addDoc(collection(db,"mail"), {
  //   to: user.email,
  //   message: { subject: "Registration Confirmed", text: `Thanks ${name}! You're registered.` }
  // });

  modal.classList.add("hidden");
  alert("Registered successfully!");
});

// init
loadEvents();
