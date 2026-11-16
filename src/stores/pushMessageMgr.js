import { defineStore } from 'pinia'
import { usePushMessageStore } from './pushMessageStore'
import { PushMessageState } from '@/utils/constants'

export const usePushMessageMgr = defineStore('pushMessageMgr', () => {
   const pushMessageStore = usePushMessageStore()

   function addPushMessages(title, body, users, pushMessageState = PushMessageState.ACTIVE) {
      console.log("addPushMessage")
      const destinations = []
      for (const user of users) {   
         for (const messageToken of user.pushMessageTokens) {   
            console.log("Adding " + user.username + " device " + messageToken.deviceType)
            destinations.push( {
               userId: user.id,
               username: user.username,
               messageToken: messageToken
            })
         }
      }

      const ids = pushMessageStore.addPushMessages(title, body, destinations, pushMessageState) 
      return ids
   }

   return { addPushMessages }
})
