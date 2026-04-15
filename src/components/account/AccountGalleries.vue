<template>
   <div v-if="showGalleries" class="text-left">
      <div class="text-h5">
         Galleries
         <TextButton @click="showAddGalleryDialog=true" text="Add Gallery"/>
      </div>
      <div>
         <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search"
            flat hide-details variant="solo-filled" density="compact" class="search-box"/>
      </div>
      <v-data-table :headers="galleryHeaders" :items="userGalleries" :search="search" items-per-page="25" density="compact">
         <template v-slot:item.name="{ item }">
            <span v-if="item.generation==0">
               <span v-if="item.childGalleryIds.length">
                  <IconButton v-if="expandedGalleryIds.includes(item.id)" icon="mdi-chevron-down" @click="contractGallery(item.id)" size="med"/>
                  <IconButton v-else icon="mdi-chevron-right" @click="expandGallery(item.id)" size="med"/>
               </span>
               <span v-else> &nbsp; &nbsp;&nbsp; </span>
            </span>
            <span v-else v-html="indent(item.generation)"></span>

            <a @click="showGalleryItems(item)">{{ item.name }}</a>
            <span v-if="item.childGalleryIds.length"> ({{ item.childGalleryIds.length }})</span>
         </template>
         <template v-slot:item.images="{ item }">
            <span v-if="firstThumb(item.images)" style="min-width:90px" class="d-flex  align-center">
            <!-- <span v-if="item.images.length" style="min-width:90px" class="d-flex  align-center"> -->
               <img :src="firstThumb(item.images).thumbUrl" @click="editImages(item)" height="40" class="pointer"/>
               <!-- <img :src="item.images[0].thumbUrl" @click="editImages(item)" height="40" class="pointer"/> -->
               <span v-if="item.images.length>1" class="ml-1">({{ item.images.length }})</span>
            </span>
            <IconButton v-else icon="mdi-image" @click="editImages(item)" class="justify-self-center align-self-center"></IconButton>
         </template>
         <template v-slot:item.dateModified="{ item }">
            {{ item.dateModified ? item.dateModified.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.dateContentModified="{ item }">
            {{ item.dateContentModified ? item.dateContentModified.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.actions="{ item }">
            <EditButton   @click="editGallery(item)"/>
            <DeleteButton @click="deleteGallery(item)"/>
         </template>
      </v-data-table>
   </div>
   <div v-else class="text-left">
      <AccountGalleryItems :galleryId="selectedGallery.id" @done="showGalleries=true"/>
   </div>

   <v-dialog v-model="showAddGalleryDialog" width="auto">
      <AddGallery :userId="userStore.userId" @done="showAddGalleryDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditGalleryDialog" width="auto">
      <EditGallery :gallery="selectedGallery" @done="showEditGalleryDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditImagesDialog" width="auto">
      <EditGalleryImages :galleryId="selectedGallery.id" @done="showEditImagesDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteGalleryDialog" width="auto">
      <DeleteGallery :gallery="selectedGallery" @done="showDeleteGalleryDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import AccountGalleryItems from '@/components/account/AccountGalleryItems.vue'
   import AddGallery          from '@/components/gallery/AddGallery.vue'
   import EditGallery         from '@/components/gallery/EditGallery.vue'
   import EditGalleryImages   from '@/components/gallery/EditGalleryImages.vue'
   import DeleteGallery       from '@/components/gallery/DeleteGallery.vue'
   import EditButton   from '@/components/util/EditButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import IconButton   from '@/components/util/IconButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import { ImageType } from '@/utils/constants'
   import { removeArrayEntry } from '@/utils/utils'
   
   const userStore = useUserStore()
   const galleryStore = useGalleryStore()
   const showAddGalleryDialog = ref(false)
   const showEditGalleryDialog = ref(false)
   const showEditImagesDialog = ref(false)
   const showDeleteGalleryDialog = ref(false)
   const showGalleries = ref(true)
   const selectedGallery = ref({})
   const search = ref("")
   const expandedGalleryIds = ref([])
   
   const galleryHeaders = [
      { title: 'Name',            value: 'name', sortable: true },
      { title: 'Tag',             value: 'tag',  sortable: true },
      { title: 'Items',           value: 'itemsDesc',           align: 'center'  },
      { title: 'Images',     key: 'images'  },
      { title: 'Content Modified',value: 'dateContentModified', align: 'center' },
      { title: 'Modified',        value: 'dateModified',        align: 'center' },
      { title: 'Visibility',      value: 'state',               align: 'center' },
      { title: '',           key: "actions" },
   ]

   const displayGalleries = computed(() => { 
      const galleries = []
      for (const gallery of galleryStore.myGalleries) {
         galleries.push({ ...gallery, 
            itemsDesc: gallery.itemIds && gallery.itemIds.length ? gallery.itemIds.length : "None" })
      }
      return galleries
   })

   const galleryIdToChildGalleries = computed(() => { 
      const idToChildGalleries = new Map()
      for (const gallery of displayGalleries.value) {
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

   const userGalleries = computed(() => { 
      const galleries = []
      for (const gallery of displayGalleries.value) {
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

   // ugly double loop, but only a couple images
   const isThumb = (image) => { return !image.imageType || image.imageType == ImageType.GALLERY } // backward compatible   
   const firstThumb = (images) => { 
      for (const image of images) {
         if (isThumb(image) && image.active) { return image }
      }
      for (const image of images) {
         if (isThumb(image)) { return image }
      }
      return null      
   }

   const editGallery   = (gallery) => { showGalleryDialog(gallery, showEditGalleryDialog) }
   const editImages    = (gallery) => { showGalleryDialog(gallery, showEditImagesDialog) }
   const deleteGallery = (gallery) => { showGalleryDialog(gallery, showDeleteGalleryDialog) }
   const showGalleryDialog = (gallery, showDialog) => {
      selectedGallery.value = gallery
      showDialog.value = true
   }

   const showGalleryItems = (gallery) => {
      selectedGallery.value = gallery
      showGalleries.value = false
   }

   const indent = (generation) => {
      let html = "&nbsp;&nbsp; &nbsp;"
      for (var i=0; i<generation; i++) { 
         html += " &nbsp; &nbsp;"
      }
      return html
   }

   const expandGallery   = (id) => { expandedGalleryIds.value.push(id) }
   const contractGallery = (id) => { removeArrayEntry(expandedGalleryIds.value, id) }
</script>

<style>
.search-box {
  width: 50%;
}
</style>
