import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from './userStore'
   
/*
   Profile
      id
      userId
      username
      dateCreated
      dateModified
*/

const TABLE = 'profiles'

export const useProfileStore = defineStore('profile', () => {
   const userStore = useUserStore()
   const profileCollection = collection(db, TABLE)
   function profileDoc(id) { return doc(db, TABLE, id) }
   
   const profiles = useFirestore(profileCollection)   
   const profileIdToProfile = computed(() => profiles.value ? new Map(profiles.value.map((obj) => [obj.id, obj])) : new Map())
   const usernames = computed(() => { return profiles?.value ? new Set(profiles.value.map(obj => obj.username)) : new Set() })

   const myProfilesQuery = computed(() => userStore.userId && query(profileCollection, where('userId', '==', userStore.userId)))
   const myRawProfiles = useFirestore(myProfilesQuery, [])
   const myProfiles = computed(() => {
      const sorted = [ ...myRawProfiles.value ]
      sorted.sort(function(a, b){return a.username.localeCompare(b.username)}) 
      return sorted
   })

   function getUsername(profileId) {
      const profile = profileIdToProfile.value.get(profileId)
      return profile ? profile.username : null 
   }

   function getProfile(profileId) {
      return profileIdToProfile.value.get(profileId)
   }
   function getUserId(profileId) {
      const profile = profileIdToProfile.value.get(profileId)
      return profile ? profile.userId : null 
   }

   function addProfile(username, userId) {
      const newProfileRef = doc(profileCollection) // generate a firebase id, which looks like a userId
      setDoc(newProfileRef, {
         id: newProfileRef.id, 
         userId: userId,
         username: username,
         dateCreated:  serverTimestamp(),
         dateModified: serverTimestamp()
      })
   }

   function updateProfile(profile) { updateDoc(profileDoc(profile.id), { ...profile, dateModified: serverTimestamp() }) }
   function deleteProfile(id)      { deleteDoc(doc(profileCollection, id)) }

   return { 
      myProfiles, usernames, getProfile, getUsername, getUserId, addProfile, updateProfile, deleteProfile,
   }
})
