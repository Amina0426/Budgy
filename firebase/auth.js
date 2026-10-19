import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from "./config.js";

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Stop the page from reloading

    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Account created!", userCredential.user);
        alert("Welcome to Budgy!");
      })
      .catch((error) => {
        console.error("Signup error:", error.code, error.message);
        alert(error.message);
      });
  });
}

const signinForm = document.getElementById("signinForm");
if (signinForm) {
  signinForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Stop the page from reloading

    const email = document.getElementById("signinEmail").value;
    const password = document.getElementById("signinPassword").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User signed in!", userCredential.user);
        window.location.href = "./index.html";
      })
      .catch((error) => {
        console.error("Login error:", error.code, error.message);
        alert(error.message);
      });
  });
}
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

window.logout = async function () {
  try {
    await signOut(auth);
    window.location.href = "./signin.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Failed to log out. Please try again.");
  }
};
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Active Session:", user.email, "UID:", user.uid);
  } else {
    console.log("No user is signed in.");
  }
});
