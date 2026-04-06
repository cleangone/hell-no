<template>
   <v-row class="mx-3 text-left align-start" dense style="max-height: 45px;">
      <v-col class="ps-3 py-0">
         <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search"
            flat hide-details variant="solo-filled" density="compact"/>
      </v-col>
      <v-col class="gallery-min text-subtitle-2 py-0">
         <v-select v-model="selectedGalleryId" label="Gallery" :items="galleryOptions" clearable density="compact"></v-select>
      </v-col>   
   </v-row>
   <v-data-table :headers="headers" :items="displayItems" item-key="id"
      :custom-key-sort="customKeySort" :search="search" density="compact" items-per-page="25" class="mx-6">
      <template v-slot:item.actions="{ item }">
         <IconButton icon="mdi-plus" @click="addItem(item)"/>
      </template>
      <template v-slot:item.images="{ item }">
         <span style="min-width:90px" class="d-flex justify-center align-center">
            <img v-if="item.primaryImage" :src="item.primaryImage.thumbUrl" @click="editImages(item)" height="40" class="pointer"/>
         </span>
      </template>
      <template v-slot:item.artist="{ item }">
         {{ item.primaryArtist.fullName }}
      </template>
   </v-data-table>      
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import IconButton from '@/components/util/IconButton.vue'
   import { Emit, ItemType } from '@/utils/constants'
   
   const props = defineProps({existingItemIds: Array}) 
   const emit  = defineEmits([Emit.ITEM])
   const itemStore    = useItemStore()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const selectedGalleryId = ref(null)
   const search = ref("")
   
   const headers = [
      {  title:'',          key:'actions' },
      {  title:'Name',      key:'name',   value: 'name' },
      {  title:'',          key:'images',   align:'center' },
      {  title:'Artist',    key:'artist', value: 'primaryArtist.sortName' },
      {  title:'Galleries',               value: 'galleries' },
   ]

   const customKeySort = {
      name:   (a, b) => { return a.localeCompare(b) }, 
      artist: (a, b) => { return a.localeCompare(b) }, 
   } 

   const galleryOptions = computed(() => galleryMgr.myGalleryOptions)
  
   const allItems = computed(() => { 
      const items = []
      for (const item of itemStore.myItems) {
         if (item.type == ItemType.SINGLE && !props.existingItemIds.includes(item.id)) {
            const displayItem = { ...item }

            // need to search and sort on same value
            displayItem.primaryArtist = item.primaryArtist ? 
               { ...item.primaryArtist,  sortName: item.primaryArtist.name + " " + item.primaryArtist.fullName} :
               { fullName: "", sortName: "" }
            
            const galleryNames = []
            if (item.galleryIds) { 
               for (const galleryId of item.galleryIds) { 
                  if (galleryStore.myGalleryIdToGalleryMap.has(galleryId)) { 
                     galleryNames.push(galleryStore.myGalleryIdToGalleryMap.get(galleryId).name)  
                  }
               }
            }
            displayItem.galleries = galleryNames.join(', ')
            items.push(displayItem)
         }
      }
      items.sort(function(a, b) {return a.name.localeCompare(b.name)})
      return items
   })

   const displayItems = computed(() => { 
      const items = []
      for (const item of allItems.value) {
         if (!selectedGalleryId.value || item.galleryIds.includes(selectedGalleryId.value)) { 
            items.push(item) 
         }
      }
      return items
   })

   const addItem = (item) => { emit(Emit.ITEM, item) }
</script>

<style>
</style>
