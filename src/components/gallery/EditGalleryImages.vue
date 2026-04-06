<template>
   <v-card :title="'Edit Gallery Images - ' + gallery.name" class="gallery-image-edit-dialog">
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)"/>
      </template>
      <div class="text-left">
         <TextButton text="Add item images" @click="addItemImages()" class="ml-3"/>
      </div>
      <v-data-table :headers="headers" :items="galleryImages" item-key="id">
         <template v-slot:item.active="{ item }" >
            <div width="100%" class="d-flex justify-center align-center">
               <div><v-checkbox v-model="item.active" @change="updateImages"></v-checkbox></div>
            </div>
         </template>
         <template v-slot:item.imageType="{ item }">{{ imageType(item)}}</template> 
         <template v-slot:item.image="{ item }"><img :src="item.thumbUrl" height="100"/></template>
         <template v-slot:item.actions="{ item }">
            <IconButton v-if="gallery.parentGalleryId" icon="mdi-arrow-up-box" @click="elevateImage(item)" :disabled="parentHasImage(item)"/>
            <DeleteButton @click="deleteImage(item)"/>
         </template>
      </v-data-table>
   </v-card> 
</template>

<script setup>
   import { computed } from 'vue'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useItemStore }    from '@/stores/itemStore'
   import IconButton   from '@/components/util/IconButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import { Emit, GalleryImageTypes, ImageType } from '@/utils/constants'
   
   const props = defineProps({ galleryId: String })
   const emit = defineEmits([ Emit.DONE ])
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const itemStore    = useItemStore()
   
   const headers = [
      { title: 'Active', key: 'active',     align: 'center' },
      { title: 'Type',   key: 'imageType',  align: 'center', sortable: false },
      { title: '',       key: 'image',      align: 'center', sortable: false },
      { title: '',       key: 'actions' }
   ]

   // read from store so list is dynamically updated if image deleted
   const gallery       = computed(() => galleryStore.getMyGallery(props.galleryId))
   const galleryItems  = computed(() => itemStore.getGalleryItems(props.galleryId))
   const galleryImages = computed(() => {
      const images = []
      if (gallery.value && gallery.value.images) {
         for (const image of gallery.value.images) {
            images.push({ ...image })
         }
      }
      return images
   })

   const imageType = (itemImage) => { 
      // null imageType is from when only GALLERY images stored
      if (!itemImage.imageType || itemImage.imageType == ImageType.GALLERY ) { return "Thumbnail" } 
      return itemImage.imageType
   }

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

   const updateImages = () => { galleryStore.updateGallery({ id: props.galleryId, images: galleryImages.value }) }

   const deleteImage = (itemImage) => { galleryStore.removeImageId(props.galleryId, itemImage.id) }
</script>

<style>
.gallery-image-edit-dialog {
   min-width: 500px;  
   min-height: 600px;  
}
</style>