// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, onSnapshot, runTransaction, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getAuth, setPersistence, browserLocalPersistence, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCvt2sjHRiKTLkjGapWN--nc2u3BoyeAoA",
    authDomain: "yiranblogdota2.firebaseapp.com",
    projectId: "yiranblogdota2",
    storageBucket: "yiranblogdota2.firebasestorage.app",
    messagingSenderId: "183601549794",
    appId: "1:183601549794:web:571ed787dc6e523f6969bb",
    measurementId: "G-ZY9MV3RW51"
};

// ---- Page identity ----
// Your page path is "www.yiranlei.com/dota2_ember_spirit"
// Use a stable pageId. Here we use the path without leading "/" and with slashes replaced.
const path = window.location.pathname.replace(/^\/+/, ""); // "dota2_ember_spirit" (or "dota2/ember" if you had nested)
const pageId = encodeURIComponent(path || "home");          // safe doc id

// localStorage key: one like per browser per page
const likedKey = `liked:${pageId}`;

// ---- Init ----
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const likeBtn = document.getElementById("like_btn");
const likeCountEl = document.getElementById("like_count");

if (!likeCountEl || !likeBtn) {
    // This page has no like counter → do nothing
}else{
    const pageRef = doc(db, "pages", pageId);

    function updateButtonState() {
        const alreadyLiked = localStorage.getItem(likedKey) === "1";
        likeBtn.disabled = alreadyLiked;
    }

    updateButtonState();

    // ---- Auth: anonymous sign-in (required for writes) ----
    // IMPORTANT: wait for auth before doing transactions.
    let currentUid = null;

    onAuthStateChanged(auth, (user) => {
        if (user) currentUid = user.uid;
    });

    try {
        await signInAnonymously(auth);
    } catch (e) {
        console.error("Anonymous auth failed:", e);
        setStatus("Auth failed. Check Firebase Auth settings.");
    }

    // ---- Live read (needs allow read: if true on /pages/{pageId}) ----
    onSnapshot(pageRef, (snap) => {
        const likes = snap.exists() ? (snap.data().likes ?? 0) : 0;
        likeCountEl.textContent = String(likes);
    }, (err) => {
        console.error("onSnapshot error:", err);
        setStatus("Read blocked (check Firestore rules).");
    });

    // ---- Like button ----
    likeBtn.addEventListener("click", async () => {
        if (localStorage.getItem(likedKey) === "1") {
            updateButtonState();
            return;
        }
        if (!currentUid) {
            return;
        }

        likeBtn.disabled = true;

        // userLikes doc id includes uid and pageId so it’s unique per user+page
        const likeDocId = `${currentUid}_${pageId}`;
        const userLikeRef = doc(db, "userLikes", likeDocId);

        try {
        await runTransaction(db, async (tx) => {
            const userLikeSnap = await tx.get(userLikeRef);
            if (userLikeSnap.exists()) {
            // Already liked by this uid; prevent increment
            return;
            }

            const pageSnap = await tx.get(pageRef);

            if (!pageSnap.exists()) {
            // Create page doc with likes=1
            tx.set(pageRef, { likes: 1 });
            } else {
            const oldLikes = pageSnap.data().likes ?? 0;
            tx.update(pageRef, { likes: oldLikes + 1 });
            }

            tx.set(userLikeRef, {
                uid: currentUid,
                pageId: pageId,
                likedAt: serverTimestamp()
            });
        });

        // client-side lock (prevents repeated writes from same browser)
        localStorage.setItem(likedKey, "1");
        } catch (e) {
            console.error("Like transaction failed:", e);
            // re-enable so they can retry if it was a transient error
            likeBtn.disabled = false;
            return;
        }

            updateButtonState();
        });
}
