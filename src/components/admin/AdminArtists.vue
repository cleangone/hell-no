<template>
   <div class="text-left">
      <div class="text-h5">
         Artists
         <TextButton @click="showAddDialog=true" text="Add Artist"></TextButton>
      </div>
      <v-data-table :headers="headers" :items="artists" :custom-key-sort="customKeySort" 
         items-per-page="25" density="compact">
         <template v-slot:item.visibility="{ item }">
            {{ item.visibility }}
            <span v-if="canElevateArtist(item)" >  
               <v-tooltip text="Elevate to Site">
                  <template v-slot:activator="{ props }">
                     <IconButton v-bind="props" icon="mdi-arrow-up-box" @click="elevateArtist(item)"/>
                  </template>
               </v-tooltip>
            </span>
         </template>
         <template v-slot:item.actions="{ item }">
            <EditButton @click="editArtist(item)"></EditButton>
            <DeleteButton @click="deleteArtist(item)" :disabled="disableDelete(item)"></DeleteButton>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddArtist :visibility="ArtistVisibility.SITE" @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showElevateDialog" width="auto">
      <ElevateArtist :artist="selectedArtist" @done="showElevateDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditArtist :artist="selectedArtist" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteArtist :artist="selectedArtist" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useArtistStore } from '@/stores/artistStore'
   import { useArtistMgr }   from '@/stores/artistMgr'
   import AddArtist     from '@/components/artist/AddArtist.vue'
   import ElevateArtist from '@/components/artist/ElevateArtist.vue'
   import EditArtist    from '@/components/artist/EditArtist.vue'
   import DeleteArtist  from '@/components/artist/DeleteArtist.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import IconButton    from '@/components/util/IconButton.vue'
   import TextButton    from '@/components/util/TextButton.vue'
   import { ArtistState, ArtistVisibility } from '@/utils/constants'
   
   const artistStore = useArtistStore()
   const artistMgr   = useArtistMgr()
   const showAddDialog     = ref(false)
   const showElevateDialog = ref(false)
   const showEditDialog    = ref(false)
   const showDeleteDialog  = ref(false)
   const selectedArtist = ref({})
   
   const headers = [
      { title: 'Artist',     key: 'displayName', value: 'displayName.fullName' },
      { title: 'Visibility', key: 'visibility',  value: 'visibility', align: 'center' },
      { title: 'AKA for',    key: 'akaArtist',   value: 'akaArtist'},
      { title: '',           key: "actions" },
   ]

   const customKeySort = {
      displayName: (a, b) => { return a.name.localeCompare(b.name) },
      visibility:  (a, b) => { return a.localeCompare(b) }, 
      akaArtist:   (a, b) => { return a.localeCompare(b) }, 
   } 

   const artists = computed(() => { 
      const displayArtists = []
      const artistIdToArtist = artistMgr.getArtistIdToArtist(artistStore.allArtists)
            
      for (const artist of artistStore.allArtists) {
         const displayArtist = { ...artist }
         displayArtist.displayName = { name: artist.name, fullName: artist.fullName }    
         
         if (artist.state == ArtistState.AKA ) {
            const akaArtist = artistIdToArtist.get(artist.akaForId)
            displayArtist.akaArtist = akaArtist ? akaArtist.fullName : "" 
         }
         else { displayArtist.akaArtist = "" }

         displayArtists.push(displayArtist)
      }
      return displayArtists
   })

   const canElevateArtist = (artist) => { 
      if (isUserArtist(artist)) {
         if (artist.state == ArtistState.PRIMARY) { return true }
         for (const otherArtist of artistStore.allArtists) {
            if (artist.akaForId == otherArtist.id) { return otherArtist.visibility == ArtistVisibility.SITE }
         }
      }
      return false
   }

   const isUserArtist = (artist) => { return artist.visibility == ArtistVisibility.USER }
   
   const disableDelete = (artist) => {
      if (isUserArtist(artist)) { return true }
      if (artist.state == ArtistState.PRIMARY) {
         for (const otherArtist of artistStore.allArtists) {
            if (otherArtist.akaFor == artist.id) { return true }
         }
      }
      return false
   }

   const elevateArtist = (artist) => {
      selectedArtist.value = artist
      showElevateDialog.value = true
   }

   const editArtist = (artist) => {
      selectedArtist.value = artist
      showEditDialog.value = true
   }

   const deleteArtist = (artist) => {
      selectedArtist.value = artist
      showDeleteDialog.value = true
   }
</script>

<style>
</style>
