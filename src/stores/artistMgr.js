import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore }   from '@/stores/userStore'
import { useArtistStore } from '@/stores/artistStore'
import { ArtistState } from '@/utils/constants'
      
export const useArtistMgr = defineStore('artistMgr', () => {  
   const userStore   = useUserStore() 
   const artistStore = useArtistStore()
   
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

   function getArtistOption(artist) {
      return { title: artist.fullName, value: getItemArtist(artist) }
   } 

   const artistOptions = computed(() => getArtistOptions(artistStore.artists))

   function getArtistOptions(artists) {
      const options = []
      for (const artist of artists) {
         options.push(getArtistOption(artist))
      }
      return options
   }

   function getMatchingArtist(artistFirstLast) {
      const names = artistFirstLast.split(" ")
      for (const artist of artistStore.primaryArtists) {
         if (isMatch(artist, names)) { return artist }
      }
      return null
   }
   function isMatch(artist, names) {
      for (const name of names) {
         if (!artist.allNames.includes(name)) { return false }
      }
      return true
   }

   const addArtistFirstLast = (artistFirstLast) => { 
      console.log("addArtistFirstLast", artistFirstLast)

      let firstName = ""
      let middleName = ""
      let name = ""
      
      const names = artistFirstLast.split(" ")
      if (names.length == 1) { name = names[0] }
      else if (names.length == 2) { 
         firstName = names[0] 
         name = names[1] 
      }
      else if (names.length == 3) { 
         firstName  = names[0] 
         middleName = names[1] 
         name = names[2] 
      }
      else if (names.length > 3) { 
         firstName  = names[0] 
         middleName = names[1] 
         name = names[names.length-1] 
      }

      artistStore.addArtist({ 
         firstName:  firstName, 
         middleName: middleName, 
         name:       name, 
         fullName:   artistFirstLast,
         sortName:   name,
         state:      ArtistState.PRIMARY,
         akaForId:   "",
         allNames:   artistFirstLast,
         userId:     userStore.userId,
         action:      "" 
      })
   }

   return { 
      getArtistIdToArtist, hasAKAs, getPrimaryArtistsForAKA, getFullName, 
      getItemArtist, getArtistOption, artistOptions, getArtistOptions, 
      getMatchingArtist, addArtistFirstLast,
   }
})
