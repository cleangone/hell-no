<template>
   <div class="text-left">
      <div class="text-h5">
         Artists
         <TextButton @click="showAddDialog=true" text="Add Artist"></TextButton>
      </div>
      <v-data-table :headers="headers" :items="artists" items-per-page="50" density="compact">
          <template v-slot:item.name="{ item }">
            {{ item.fullName }}
         </template>
         <template v-slot:item.items="{ item }">
            {{ item.items.length ? item.items.length : "" }}
         </template>
         <template v-slot:item.actions="{ item }">
            <EditButton @click="editArtist(item)"></EditButton>
            <DeleteButton @click="deleteArtist(item)" :disabled="disableDelete(item)"></DeleteButton>
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
   import { useArtistStore } from '@/stores/artistStore'
   import { useItemStore }   from '@/stores/itemStore'
   import AddArtist    from '@/components/artist/AddArtist.vue'
   import EditArtist   from '@/components/artist/EditArtist.vue'
   import DeleteArtist from '@/components/artist/DeleteArtist.vue'
   import EditButton   from '@/components/util/EditButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   
   const artistStore = useArtistStore()
   const itemStore   = useItemStore()
   const showAddDialog    = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   const selectedArtist = ref({})
   
   const headers = [
      { title: 'Artist',     key: 'name',        value: 'name' },
      { title: 'AKA for',    key: 'akaFullName', value: 'akaFullName'},
      { title: 'Items',      key: 'items',         align: 'center' },
      { title: '',           key: "actions",       sortable: false },
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

   // admin can delete an artist if the artist isn't referenced by any items
   const disableDelete = (artist) => { return artist.items.length ? true : false }

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
