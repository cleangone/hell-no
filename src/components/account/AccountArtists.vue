<template>
   <div class="text-left">
      <div class="text-h5">
         Artists <TextButton @click="showAddDialog=true" text="Add Artist"/>
      </div>
      <v-data-table :headers="headers" :items="artists"  :items-per-page="50" density="compact">
         <template v-slot:item.name="{ item }">
            {{ item.fullName }}
         </template>
         <template v-slot:item.items="{ item }">
            {{ item.items.length ? item.items.length : "" }}
         </template>
         <template v-slot:item.actions="{ item }">
            <div v-if="userCreatedArtist(item)">
               <EditButton   @click="editArtist(item)"   :disabled="disableEdit(item)"/>
               <DeleteButton @click="deleteArtist(item)" :disabled="disableDelete(item)"/> 
            </div>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddArtist @done="showAddDialog=false"/>
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
   import { useUserStore }   from '@/stores/userStore'
   import { useArtistStore } from '@/stores/artistStore'
   import { useItemStore }   from '@/stores/itemStore'
   import AddArtist    from '@/components/artist/AddArtist.vue'
   import EditArtist   from '@/components/artist/EditArtist.vue'
   import DeleteArtist from '@/components/artist/DeleteArtist.vue'
   import EditButton   from '@/components/util/EditButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   
   const userStore   = useUserStore()
   const artistStore = useArtistStore()
   const itemStore   = useItemStore()
   const showAddDialog = ref(false)
   const showEditDialog = ref(false)
   const showDeleteDialog = ref(false)
   const selectedArtist = ref({})
   
   const headers = [
      { title: 'Artist',    key: 'name',        value: 'name' },
      { title: 'AKA for',   key: 'akaFullName', value: 'akaFullName' },
      { title: 'Items',     key: 'items',         align: 'center' },
      { title: '',          key: "actions",       sortable: false },
   ]

   const artists = computed(() => { 
      const displayArtists = []
      for (const artist of artistStore.artists) {
         const displayArtist = { ...artist }
         displayArtist.akaFullName = artist.akaForId ? artistStore.getFullName(artist.akaForId) :  "" 
         displayArtist.items = itemStore.getArtistItems(artist.id) 
         displayArtists.push(displayArtist)
      }
      return displayArtists
   })

   const userCreatedArtist = (artist) => { return artist.userId == userStore.userId }

   // user can edit an artist they created if the artist doesn't have any items or only has items owned by the user
   const disableEdit = (artist) => {
      if (!userCreatedArtist(artist)) { return true }
      for (const item of artist.items) {
         if (item.userId != userStore.userId ) { return true }
      }
      return false
   }

   // user can delete an artist they created if the artist isn't referenced by any items
   const disableDelete = (artist) => { 
      if (!userCreatedArtist(artist)) { return true }
      if (artist.items.length) { return true }
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
