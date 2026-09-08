// js/auth-register.js
import { auth, db, COLLEGE_DOMAINS } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function isCollegeMail(email){
  const normalized = email?.trim().toLowerCase();
  return COLLEGE_DOMAINS.some((domain) => normalized?.endsWith(domain.toLowerCase()));
}

const q = new URLSearchParams(location.search);
const rolePreset = q.get("role");
if(rolePreset){ document.getElementById("role").value = rolePreset; }

document.getElementById("btnSignUp")?.addEventListener("click", async ()=>{
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value || "student";
  if(!isCollegeMail(email)){ alert("Use your college email only. Example: name@skasc.ac.in"); return; }
  try{
    const {user} = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", user.uid), {
      name, email, role, status: role==="faculty" ? "pending" : "active",
      createdAt: serverTimestamp()
    });
    alert("Account created! Please login.");
    location.href = "./login.html";
  }catch(e){ alert(e.message); }
});
