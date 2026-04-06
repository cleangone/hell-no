<template>
   <div v-if="userId" class="text-left">
      <div>
         <TextButton @click="showAddDialog=true" text="Add Gallery"/>
      </div>
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
               <span v-if="item.images.length" style="min-width:90px" class="d-flex align-center">
                  <img :src="item.images[0].thumbUrl" height="40"/>
               </span>
            </template>
            <template v-slot:item.dateCreated="{ item }">{{ defaultDisplayDate(item.dateCreated) }}</template>
            <template v-slot:item.dateModified="{ item }">{{ defaultDisplayDate(item.dateModified) }}</template>
            <template v-slot:item.dateContentModified="{ item }">
               {{ defaultDisplayDate(item.dateContentModified) }} 
               <EditButton @click="editContentModified(item)"/>
            </template>
            <template v-slot:item.actions="{ item }">
               <EditButton @click="editGallery(item)"/>
               <DeleteButton @click="deleteGallery(item)"/>
            </template>
         </v-data-table>
      </div>
   </div>
   
   <v-dialog v-model="showAddDialog" width="auto">
      <AddGallery :userId="userId" @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto" height="auto">
      <EditGallery :gallery="selectedGallery" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditContentModifiedDialog" width="auto" height="auto">
      <EditGalleryContentModified :gallery="selectedGallery" @done="showEditContentModifiedDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteGallery :gallery="selectedGallery" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useViewStore }    from '@/stores/viewStore'
   import EditGalleryContentModified from '@/components/admin/EditGalleryContentModified.vue'
   import AddGallery    from '@/components/gallery/AddGallery.vue'
   import EditGallery   from '@/components/gallery/EditGallery.vue'
   import DeleteGallery from '@/components/gallery/DeleteGallery.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import IconButton    from '@/components/util/IconButton.vue'
   import TextButton    from '@/components/util/TextButton.vue'
   import { defaultDisplayDate } from '@/utils/dateUtils'
   import { removeArrayEntry } from '@/utils/utils'
   
   const props = defineProps({ userId: String })
   const galleryStore = useGalleryStore()
   const viewStore    = useViewStore()
   const selectedGallery = ref({})
   const search = ref("")
   const expandedGalleryIds = ref([])
   const showAddDialog    = ref(false)   
   const showEditDialog   = ref(false)   
   const showEditContentModifiedDialog = ref(false)   
   const showDeleteDialog = ref(false)   
   
   const Headers = {
      NAME:       {        title:'Name',        key:'name',          value: 'name' },
      IMAGES:     {        title:'Images',      key:'images' },
      CONTENT_MOD:{ col:3, title:'Content Modified', key:'dateContentModified',value: 'dateContentModified', align: 'center' },
      VISIBILITY: { col:4, title:'Visibility',  key:'state',         value: 'state',        align: 'center' },
      CREATED:    { col:5, title:'Created',     key:'dateCreated',   value: 'dateCreated',  align: 'center' },
      MODIFIED:   { col:6, title:'Modified',    key:'dateModified',  value: 'dateModified', align: 'center' },
      ACTIONS:    {        title:'',            key:'actions' },
   }

   const customKeySort = {
      hits:          (a, b) => { return b - a }, 
      name:          (a, b) => { return a.localeCompare(b) }, 
      artist:        (a, b) => { return a.localeCompare(b) }, 
      dateCreated:   (a, b) => { return b - a }, 
      dateModified:  (a, b) => { return b - a }, 
      dateContentModified: (a, b) => { return b - a }, 
      yearCreated:   (a, b) => { return safeCompare(a, b) }, 
      state:         (a, b) => { return a.localeCompare(b) }, 
   } 

   const safeCompare = (a, b) => { 
      if (a && b) { return a.localeCompare(b) }
      else if (a) { return 1 }
      return -1
    }

   const headerOptions = [ Headers.CONTENT_MOD, Headers.VISIBILITY, Headers.CREATED, Headers.MODIFIED ]
   const selectedHeaders = ref([ Headers.CONTENT_MOD, Headers.VISIBILITY, Headers.MODIFIED ])
   
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
      headers.push(Headers.ACTIONS) 
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

   const expandGallery   = (id) => { expandedGalleryIds.value.push(id) }
   const contractGallery = (id) => { removeArrayEntry(expandedGalleryIds.value, id) }
   const indent = (generation) => {
      let html = "&nbsp;&nbsp; &nbsp;"
      for (var i=0; i<generation; i++) { 
         html += " &nbsp; &nbsp;"
      }
      return html
   }
   
   const editGallery         = (gallery) => { showDialog(gallery, showEditDialog) }
   const editContentModified = (gallery) => { showDialog(gallery, showEditContentModifiedDialog) }
   const deleteGallery       = (gallery) => { showDialog(gallery, showDeleteDialog) }
   const showDialog = (gallery, showDialog) => {
      selectedGallery.value = gallery
      showDialog.value = true
   }
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
