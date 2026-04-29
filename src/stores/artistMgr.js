import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useArtistStore } from '@/stores/artistStore'
      
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

   function getPrimaryArtistsForAKA() { 
      const artists = []
      for (const artist of artistStore.primaryArtists) {
         artists.push({ title: artist.fullName, value: artist })
      }
      return artists
   }

   function hasAKAs(artistId) { 
      for (const artist of artistStore.artists) {
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
