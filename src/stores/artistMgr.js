import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useArtistStore } from '@/stores/artistStore'
import { ArtistState, ArtistVisibility } from '@/utils/constants'
      
export const useArtistMgr = defineStore('artistMgr', () => {   
   const artistStore = useArtistStore()
   
   const myVisibleArtistIdToArtist = computed(() => { 
      return getArtistIdToArtist(artistStore.myVisibleArtists)
   })
   
   function getArtistIdToArtist(artists) { return new Map(artists.map((obj) => [obj.id, obj])) }

   function getFullName(firstName, middleName, name) {
      return (firstName  && firstName.length  ? firstName  + " " : "") +  
             (middleName && middleName.length ? middleName + " " : "") + 
             name
   }

   function getPrimaryArtistsForAKA(visibility) { 
      const artists = []
      for (const artist of artistStore.myVisibleArtists) {
         // cannot base an SITE Aka on a USER Primary
         const visibilityMismatch = (visibility == ArtistVisibility.SITE && artist.visibility == ArtistVisibility.USER)
         if (artist.state == ArtistState.PRIMARY && !visibilityMismatch) {
            artists.push({ title: artist.fullName, value: artist })
         }
      }
      return artists
   }

   function hasAKAs(artistId) { 
      for (const artist of artistStore.myVisibleArtists) {
         if (artist.akaForId == artistId)  { return true }
      }
      return false
   }

   function getItemArtist(artist) {
      return { id: artist.id, name: artist.name, fullName: artist.fullName, allNames: artist.allNames } 
   }

   function getArtistOptions(artists) {
      const options = []
      for (const artist of artists) {
         options.push({ title: artist.fullName, value: artist })
      }
      return options
   }

   return { myVisibleArtistIdToArtist, getArtistIdToArtist, hasAKAs, 
      getPrimaryArtistsForAKA, getFullName, getItemArtist, getArtistOptions }
})
