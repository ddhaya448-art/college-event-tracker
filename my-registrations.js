// js/my-registrations.js
import { auth, db } from "./firebase-config.js";
import {
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection, getDocs, query, where, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.getElementById("btnLogout")?.addEventListener("click", ()=>signOut(auth));

onAuthStateChanged(auth, async (user)=>{
  if(!user){ location.href="./login.html"; return; }
  loadMyRegs(user.uid);
});

async function loadMyRegs(uid){
  const box = document.getElementById("myRegs");
  box.innerHTML = "<div class='card'>Loading...</div>";
  const regs = await getDocs(query(collection(db,"registrations"), where("userId","==",uid)));
  let html = "";
  for(const r of regs.docs){
    const eventId = r.data().eventId;
    const e = await getDoc(doc(db,"events", eventId));
    const ev = e.exists()? e.data() : { title: eventId, date:"", dept:"", venue:"" };
    html += `<div class="card event">
      <div>
        <div style="font-weight:700">${ev.title}</div>
        <div class="small">${ev.date} • ${ev.dept} • ${ev.venue}</div>
      </div>
      <span class="pill">Registered</span>
    </div>`;
  }
  box.innerHTML = html || "<div class='card'>No registrations yet</div>";
}
