import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore } from './userStore'
import { dateUuid } from '@/utils/utils'
   
/*
   Profile
      id
      name
      userId
      dateCreated
      dateModified
*/

const TABLE = 'profiles'

export const useProfileStore = defineStore('profile', () => {
   const userStore = useUserStore()
   const profileCollection = collection(db, TABLE)
   function profileDoc(id) { return doc(db, TABLE, id) }
   
   const profiles = useFirestore(profileCollection)   
   const profileNames = computed(() => { return profiles?.value ? new Set(profiles.value.map(obj => obj.name)) : new Set() })

   const myProfilesQuery = computed(() => userStore.userId && query(profileCollection, where('userId', '==', userStore.userId)))
   const myRawProfiles = useFirestore(myProfilesQuery, [])
   const myProfiles = computed(() => {
      const sorted = [ ...myRawProfiles.value ]
      sorted.sort(function(a, b){return a.name.localeCompare(b.name)}) 
      return sorted
   })

   function addProfile(name, userId) {
      console.log("addProfile", name)
      const id = dateUuid()
      setDoc(profileDoc(id), {
         id: id,
         name: name,
         userId: userId,
         dateCreated:  serverTimestamp(),
         dateModified: serverTimestamp()
      })
   }

   function updateProfile(profile) { updateDoc(profileDoc(profile.id), { ...profile, dateModified: serverTimestamp() }) }
   function deleteProfile(id)      { deleteDoc(doc(profileCollection, id)) }

   return { 
      myProfiles, profileNames, addProfile, updateProfile, deleteProfile,
   }
})
