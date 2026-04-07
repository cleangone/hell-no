importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js');

const FirebaseConfig = {
   projectId: "gallery-a1fcb",
   messagingSenderId: "243285865702",
 }

console.log("firebase-messaging-sw initializing")
firebase.initializeApp(FirebaseConfig)
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
   console.log("firebase-messaging-sw onBackgroundMessage", payload)
   const notificationTitle = payload.data.title
   const notificationOptions = { body: payload.data.body }

   self.registration.showNotification(notificationTitle, notificationOptions);
})


