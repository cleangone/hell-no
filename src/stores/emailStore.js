import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from './userStore'
import { dateUuid } from '@/utils/utils' 

/*
   emailThread
      id 
      mirrorThreadId - prepopulated id of mirror thread
      primaryThreadId - populated on mirror thread created by backend 
      userId
      emails[]
         id
         primaryEmailId - populated on mirror email created by backend 
         itemId - optional
         fromContact { userId, username, email}
         toContact   { userId, username, email}
         subject
         content
         dateCreated
      dateCreated
      dateModified
*/

const TABLE = 'email_threads'

export const useEmailStore = defineStore('email', () => {
   const userStore = useUserStore()
   const threadCollection = collection(db, TABLE)
   function threadDoc(id) { return doc(db, TABLE, id) }
   
   const myThreadsQuery = computed(() => userStore.userId && query(threadCollection, where('userId', '==', userStore.userId)))
   const myEmailThreads = useFirestore(myThreadsQuery, [])
   
   function addEmailThread(email) { 
      const threadToAdd = { 
         id:dateUuid(), mirrorThreadId: dateUuid(), userId:userStore.userId, 
         name:email.subject, emails:[getEmailToAdd(email)],
         dateCreated:serverTimestamp(), dateModified: serverTimestamp() }
      console.log("addEmailThread", threadToAdd)
      setDoc(threadDoc(threadToAdd.id), threadToAdd)
   }
   function getEmailToAdd(email) { return { ...email, id:dateUuid(), dateCreated: new Date() } } 

   function updateEmailThread(thread) {
      const threadToUpdate = { ...thread, dateModified: serverTimestamp() }
      updateDoc(threadDoc(threadToUpdate.id), threadToUpdate)
   }

   function addEmail(threadId, email) {
      console.log("addEmail", email)
      updateDoc(threadDoc(threadId), 
         { emails: arrayUnion(getEmailToAdd(email)), dateModified:serverTimestamp() })
   }
   
   function deleteEmail(threadId, email) { updateDoc(threadDoc(threadId), { emails: arrayRemove(email) }) }   
   function deleteEmailThread(id) { deleteDoc(doc(threadCollection, id)) }

   return { myEmailThreads, addEmailThread, updateEmailThread, addEmail, deleteEmail, deleteEmailThread }
})
