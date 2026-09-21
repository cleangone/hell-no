import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { dateUuid } from '@/utils/utils'

/* 
   ChatPost
      id
      chatId
      replyToPostId
      userId
      text
      dateCreated
      dateModified
*/

const TABLE = 'chat_posts'

export const usePostStore = defineStore('chatPostStore', () => {
   const postCollection = collection(db, TABLE)
   function postDoc(id) { return doc(db, TABLE, id) }

   const posts = useFirestore(postCollection, [])
   const chatIdToPosts = computed(() => {
      // console.log("chatIdToPosts")
      const map = new Map()
      for (const post of posts.value) { 
         if (!map.has(post.chatId) ) { map.set(post.chatId, []) }
         map.get(post.chatId).push(post)
      }
      return map
   })
   
   function getPosts(chatId) { 
      // console.log("getPosts", chatId)
      return chatIdToPosts.value.has(chatId) ? chatIdToPosts.value.get(chatId) : [] }

   function addPost(post) {
      console.log("addPost", post)
      const postToAdd = { 
         ...post, id: dateUuid(), dateCreated: serverTimestamp(), dateModified: serverTimestamp() }
      setDoc(postDoc(postToAdd.id), postToAdd)
   }

   function updatePost(post) {
      const postToUpdate = { ...post, dateModified: serverTimestamp() }
      updateDoc(postDoc(postToUpdate.id), postToUpdate)
   }
   
   function deletePost(id) {
      deleteDoc(doc(postCollection, id))
   }

   function deletePosts(ids) {
      const batch = writeBatch(db)
      for (const id of ids) {
         batch.delete(doc(postCollection, id))
      }
      batch.commit()
   }

   return { getPosts, addPost, updatePost, deletePost, deletePosts }
})
