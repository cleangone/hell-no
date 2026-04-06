<template>
   <div class="text-left">
      <div class="text-h5">
         {{ showAllArtists ? "All Artists" : "My Artists" }}
         <TextButton v-if="showAllArtists" @click="showAllArtists=false" text="Show my artists"/>
         <TextButton v-else                @click="showAllArtists=true"  text="Show all artists"/>
         <TextButton @click="showAddDialog=true" text="Add Artist"/>
      </div>

      <v-data-table :headers="headers" :items="artists" :custom-key-sort="customKeySort" density="compact">
         <template v-slot:item.myArtist="{ item }">
            <div v-if="item.visibility == ArtistVisibility.USER">Yes</div>
         </template>
         <template v-slot:item.actions="{ item }">
            <div v-if="item.visibility == ArtistVisibility.USER">
               <EditButton   @click="editArtist(item)"   :disabled="disableEdit(item)"/>
               <DeleteButton @click="deleteArtist(item)" :disabled="disableDelete(item)"/> 
            </div>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddArtist :visibility="ArtistVisibility.USER" @done="showAddDialog=false"/>
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
   import { useItemMgr }     from '@/stores/itemMgr'
   
   import AddArtist    from '@/components/artist/AddArtist.vue'
   import EditArtist   from '@/components/artist/EditArtist.vue'
   import DeleteArtist from '@/components/artist/DeleteArtist.vue'
   import EditButton   from '@/components/util/EditButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import { ArtistState, ArtistVisibility } from '@/utils/constants'
   
   const artistStore = useArtistStore()
   const artistMgr = useArtistMgr()
   const itemMgr = useItemMgr()
   const showAllArtists = ref(true)
   const showAddDialog = ref(false)
   const showEditDialog = ref(false)
   const showDeleteDialog = ref(false)
   const selectedArtist = ref({})
   
   const headers = [
      { title: 'Artist',    key: 'displayName', value: 'displayName.fullName' },
      { title: 'My Artist', key: 'myArtist',         align: 'center', sortable: false },
      { title: 'AKA for',   key: 'akaArtist',   value: 'akaArtist' },
      { title: '',          key: "actions",                           sortable: false },
   ]

   const customKeySort = {
      displayName: (a, b) => { 
         console.log("sort.displayName")
         return a.name.localeCompare(b.name) },
      akaArtist: (a, b)   => { 
         console.log("sort.akaArtist")
         return a.localeCompare(b) }, 
   } 

   const artists = computed(() => { 
      const displayArtists = []
      const artistIdToArtist = artistMgr.getArtistIdToArtist(artistStore.myVisibleArtists)
            
      const currArtists = showAllArtists.value ? artistStore.myVisibleArtists : artistStore.myArtists
      for (const artist of currArtists) {
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

   const disableEdit = (artist) => {
      if (artist.visibility != ArtistVisibility.USER) { return true }
      return false
   }

   const disableDelete = (artist) => {
      if (disableEdit(artist)) { return true }
      if (itemMgr.artistIdToMyItemIds.has(artist.id)) { return true }
      if (artist.state == ArtistState.PRIMARY) {
         for (const otherArtist of artistStore.myArtists) {
            if (otherArtist.akaForId == artist.id) { return true }
         }
      }
      return false
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
