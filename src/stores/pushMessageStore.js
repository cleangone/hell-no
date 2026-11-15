import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { dateUuid } from '@/utils/utils'

/*
   PushMessage
      id
      state: MessageState: CREATED, SENT, ERROR
      data
         title
         body 
      error
      messageToken
         deviceId
         token
         deviceType
      username
      dateCreated
*/

const TABLE = 'push-messages'
const MessageState = { CREATED: 'Created' }

export const usePushMessageStore = defineStore('pushMessage', () => {

   function addPushMessage(title, body, user) {
      console.log("addMessage", user.username, title, body)
      for (const messageToken of user.pushMessageTokens) {   
         const id = dateUuid()
         console.log("Adding push-message for device", messageToken.deviceType)
         setDoc(messageDoc(id), {
            id: id,
            state: MessageState.CREATED,
            data: { title: title, body: body },
            messageToken: messageToken,
            username: user.username,
            dateCreated: serverTimestamp()
         })
      }
   }

   function messageDoc(id) { return doc(db, TABLE, id) }

   return { addPushMessage }
})
