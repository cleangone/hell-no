import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { dateUuid } from '@/utils/utils'

/*
   Message
      id
      state: MessageState: CREATED, ERROR (message deleted after successfully sent)
      data
         title
         body 
      error
      messagingToken
         device
         token
      username
      dateCreated
*/

const TABLE = 'messages'
const MessageState = { CREATED: 'Created' }

export const useMessageStore = defineStore('message', () => {
   function addMessage(title, body, user) {
      console.log("addMessage", title, body)
      console.log("addMessage.messagingTokens", user.messagingTokens)
      for (const messagingToken of user.messagingTokens) {   
         const id = dateUuid()
         setDoc(messageDoc(id), {
            id: id,
            state: MessageState.CREATED,
            data: { title: title, body: body },
            messagingToken: messagingToken,
            username: user.username,
            dateCreated: serverTimestamp()
         })
      }
   }

   function messageDoc(id) { return doc(db, TABLE, id) }

   return { addMessage }
})
