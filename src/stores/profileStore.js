import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from './userStore'
   
/*
   Profile
      id
      userId
      username
      images[]
      dateCreated
      dateModified
*/

const TABLE = 'profiles'

export const useProfileStore = defineStore('profile', () => {
   const userStore = useUserStore()
   const profileCollection = collection(db, TABLE)
   function profileDoc(id) { return doc(db, TABLE, id) }
   
   const rawProfiles = useFirestore(profileCollection)   
   const profiles           = computed(() => rawProfiles.value ? rawProfiles.value : [])
   const profileIdToProfile = computed(() => new Map(profiles.value.map((obj) => [obj.id, obj])))
   const usernames          = computed(() => new Set(profiles.value.map(obj => obj.username)) )

   const myProfilesQuery = computed(() => userStore.userId && query(profileCollection, where('userId', '==', userStore.userId)))
   const myRawProfiles = useFirestore(myProfilesQuery, [])
   const myProfiles = computed(() => {
      const sorted = [ ...myRawProfiles.value ]
      sorted.sort(function(a, b){return a.username.localeCompare(b.username)}) 
      return sorted
   })
   const myProfileIdToProfile = computed(() => myProfiles.value ? new Map(myProfiles.value.map((obj) => [obj.id, obj])) : new Map())
   function getMyProfile(profileId) { return myProfileIdToProfile.value.get(profileId) }

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

   const userIdToProfiles = computed(() => {
      const map = new Map()
      for (const profile of profiles.value) {
         if (!map.has(profile.userId)) { map.set(profile.userId, []) }
         map.get(profile.userId).push(profile)
      }
      return map
   })

   function addProfile(username, userId) {
      const newProfileRef = doc(profileCollection) // generate a firebase id, which looks like a userId
      setDoc(newProfileRef, {
         id: newProfileRef.id, 
         userId: userId,
         username: username,
         images: [],
         dateCreated:  serverTimestamp(),
         dateModified: serverTimestamp()
      })
   }

   function updateProfile(profile) { updateDoc(profileDoc(profile.id), { ...profile, dateModified: serverTimestamp() }) }
   function deleteProfile(id)      { deleteDoc(doc(profileCollection, id)) }

   // 
   // images
   //
   function addImage(profileId, imageSet) {
      updateDoc(profileDoc(profileId),  { images:arrayUnion(imageSet), dateModified:serverTimestamp() })
   }

   function updateImage(profileId, updatedImage) {
      const images = []
      const profile = getMyProfile(profileId)
      for (const image of profile.images) {
         images.push(image.id == updatedImage.id ? updatedImage : image)
      }
      updateDoc(profileDoc(profileId), { images: images, dateModified: serverTimestamp() })
   }

   function removeImage(profileId, imageSet) {
      updateDoc(profileDoc(profileId), { images:arrayRemove(imageSet), dateModified:serverTimestamp() })
   }
   
   return { 
      profiles, myProfiles, getMyProfile, usernames, getProfile, getUsername, getUserId, 
      userIdToProfiles,
      addProfile, updateProfile, deleteProfile, addImage, updateImage, removeImage
   }
})
