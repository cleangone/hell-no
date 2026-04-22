import { computed } from 'vue'
import { defineStore } from 'pinia'
import { arrayUnion, arrayRemove } from "firebase/firestore"
import { useUserStore }  from './userStore'
import { useGroupStore } from './groupStore'

export const useUserMgr = defineStore('userMgr', () => {
   const userStore  = useUserStore()
   const groupStore = useGroupStore()
   
   const otherUsers = computed(() => { 
      const users = []
      if (userStore.userExists) {
         for (const user of userStore.users) {
            if (user.id != userStore.userId) { users.push(user)}      
         }
      }
      users.sort((a, b) => a.username.localeCompare(b.username))
      return users
   })

   const myKnownUserIds = computed(() => { 
      const knownUserIds = []
      for (const group of groupStore.myGroups) {
         knownUserIds.push( ...group.userIds )
      }
      let set = new Set(knownUserIds)
      set.delete(userStore.userId)

      return Array.from(set)
   })

   const myUserContacts = computed(() => getUserContacts(myKnownUserIds.value))

   // consolidate with myFullName
   function getFullName(user) {
      return user ? 
         (user.firstName ? user.firstName : "") + (user.firstName && user.lastName ? " " : "") + (user.lastName ? user.lastName : "") :
         ""
   }

   function getUserIdByEmail(email) {
      const userContact = getUserContactByEmail(email) 
      return userContact ? userContact.id : null
   }
   
   function getUserContactByEmail(email) {
      for (const user of userStore.users) { 
         if (user.email == email) { return getUserContact(user) }        
      }
      return null
   }

   function getUserContacts(userIds) {
      const userContacts = []
      for (const userId of userIds) { 
         const user = userStore.getUser(userId)
         if (user) { userContacts.push(getUserContact(user)) }
      }
      userContacts.sort((a, b) => a.lastName.localeCompare(b.lastName))

      return userContacts      
   }
   function getUserContact(user) {
      return { 
         id: user.id, 
         username: user.username, 
         email: user.email, 
         firstName: user.firstName, 
         lastName: user.lastName ? user.lastName : "",
         fullName: getFullName(user) 
      }         
   }

   function setItemHeaders(headers) {
      const settings = { ...userStore.mySettings }
      settings.itemHeaders = headers
      userStore.updateSettings(settings)
   }

   function setGalleryThumbOptions(options) {
      // console.log("updating user galleryThumbOptions")
      const settings = { ...userStore.mySettings }
      settings.galleryThumbOptions = options
      userStore.updateSettings(settings)
   }
   
   function setItemThumbOptions(options) {
      console.log("updating user itemThumbOptions")
      const settings = { ...userStore.mySettings }
      settings.itemThumbOptions = options
      userStore.updateSettings(settings)
   }
   
   function setShowHiddenItems(showHidden) {
      const settings = { ...userStore.mySettings }
      settings.showHiddenItems = showHidden
      userStore.updateSettings(settings)
   }

   function getUserContactsNotInGroup(group) {
      let userIds = new Set(myKnownUserIds.value)
      for (const groupUserId of group.userIds) {
         userIds.delete(groupUserId)
      }
         
      return getUserContacts(userIds)
   }
   
   function addFavoriteItem(itemId)    { userStore.updateUser({ id: userStore.userId, favoriteItems: arrayUnion(itemId) })}
   function removeFavoriteItem(itemId) { userStore.updateUser({ id: userStore.userId, favoriteItems: arrayRemove(itemId) })}

   function addMessagingToken(device, token) {
      const user = userStore.user 
      if (user) {
         let messagingTokenFound = false
         const messagingTokens = user.messagingTokens ? user.messagingTokens : []
         for (const messagingToken of messagingTokens) {
            if (messagingToken.device == device) {
               messagingToken.token = token
               messagingTokenFound = true
            }
         }

         if (!messagingTokenFound) { messagingTokens.push ({ device: device, token: token }) }   

         userStore.updateUser({id: user.id, messagingTokens: messagingTokens})
      }
      else {
         console.log("Cannot find user")
      }
   }

   return { 
      otherUsers, getFullName, getUserIdByEmail, getUserContactByEmail, 
      setItemHeaders, setGalleryThumbOptions, setItemThumbOptions, setShowHiddenItems, 
      myUserContacts, getUserContactsNotInGroup, 
      addFavoriteItem, removeFavoriteItem, addMessagingToken }
})
