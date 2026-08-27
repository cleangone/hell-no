<template>
   <div v-if="userId" class="text-left">
      <div>
         <v-row>
            <v-col cols="5">
               <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search"
                  flat hide-details variant="solo-filled" density="compact" style="height: 100%"/>
            </v-col>
            <v-col>
               <v-select v-model="computedHeaders" :items="headerOptions" label="Columns" 
                  item-title="title" return-object multiple class="text-subtitle-2"/>
            </v-col>
         </v-row>
         <v-data-table v-if="props.userId" :headers="displayHeaders" :items="displayGalleries" 
            :custom-key-sort="customKeySort" :search="search" item-key="id" density="compact" items-per-page="25">
            <template v-slot:item.name="{ item }">
               <span v-if="item.generation==0">
                  <span v-if="item.childGalleryIds.length">
                     <IconButton v-if="expandedGalleryIds.includes(item.id)" icon="mdi-chevron-down" @click="contractGallery(item.id)" size="med"/>
                     <IconButton v-else icon="mdi-chevron-right" @click="expandGallery(item.id)" size="med"/>
                  </span>
                  <span v-else> &nbsp; &nbsp;&nbsp; </span>
               </span>
               <span v-else v-html="indent(item.generation)"></span>
               {{ item.name }}
               <span v-if="item.childGalleryIds.length"> ({{ item.childGalleryIds.length }})</span>
            </template>
            <template v-slot:item.images="{ item }">
               <span v-if="getThumb(item.images)" style="min-width:90px" class="d-flex align-center">
                  <img :src="getThumb(item.images).thumbUrl" height="40"/>
               </span>
            </template>
            <template v-slot:item.dateCreated="{ item }">{{ defaultDisplayDate(item.dateCreated) }}</template>
            <template v-slot:item.dateModified="{ item }">{{ dateTimeString(item.dateModified) }}</template>
            <template v-slot:item.dateContentModified="{ item }">
               {{ dateTimeString(item.dateContentModified) }}        
               <ToolTipHover text="Sync with Item/ChildGallery dateContentModified" v-slot="{ props }">
                  <IconButton v-bind="props" @click="syncContentModified(item)" icon="mdi-calendar-sync"/>
               </ToolTipHover>    
            </template>
         </v-data-table>
      </div>
   </div>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useItemStore }    from '@/stores/itemStore'
   import { useViewStore }    from '@/stores/viewStore'
   import ToolTipHover        from '@/components/util/ToolTipHover.vue'
   import IconButton          from '@/components/util/IconButton.vue'
   import { dateTimeString, defaultDisplayDate } from '@/utils/dateUtils'
   import { removeArrayEntry } from '@/utils/utils'
   import { ImageType } from '@/utils/constants'
   
   const props = defineProps({ userId: String })
   const galleryStore = useGalleryStore()
   const itemStore    = useItemStore()
   const viewStore    = useViewStore()
   const search = ref("")
   const expandedGalleryIds = ref([])  
   
   const Headers = {
      NAME:       {        title:'Name',        key:'name',          value: 'name' },
      IMAGES:     {        title:'Images',      key:'images',                             sortable:false },
      VISIBILITY: { col:3, title:'Visibility',  key:'state',         value: 'state',        align: 'center' },
      CONTENT_MOD:{ col:4, title:'Content Modified', key:'dateContentModified',value: 'dateContentModified', align: 'center' },
      MODIFIED:   { col:5, title:'Modified',    key:'dateModified',  value: 'dateModified', align: 'center' },
      CREATED:    { col:6, title:'Created',     key:'dateCreated',   value: 'dateCreated',  align: 'center' },
   }

   const customKeySort = {
      name:          (a, b) => { return a.localeCompare(b) }, 
      state:         (a, b) => { return a.localeCompare(b) }, 
      dateContentModified: (a, b) => { return b - a }, 
      dateModified:  (a, b) => { return b - a }, 
      dateCreated:   (a, b) => { return b - a },   
   } 

   const headerOptions = [  Headers.VISIBILITY, Headers.CONTENT_MOD, Headers.MODIFIED, Headers.CREATED ]
   const selectedHeaders = ref([ Headers.VISIBILITY, Headers.CONTENT_MOD, Headers.MODIFIED, Headers.CREATED ])
   
   onMounted(async() => {
      if (viewStore.adminGalleryHeaders) { selectedHeaders.value = [...viewStore.adminGalleryHeaders] }
   })
   
   const computedHeaders = computed({ 
      get() { return selectedHeaders.value },
      set(updatedHeaders) {
         const headers = [ ...updatedHeaders ]
         headers.sort(function(a, b) {return a.col - b.col})   
         viewStore.setAdminItemHeaders(headers)
         selectedHeaders.value = [ ...headers ]
      }
   })

   const displayHeaders = computed(() => { 
      const selected = [ ...selectedHeaders.value ]
      const headers = []
      headers.push(...[Headers.NAME, Headers.IMAGES])
      headers.push(...selected)
      return headers
   })

   const userGalleries = computed(() => { 
      if (props.userId) {
         const galleries = []
         if (galleryStore.userIdToGalleries.has(props.userId)) {
            for (const gallery of galleryStore.userIdToGalleries.get(props.userId)) {
               galleries.push(gallery)
            }
         }
         galleries.sort(function(a, b) { return  a.name.localeCompare(b.name) })
         return galleries
      }
      return []
   })

   // todo - expand/collapse copied from AccountGalleries - refactor to component/mgr
   const galleryIdToChildGalleries = computed(() => { 
      const idToChildGalleries = new Map()
      for (const gallery of userGalleries.value) {
         if (gallery.parentGalleryId) { 
            let childGalleries = idToChildGalleries.get(gallery.parentGalleryId)
            if (childGalleries == null) {
               childGalleries = []
               idToChildGalleries.set(gallery.parentGalleryId, childGalleries)
            }
            childGalleries.push(gallery) 
         }
      }
      return idToChildGalleries
   })

   const displayGalleries = computed(() => { 
      const galleries = []
      for (const gallery of userGalleries.value) {
         if (!gallery.parentGalleryId) {
            galleries.push({ ...gallery, generation: 0 }) 
            if (expandedGalleryIds.value.includes(gallery.id)) {
               galleries.push( ...addChildGalleries(gallery, 1) ) 
            }
         }
      }
      return galleries
   })

   const addChildGalleries = (gallery, generation) => { 
      const galleries = []
      if (galleryIdToChildGalleries.value.has(gallery.id)) {
         for (const childGallery of galleryIdToChildGalleries.value.get(gallery.id)) {
            galleries.push({ ...childGallery, generation: generation })
            galleries.push( ...addChildGalleries(childGallery, generation + 1) ) // recursive call
         }
      }
      return galleries
   }

   const getThumb = (images) => { 
      if (images?.length) {
         for (const image of images) {
            if (image.imageType == ImageType.GALLERY ) { return image }
         }
      }
      return null      
   }

   const expandGallery   = (id) => { expandedGalleryIds.value.push(id) }
   const contractGallery = (id) => { removeArrayEntry(expandedGalleryIds.value, id) }
   const indent = (generation) => {
      let html = "&nbsp;&nbsp; &nbsp;"
      for (var i=0; i<generation; i++) { 
         html += " &nbsp; &nbsp;"
      }
      return html
   }
   
   const syncContentModified = (gallery) => { 
      let dateContentModified = null
      
      for (const childGalleryId of gallery.childGalleryIds) {
         const childGallery = galleryStore.getGallery(childGalleryId)
         dateContentModified = mostRecentDate(dateContentModified, childGallery.dateContentModified)
      }
      for (const item of itemStore.getGalleryItems(gallery.id)) {
         dateContentModified = mostRecentDate(dateContentModified, item.dateContentModified)
      }

      if (dateContentModified) {
         if (dateContentModified.seconds == gallery.dateContentModified.seconds) {
            console.log(gallery.name + " dateContentModified unchanged")
         }
         else { 
            console.log(gallery.name + " dateContentModified updated", dateTimeString(dateContentModified))
            galleryStore.updateGallery({ id: gallery.id, dateContentModified:dateContentModified }) 
         }
      }
   }

   const mostRecentDate = (date1, date2) => { return !date1 || date2 && date2 > date1 ? date2 : date1 }
      
</script>

<style>
.select-min {
  min-width: 35%;
}
.main {
  display: flex;
  flex-wrap: wrap;
}
.card {
   display: inline-block;
}
</style>
