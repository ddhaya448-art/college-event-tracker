// js/auth-login.js
import { auth, db, COLLEGE_DOMAINS } from "./firebase-config.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, addDoc, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function isCollegeMail(email){
  const normalized = email?.trim().toLowerCase();
  return COLLEGE_DOMAINS.some((domain) => normalized?.endsWith(domain.toLowerCase()));
}

const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
document.getElementById("btnLogin")?.addEventListener("click", async ()=>{
  const email = emailEl.value.trim();
  const password = passEl.value;
  if(!isCollegeMail(email)) { alert("Use your college email only. Example: name@skasc.ac.in"); return; }
  try{
    const {user} = await signInWithEmailAndPassword(auth, email, password);
    // log login for admin
    const userDoc = await getDoc(doc(db, "users", user.uid));
    await addDoc(collection(db, "logins"), {
      userId: user.uid, email, role: userDoc.exists()? userDoc.data().role : "student",
      at: serverTimestamp()
    });
    location.href = "./index.html";
  }catch(e){
    alert(e.message);
  }
});

onAuthStateChanged(auth, (user)=>{
  if(user) console.log("Logged in:", user.email);
});
