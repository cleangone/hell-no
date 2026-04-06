import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore }  from './userStore'
import { useAdminStore } from './adminStore'
import { dateUuid } from '@/utils/utils'
import { ArtistVisibility } from '@/utils/constants'
   
/* 
   Artist
      id
      name: last name or moniker, ie Smith or BWS
      firstName
      middleName
      fullName: first middle last
      sortName
      userId
      visibility: All, User
      state: Primary, AKA
      akaForId
      allNames: concatintaed string of all names & AKAs, ie "Barry Smith Windsor-Smith BWS"
      dateCreated
      dateModified
*/

const TABLE = 'artists'

export const useArtistStore = defineStore('artistStore', () => {
   const userStore  = useUserStore()
   const adminStore = useAdminStore()
   const artistCollection = collection(db, TABLE)
   function artistDoc(id) { return doc(db, TABLE, id) }

   const myArtistsQuery = computed(() => userStore.userId && query(artistCollection, 
         where('userId', '==', userStore.userId), 
         where('visibility', '==', ArtistVisibility.USER)))
   const siteArtistsQuery = computed(() => userStore.userId && query(artistCollection, 
      where('visibility', '==', ArtistVisibility.SITE)))
   
   const rawArtists = useFirestore(artistCollection)      
   const myRawArtists = useFirestore(myArtistsQuery, null)
   const siteRawArtists = useFirestore(siteArtistsQuery, null)
    
   const allArtists = computed(() => { return adminStore.isAdmin && rawArtists.value ? sort([ ...rawArtists.value ]) : [] })
   const myArtists  = computed(() => { return myRawArtists.value ? sort([ ...myRawArtists.value ]) : [] })
   
   const visibleSiteArtists = computed(() => {
      const artists = siteRawArtists.value ? [ ...siteRawArtists.value ] : []
      return sort(artists)
   })
   const myVisibleArtists = computed(() => {
      const artists = myRawArtists.value ? [ ...myRawArtists.value ] : []
      if (siteRawArtists.value) { artists.push( ...siteRawArtists.value) }
      return sort(artists)
   })

   function sort(artists) { return artists.sort((a, b) => a.sortName.localeCompare(b.sortName)) }

   function addArtist(artist) {
      // console.log("addArtist", artist) 
      const artistToAdd = { ...artist, id:dateUuid(), dateCreated: serverTimestamp(), dateModified: serverTimestamp()  }
      setDoc(artistDoc(artistToAdd.id), artistToAdd)
      return artistToAdd.id
   }

   function updateArtist(artist) {
      const artistToUpdate = { ...artist, dateModified: serverTimestamp() }
      updateDoc(artistDoc(artistToUpdate.id), artistToUpdate)
   }

   function deleteArtist(id) {
      deleteDoc(doc(artistCollection, id))
   }

   return { allArtists, myArtists, visibleSiteArtists, myVisibleArtists, addArtist, updateArtist, deleteArtist }
})
