import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { dateUuid } from '@/utils/utils'

/* 
   ChatReply
      id
      postId
      userId
      text
      dateCreated
      dateModified
*/

const TABLE = 'chat-replies'

export const useReplyStore = defineStore('replyStore', () => {
   const replyCollection = collection(db, TABLE)
   function replytDoc(id) { return doc(db, TABLE, id) }

   const replies = useFirestore(replyCollection, [])
   const postIdToReplies = computed(() => {
      const map = new Map()
      for (const reply of replies.value) { 
         if (!map.has(reply.postId) ) { map.set(reply.postId, []) }
         map.get(reply.postId).push(reply)
      }
      return map
   })
   
   function getReplies(postId) { 
      return postIdToReplies.value.has(postId) ? postIdToReplies.value.get(postId) : [] }

   function addReply(reply) {
      const replyToAdd = { 
         ...reply, id: dateUuid(), dateCreated: serverTimestamp(), dateModified: serverTimestamp() }
      setDoc(replytDoc(replyToAdd.id), replyToAdd)
   }

   function updateReply(reply) {
      updateDoc(replyDoc(reply.id), { ...reply, dateModified: serverTimestamp() })
   }
   
   function deleteReply(id) {
      deleteDoc(doc(replyCollection, id))
   }

   function deleteReplies(ids) {
      const batch = writeBatch(db)
      for (const id of ids) {
         batch.delete(doc(replyCollection, id))
      }
      batch.commit()
   }

   return { getReplies, addReply, updateReply, deleteReply, deleteReplies }
})
