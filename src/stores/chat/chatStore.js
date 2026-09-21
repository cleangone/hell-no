import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, arrayUnion, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore }  from '../userStore'
import { dateUuid, isGroup } from '@/utils/utils'
import { State, ChatStatus }  from '@/utils/constants'

/* 
   Chat
      id
      name
      state: State: PUBLIC, GROUP, PRIVATE  
      status: ChatStatus: ACTIVE, ARCHIVED
      userId
      groupId
      description
      dateCreated
      dateModified
*/

const TABLE = 'chats'

export const useChatStore = defineStore('chatStore', () => {
   const userStore = useUserStore()
   const chatCollection = collection(db, TABLE)
   function chatDoc(id) { return doc(db, TABLE, id) }

   const chats = useFirestore(chatCollection, [])

   const publicChatsQuery = computed(() => query(chatCollection, where('state', '==', State.PUBLIC)))  
   const publicChats = useFirestore(publicChatsQuery, [])
  
   const chatIdToChat = computed(() => new Map(chats.value.map((obj) => [obj.id, obj])))
   function getChat(id) { return chatIdToChat.value.get(id) }

   const groupIdToGroupChats = computed(() => chats.value.reduce((groupIdToChats, chat) => {
         if (isGroup(chat) && chat.groupId) {
            if (!groupIdToChats.has(chat.groupId)) { groupIdToChats.set(chat.groupId, []) }
            groupIdToChats.get(chat.groupId).push({ ...chat })
         }
         return groupIdToChats 
      }, new Map())
   )
   function getGroupChats(groupId) { 
      return groupIdToGroupChats.value.has(groupId) ? groupIdToGroupChats.value.get(groupId) : [] }

   function addChat(chat) {
      const chatToAdd = { 
         ...chat, 
         id: dateUuid(), 
         status: ChatStatus.ACTIVE,
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

   return { chats, publicChats, getChat, getGroupChats, addChat, updateChat, deleteChat }
})
