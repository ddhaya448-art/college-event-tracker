// js/admin.js
import { auth, db } from "./firebase-config.js";
import {
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, getDocs, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.getElementById("btnLogout")?.addEventListener("click", ()=>signOut(auth));

// guard: only admin can view
onAuthStateChanged(auth, async (user)=>{
  if(!user) { location.href="./login.html"; return; }
  const u = await getDoc(doc(db,"users",user.uid));
  if(!u.exists() || u.data().role!=="admin"){
    alert("Admin only"); location.href="./index.html"; return;
  }
  // load dashboard
  loadKPIs(); loadFacultyRequests(); loadAllEvents();
});

async function loadKPIs(){
  const users = await getDocs(collection(db,"users"));
  const events = await getDocs(collection(db,"events"));
  const regs = await getDocs(collection(db,"registrations"));
  document.getElementById("kpiUsers").textContent = users.size;
  document.getElementById("kpiEvents").textContent = events.size;
  document.getElementById("kpiRegs").textContent = regs.size;
}

// Faculty requests
export async function loadFacultyRequests(){
  const box = document.getElementById("facultyReq");
  const snap = await getDocs(query(collection(db,"users"), where("role","==","faculty"), where("status","==","pending")));
  let html="";
  snap.forEach(d=>{
    const u = d.data();
    html += `<div class="card">
      <div><b>${u.name}</b><br/><span class="small">${u.email}</span></div>
      <div class="row">
        <button class="btn" data-approve="${d.id}">Accept</button>
        <button class="btn danger" data-decline="${d.id}">Decline</button>
      </div>
    </div>`;
  });
  box.innerHTML = html || "<p class='small'>No pending requests</p>";
  box.querySelectorAll("[data-approve]").forEach(b=>b.addEventListener("click", ()=>approve(b.dataset.approve)));
  box.querySelectorAll("[data-decline]").forEach(b=>b.addEventListener("click", ()=>decline(b.dataset.decline)));
}

async function approve(uid){
  await updateDoc(doc(db,"users",uid), { status:"active" });
  // optional email via extension
  // await addDoc(collection(db,"mail"), { to: (await getDoc(doc(db,"users",uid))).data().email, message:{ subject:"Faculty Access Approved", text:"You can now create/update events." } });
  loadFacultyRequests();
}
async function decline(uid){
  await updateDoc(doc(db,"users",uid), { status:"declined" });
  // optional email
  loadFacultyRequests();
}

// Save / delete events
document.getElementById("btnSaveEvent")?.addEventListener("click", async ()=>{
  const id = document.getElementById("evId").value.trim();
  const title = document.getElementById("evTitle").value.trim();
  const date  = document.getElementById("evDate").value;
  const dept  = document.getElementById("evDept").value;
  const venue = document.getElementById("evVenue").value.trim();
  if(!title || !date || !dept || !venue) { alert("Fill all fields"); return; }
  if(id){
    await updateDoc(doc(db,"events",id), { title, date, dept, venue });
    alert("Event updated");
  }else{
    await addDoc(collection(db,"events"), { title, date, dept, venue, createdAt: serverTimestamp() });
    alert("Event added");
  }
  clearEventForm(); loadAllEvents();
});

document.getElementById("btnDeleteEvent")?.addEventListener("click", async ()=>{
  const id = document.getElementById("evId").value.trim();
  if(!id) { alert("Enter Event ID to delete"); return; }
  await deleteDoc(doc(db,"events",id));
  alert("Event deleted");
  clearEventForm(); loadAllEvents();
});
document.getElementById("btnClearEvent")?.addEventListener("click", clearEventForm);
function clearEventForm(){ ["evId","evTitle","evDate","evVenue"].forEach(id=>document.getElementById(id).value=""); }

// List all events for admin
async function loadAllEvents(){
  const box = document.getElementById("adminEvents");
  const snap = await getDocs(query(collection(db,"events"), orderBy("date","asc")));
  let html = "";
  snap.forEach(d=>{
    const e = d.data();
    html += `<div class="item">
      <div><b>${e.title}</b> — <span class="small">${e.date} • ${e.dept} • ${e.venue}</span><br/><span class="small">ID: ${d.id}</span></div>
      <div class="row">
        <button class="btn" data-edit="${d.id}">Edit</button>
        <button class="btn danger" data-del="${d.id}">Delete</button>
      </div>
    </div>`;
  });
  box.innerHTML = html || "<p class='small'>No events</p>";
  box.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click", ()=>fillEvent(b.dataset.edit)));
  box.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click", async()=>{
    await deleteDoc(doc(db,"events", b.dataset.del)); loadAllEvents();
  }));
}
async function fillEvent(id){
  const d = await getDoc(doc(db,"events",id));
  const e = d.data();
  document.getElementById("evId").value = id;
  document.getElementById("evTitle").value = e.title || "";
  document.getElementById("evDate").value = e.date || "";
  document.getElementById("evDept").value = e.dept || "CSE";
  document.getElementById("evVenue").value = e.venue || "";
}
