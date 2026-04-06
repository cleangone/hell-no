import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore }  from './userStore'
import { useLocalStore } from './localStore'
import { dateUuid } from '@/utils/utils'
import { LogEntryType } from '@/utils/constants'

/*
   Log
      id
      userId: front end, if user logged in
      entryType: LogEntryType: ERROR, INFO
      msg
      function: populated by backend
      isFlagged
      deviceId
      dateCreated
*/

const TABLE = 'log'

export const useLogStore = defineStore('log', () => {
   const userStore  = useUserStore()
   const localStore = useLocalStore()
   const logCollection = collection(db, TABLE)
   function logDoc(id) { return doc(db, TABLE, id) }
   
   const logEntries = useFirestore(logCollection)      
   
   function error(msg) { addError(msg) }
   function addError(msg) { 
      console.log(msg)
      addEntry(msg, LogEntryType.ERROR) 
   }
   
   function info(msg) { addInfo(msg) }
   function jsonInfo(jsonName, json) { addInfo(jsonName + " " + JSON.stringify(json)) }
   function addInfo(msg) { addEntry(msg, LogEntryType.INFO) }
   
   function addEntry(msg, entryType) {
      const entry = { 
         id:dateUuid(), 
         userId: userStore.userId,
         entryType: entryType,
         msg: msg, 
         isFlagged: false, 
         deviceId: localStore.deviceId,
         dateCreated: serverTimestamp() }
      setDoc(logDoc(entry.id), entry)
   }

   function updateEntry(entry) { updateDoc(logDoc(entry.id), entry) }
   
   function deleteEntry(id) {
      deleteDoc(doc(logCollection, id))
   }

   function deleteEntries(ids) {
      const batch = writeBatch(db)
      for (const id of ids) {
         batch.delete(doc(logCollection, id))
      }
      
      batch.commit()
   }

   return { 
      logEntries, addError, error, addInfo, info, jsonInfo, updateEntry, deleteEntry, deleteEntries
   }
})
