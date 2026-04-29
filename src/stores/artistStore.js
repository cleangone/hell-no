import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { dateUuid } from '@/utils/utils'
import { ArtistState } from '@/utils/constants'

/* 
   Artist
      id
      name: last name or moniker, ie Smith or BWS
      firstName
      middleName
      fullName: first middle last
      sortName
      userId: user that created artist 
      visibility: unused, was SITE, USER
      state: ArtistState: PRIMARY, AKA
      akaForId
      allNames: concatintaed string of all names & AKAs, ie "Barry Smith Windsor-Smith BWS"
      dateCreated
      dateModified
*/

const TABLE = 'artists'

export const useArtistStore = defineStore('artistStore', () => {
   const artistCollection = collection(db, TABLE)
   function artistDoc(id) { return doc(db, TABLE, id) }

   const rawArtists = useFirestore(artistCollection)      

   // artist list is sorted every time it's used
   const artists = computed(() => rawArtists.value ? sort([ ...rawArtists.value ]) : [])
   const primaryArtists = computed(() => artists.value.filter(a => a.state == ArtistState.PRIMARY) )

   const artistIdToArtist = computed(() => new Map(artists.value.map((obj) => [obj.id, obj])))
   const primaryIdToAkaIds = computed(() => {
      const primaryToAkas = new Map()
      for (const artist of artists.value) {
         if (artist.akaForId) { // PRIMARY artist id if this artist is an AKA 
            let akaIds = primaryToAkas.get(artist.akaForId) 
            if (!akaIds) {
               akaIds = []
               primaryToAkas.set(artist.akaForId, akaIds)
            }
            akaIds.push(artist.id)
         }
      }
      return primaryToAkas
   })
   
   function getArtist(artistId)   { return artistIdToArtist.value.has(artistId) ? artistIdToArtist.value.get(artistId) : {} }
   function getFullName(artistId) { return artistIdToArtist.value.has(artistId) ? artistIdToArtist.value.get(artistId).fullName : "" }
   
   // all artists related by aka to the specified one
   function getAllArtistIds(artistId) {
      // console.log("addArtist", artist) 
      const allIds = []
      const paramArtist = artistIdToArtist.value.get(artistId)
      if (!paramArtist) { return allIds }

      const primaryArtist = paramArtist.state == ArtistState.PRIMARY ? paramArtist : artistIdToArtist.value.get(paramArtist.akaForId)
      allIds.push(primaryArtist.id)
      if (primaryIdToAkaIds.value.has(primaryArtist.id)) { allIds.push(...primaryIdToAkaIds.value.get(primaryArtist.id)) }

      return allIds
   }

   function sort(artists) { return artists.sort((a, b) => a.sortName.localeCompare(b.sortName)) }

   function addArtist(artist) {
      const artistToAdd = { ...artist, id:dateUuid(), dateCreated: serverTimestamp(), dateModified: serverTimestamp()  }
      setDoc(artistDoc(artistToAdd.id), artistToAdd)
      return artistToAdd.id
   }

   function updateArtist(artist) {
      const artistToUpdate = { ...artist, dateModified: serverTimestamp() }
      updateDoc(artistDoc(artistToUpdate.id), artistToUpdate)
   }

   function deleteArtist(id) { deleteDoc(doc(artistCollection, id)) }

   return { artists, primaryArtists, getArtist, getFullName, getAllArtistIds, addArtist, updateArtist, deleteArtist }
})
