import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from './userStore'
import { dateUuid } from '@/utils/utils'
import { EmailSourceState, InviteState } from '@/utils/constants'
   
/*
   Invite
      id
      type: InviteType: SITE, GROUP
      state: InviteState: CREATED, SENT, ACCEPTED, ARCHIVED
             EmailSourceState: EMAIL_CREATED:, EMAIL_PENDING, EMAIL_PROCESSING, EMAIL_SENT, EMAIL_ERROR, EMAIL_UNKNOWN
      fromUserId
      fromUserFullName
      groupId
      groupName
      toEmail - if individual invite
      toFirstName - if individual invite
      toUserId - if group invite
      acceptances[] - of group invites
         email
         firstName
      dateCreated
      dateModified
*/

const TABLE = 'invites'
const INACTIVE_STATES = [ InviteState.ACCEPTED, InviteState.ARCHIVED ]        

export const useInviteStore = defineStore('invite', () => {
   const userStore = useUserStore()
   const inviteCollection = collection(db, TABLE)
   function inviteDoc(inviteId) { return doc(db, TABLE, inviteId) }
   
   const invites = useFirestore(inviteCollection)      
   const myInvitesQuery = computed(() => userStore.userId && query(inviteCollection, where('fromUserId', '==', userStore.userId)) )
   const myInvites = useFirestore(myInvitesQuery, [])

   const myRecvdInvitesQuery = computed(() => userStore.userId && query(inviteCollection, where('toUserId', '==', userStore.userId)) )
   const myRecvdInvites = useFirestore(myRecvdInvitesQuery, [])
   
   const allActiveInvites = computed(() => getActive(invites.value))
   const myActiveInvites  = computed(() => getActive(myRecvdInvites.value))
   function getActive(invitesToCheck) { 
      const active = []
      if (invitesToCheck) {
         for (const invite of invitesToCheck) { 
            if (!INACTIVE_STATES.includes(invite.state)) { active.push(invite) }
         }  
      }
      return active
   }

   function addInvite(invite) {
      // console.log("addInvite", invite) 
      const inviteToAdd = { ...invite, id:dateUuid(), acceptances:[], dateCreated:serverTimestamp(), dateModified:serverTimestamp() }
      setDoc(inviteDoc(inviteToAdd.id), inviteToAdd)
   }

   function updateInvite(invite) { 
      updateDoc(inviteDoc(invite.id), { ...invite, dateModified:serverTimestamp() }) 
   }

   function deleteInvite(inviteId) { deleteDoc(doc(inviteCollection, inviteId)) }
   
   return { invites, myInvites, allActiveInvites, myActiveInvites, addInvite, updateInvite, deleteInvite }
})
