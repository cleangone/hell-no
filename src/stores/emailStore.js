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
      name - initial email subject
      userIds - users involved in the exchange
      emails[]
         id
         visibleToUserIds[] - starts with both, deleting an email will remove that user, but the other user
            still sees the email.  Once empty, the backend will delete the email and then possilby the thread
         fromContact { userId, username, email}
         toContact   { userId, username, email}
         subject
         content
         itemId - optional
         dateCreated
      dateCreated
      dateModified
*/

const TABLE = 'email-threads'

export const useEmailStore = defineStore('email', () => {
   const userStore = useUserStore()
   const threadCollection = collection(db, TABLE)
   function threadDoc(id) { return doc(db, TABLE, id) }
   
   const myThreadsQuery = computed(() => userStore.userId && query(threadCollection, where('userIds', "array-contains", userStore.userId)))
   const myEmailThreads = useFirestore(myThreadsQuery, [])
   
   function addEmailThread(email) { 
      const threadToAdd = { 
         id:            dateUuid(),  
         userIds:       getlUserIds(email), 
         name:          email.subject, 
         emails:        [ getEmailToAdd(email) ],
         dateCreated:   serverTimestamp(), 
         dateModified:  serverTimestamp() }
      console.log("addEmailThread", threadToAdd)
      setDoc(threadDoc(threadToAdd.id), threadToAdd)
   }
   function getlUserIds(email)   { return [ email.toContact.userId,  email.fromContact.userId ]}
   function getEmailToAdd(email) { return { ...email, id:dateUuid(), visibleToUserIds: getlUserIds(email), dateCreated: new Date() }} 

   function updateEmailThread(thread) {
      const threadToUpdate = { ...thread, dateModified: serverTimestamp() }
      updateDoc(threadDoc(threadToUpdate.id), threadToUpdate)
   }

   function addEmail(threadId, email) {
      console.log("addEmail", email)
      updateDoc(threadDoc(threadId), 
         { emails: arrayUnion(getEmailToAdd(email)), dateModified:serverTimestamp() })
   }
   
   function updateEmails(threadId, emails) {
      console.log("updateEmails", emails)
      updateDoc(threadDoc(threadId), { emails: emails, dateModified:serverTimestamp() })
   }

   return { myEmailThreads, addEmailThread, updateEmailThread, addEmail, updateEmails }
})
