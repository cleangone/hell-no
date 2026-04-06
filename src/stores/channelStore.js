import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore }  from './userStore'
import { dateUuid } from '@/utils/utils'
   
/*
   Channel
      id
      name
      userId
      deviceIds[]
      dateCreated
      dateModified
*/

const TABLE = 'channels'

export const useChannelStore = defineStore('channelStore', () => {
   const userStore = useUserStore()
   
   const channelCollection = collection(db, TABLE)
   function channelDoc(id) { return doc(db, TABLE, id) }
   
   const myChannelsQuery = computed(() => userStore.userId && query(channelCollection, where('userId', '==', userStore.userId)))
   const myChannels = useFirestore(myChannelsQuery, [])
   const channelIdToMyChannel = computed(() => { return new Map(myChannels.value.map((obj) => [obj.id, obj])) })
  
   function addChannel(channel) {
      const channelToAdd = { 
         ...channel, id:dateUuid(), deviceIds:[], dateCreated:serverTimestamp(), dateModified:serverTimestamp() }
      setDoc(channelDoc(channelToAdd.id), channelToAdd)
   }

   function updateChannel(channel) { 
      updateDoc(channelDoc(channel.id), { ...channel, dateModified: serverTimestamp() }) 
   }

   function deleteChannel(id) {
      deleteDoc(doc(channelCollection, id))
   }

   return { myChannels, channelIdToMyChannel, addChannel, updateChannel, deleteChannel }
})
