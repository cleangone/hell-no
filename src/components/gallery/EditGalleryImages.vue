<template>
   <div class="text-left">
      <TextButton text="Add item images" @click="addItemImages()" class="ml-3"/>
      <TextButton v-if="viewTable" @click="viewTable=false" text="Sort Thumbnails"/>
      <TextButton v-else           @click="viewTable=true"  text="View All"/>
   </div>
   <v-data-table v-if="viewTable" :headers="headers" :items="displayImages" item-key="id">
      <template v-slot:item.active="{ item }" >
         <div width="100%" class="d-flex justify-center align-center">
            <div><v-checkbox v-model="item.active" @change="updateActive(item)"></v-checkbox></div>
         </div>
      </template>
      <template v-slot:header.actions="{ }">
         <div class="d-flex justify-center align-center">
            <ToolTip><Icon icon="mdi-arrow-up-box" class="mr-2"/>Elevate image to parent</ToolTip>
         </div>
      </template>
      <template v-slot:item.image="{ item }"><img :src="item.thumbUrl" height="100"/></template>
      <template v-slot:item.actions="{ item }">
         <IconButton v-if="gallery.parentGalleryId" icon="mdi-arrow-up-box" @click="elevateImage(item)" :disabled="parentHasImage(item)"/>
         <DeleteButton @click="deleteImage(item)"/>
      </template>
   </v-data-table>
   <div v-else class="ma-4">
      <draggable v-model="displayThumbImages" item-key="id" class=" main">
         <template #item="{element}">
            <v-card :width="250" class="ma-4 card">
               <v-card-text class="text-center my-0 py-0">
                  <v-icon icon="mdi-drag" color="blue-darken-2" class="justify-center"></v-icon>
               </v-card-text>
               <v-img :src="element.thumbUrl"></v-img>
            </v-card>
         </template>
      </draggable>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import draggable from 'vuedraggable'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useItemStore }    from '@/stores/itemStore'
   import Icon         from '@/components/util/Icon.vue'
   import IconButton   from '@/components/util/IconButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import ToolTip      from '@/components/util/ToolTip.vue'
   import { Emit, GalleryImageTypes, ImageType } from '@/utils/constants'
   
   const props = defineProps({ galleryId: String })
   const DisplayThumbType = {
      PRIMARY: 'Primary Thumb',
      THUMB: 'Thumbnail',
   }
   
   const emit = defineEmits([ Emit.DONE ])
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const itemStore    = useItemStore()
   const viewTable = ref(true)
   
   const headers = [
      { title: 'Active', key: 'active',     align: 'center', sortable: false },
      { title: 'Type',   key: 'imageType',  align: 'center', sortable: false },
      { title: '',       key: 'image',      align: 'center', sortable: false },
      { title: '',       key: 'actions',    align: 'center', sortable: false }
   ]

   // read from store so list is dynamically updated if image deleted
   const gallery       = computed(() => galleryStore.getMyGallery(props.galleryId))
   const galleryItems  = computed(() => itemStore.getGalleryItems(props.galleryId))
   const galleryImages = computed(() => gallery.value.images)
   const galleryImageIdToImages = computed(() => { return galleryImages.value ? new Map(galleryImages.value.map((obj) => [obj.id, obj])) : new Map() })
  
   const displayImages = computed(() => {      
      const images = []
      let firstThumb = true
      if (gallery.value && galleryImages.value) {
         for (const image of gallery.value.images) {
            const displayImage = { ...image }
            // null imageType is from when only GALLERY images stored
            if (!displayImage.imageType) { displayImage.imageType = ImageType.GALLERY }
            if (firstThumb && displayImage.active && displayImage.imageType == ImageType.GALLERY) { 
               firstThumb = false
               displayImage.imageType = DisplayThumbType.PRIMARY
            } 

            if (displayImage.imageType == ImageType.GALLERY ) { displayImage.imageType = DisplayThumbType.THUMB } 
            images.push(displayImage)
         }
         images.sort(function(a, b) { return  a.imageType.localeCompare(b.imageType) })
      }
      return images
   })

   const parentGallery = computed(() => gallery.value?.parentGalleryId ? galleryStore.getMyGallery(gallery.value.parentGalleryId) : null)
   const parentGalleryImageIds = computed(() => parentGallery.value ? parentGallery.value.images.map(image => image.id) : [])
   const parentHasImage = (image) => { return parentGalleryImageIds.value && parentGalleryImageIds.value.includes(image.id) }
   const elevateImage   = (image) => { 
      const parentImage = { ...image }
      parentImage.active = false
      galleryStore.addImage(parentGallery.value.id, parentImage) 
   }    

   const addItemImages = () => { 
      const imageIds = galleryImages.value.map(image => image.id)
      for (const item of galleryItems.value) {
         for (const image of item.otherImages) {
            if (GalleryImageTypes.includes(image.imageType) && !imageIds.includes(image.id))  {
               const galleryImage = galleryMgr.galleryImage(item, image, false)
               console.log("galleryStore.addImage", galleryImage)
               galleryStore.addImage(props.galleryId, galleryImage)
               imageIds.push(galleryImage.id)
            }
         }
      }
   }

   const updateActive = (itemImage) => { 
      const updatedImages = []
      for (const image of galleryImages.value) {
         if (image.id == itemImage.id) {
            const updatedImage = { ...image }
            updatedImage.active = !updatedImage.active
            updatedImages.push(updatedImage)
         }
         else { updatedImages.push(image)}
      }
      galleryStore.updateGallery({ id: props.galleryId, images: updatedImages }) 
   }
   
   const deleteImage = (itemImage) => { galleryStore.removeImageId(props.galleryId, itemImage.id) }

   const displayThumbImages = computed({ 
      get() {
         const displayThumbs = []
         for (const image of displayImages.value) {
            if (image.imageType == DisplayThumbType.PRIMARY || image.imageType == DisplayThumbType.THUMB) { displayThumbs.push(image) }
         }
         return displayThumbs
      },
      set(updatedThumbImages) {
         const updatedImages = []
         const updatedIds = []
         for (const image of updatedThumbImages) {
            const galleryImage = galleryImageIdToImages.value.get(image.id)
            updatedImages.push(galleryImage)
            updatedIds.push(galleryImage.id)
         }

         for (const image of galleryImages.value) {
            if (!updatedIds.includes(image.id)) { updatedImages.push(image) }
         }

         // console.log("updatedImages", updatedImages)
         galleryStore.updateGallery({ id: props.galleryId, images: updatedImages }) 
      }
   })
</script>

<style>
.gallery-image-edit-dialog {
   min-width: 500px;  
   min-height: 600px;  
}
</style>