import { initializeApp }  from "firebase/app"
import { getFirestore, initializeFirestore, persistentLocalCache } from "firebase/firestore"
import { getStorage }     from "firebase/storage"
import { getMessaging }   from "firebase/messaging"
import { FirebaseConfig } from '@/config/config'
   
// Initialize Firebase
const app = initializeApp(FirebaseConfig)
initializeFirestore(app, { localCache: persistentLocalCache({}) }) // default settings
const db = getFirestore(app)
const storage = getStorage(app)
const messaging = getMessaging(app)

export { db, storage, messaging } 
