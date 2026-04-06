import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, arrayUnion, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore }  from './userStore'
import { dateUuid } from '@/utils/utils'
import { ChatState }  from '@/utils/constants'

/* 
   Chat
      id
      name
      state: ChatState: ACTIVE, ARCHIVED
      userId
      description
      dateCreated
      dateModified
*/

const TABLE = 'chats'

export const useChatStore = defineStore('chatStore', () => {
   const userStore = useUserStore()
   const chatCollection = collection(db, TABLE)
   function chatDoc(id) { return doc(db, TABLE, id) }

   const allChats = useFirestore(chatCollection, [])
   const activeChatsQuery = computed(() => query(chatCollection, where('state', '==', ChatState.ACTIVE)))
   const activeChats = useFirestore(activeChatsQuery, [])

   const chatIdToChat = computed(() => new Map(allChats.value.map((obj) => [obj.id, obj])))
   function getChat(id) { return chatIdToChat.value.get(id) }

   function addChat(chat) {
      const chatToAdd = { 
         ...chat, 
         id: dateUuid(), 
         state: ChatState.ACTIVE,
         userId: userStore.userId,
         dateCreated: serverTimestamp(), 
         dateModified: serverTimestamp() }
      setDoc(chatDoc(chatToAdd.id), chatToAdd)
   }

   function updateChat(chat) {
      const chatToUpdate = { ...chat, dateModified: serverTimestamp() }
      updateDoc(chatDoc(chatToUpdate.id), chatToUpdate)
   }

   function deleteChat(id) {
      deleteDoc(doc(chatCollection, id))
   }

   return { allChats, activeChats, getChat, addChat, updateChat, deleteChat }
})
