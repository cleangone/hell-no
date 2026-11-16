import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { dateUuid } from '@/utils/utils'
import { PushMessageState } from '@/utils/constants'

/*
   PushMessage
      id
      state: PushMessageState: ACTIVE, STAGED, SENT, ERROR
      title
      body 
      destination
         userId
         username
         messageToken
            deviceId
            token
            deviceType
      error - populated by backend if ERROR
      dateCreated
*/

const TABLE = 'push-messages'

export const usePushMessageStore = defineStore('pushMessage', () => {

   function addPushMessages(title, body, destinations, pushMessageState = PushMessageState.ACTIVE) {
      console.log("addPushMessages", title, body) 
      const ids = []
      for (const destination of destinations) {
         const pushMessage = {
            id: dateUuid(),
            state: pushMessageState,
            title: title, 
            body: body,
            destination: destination,
            dateCreated: serverTimestamp()
         }
         console.log("addding pushMessage", pushMessage) 
         setDoc(pushMessageDoc(pushMessage.id), pushMessage)
         ids.push(pushMessage.id)
      }
      return ids
   }

   function pushMessageDoc(id) { return doc(db, TABLE, id) }

   return { addPushMessages }
})
