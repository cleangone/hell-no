<template>
   <div class="text-left">
      <HorizontalDiv class="text-h5 align-center">
         Artists 
         <TextButton @click="showAddDialog=true" text="Add Artist"/>
         <span class="flex-grow-1 flex-shrink-0"></span>
         <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search"
            flat hide-details variant="solo-filled" density="compact"
            class="flex-grow-1 flex-shrink-0 search-width"/>
      </HorizontalDiv>

      <v-data-table :headers="headers" :items="artists" :search="search" items-per-page="100" density="compact">
          <template v-slot:item.name="{ item }">
            {{ item.fullName }}
         </template>
         <template v-slot:item.items="{ item }">
            {{ item.items.length ? item.items.length : "" }}
         </template>
         <template v-slot:item.actions="{ item }">
            <EditButton @click="editArtist(item)" class="admin-link"></EditButton>
            <DeleteButton @click="deleteArtist(item)" :disabled="disableDelete(item)" class="admin-link"/>
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
   import AddArtist     from '@/components/artist/AddArtist.vue'
   import EditArtist    from '@/components/artist/EditArtist.vue'
   import DeleteArtist  from '@/components/artist/DeleteArtist.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import TextButton    from '@/components/util/TextButton.vue'
   import HorizontalDiv from '@/components/util/HorizontalDiv.vue'
   
   const artistStore = useArtistStore()
   const itemStore   = useItemStore()
   const showAddDialog    = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   const selectedArtist = ref({})
   const search = ref("")
   
   const headers = [
      { title: 'Artist',     key: 'name',        value: 'name' },
      { title: 'Short Name',                     value: 'shortName', sortable: false },
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
