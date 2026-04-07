<template>
   <v-card :width="cardWidth" ref="cardRef" class="mb-5 d-flex flex-column text-center" :style="nameStyle" style="z-index: 1">
      <RouterLink :to="URL.GALLERY + gallery.id">
         <v-carousel v-if="galleryImages.length>1" cycle :interval="carouselInterval" :height="carouselHeight"
            :direction="carouselDirection" hide-delimiters :show-arrows="false" v-on:update:modelValue="setGalleryImageIndex">
            <v-carousel-item v-for="image in galleryImages" :key="image.id">
               <v-img :src="image.thumbUrl" @mouseover="mouseover()" @mouseleave="mouseleave()" class="pointer"></v-img>
            </v-carousel-item>
         </v-carousel>
         <v-img v-else :src="galleryImage.thumbUrl" @mouseover="mouseover()" @mouseleave="mouseleave()"></v-img>
      </RouterLink>
      <div :class="dense ? 'my-1' : 'my-3'">
         <div class="text-body-2">
            <span class="font-weight-bold">{{ gallery.name }}</span>
            <span v-if="visibleItemCount" class="ml-1">({{ visibleItemCount }})</span>
         </div>
         <div v-if="showDateModified" class="text-body-2">
            {{ displayDate(gallery.dateContentModified) }}
         </div>
      </div>
      <div v-if="editInPlace" class="mt-auto text-right">
         <EditButton @click="showEditDialog=true" ></EditButton>
      </div>
   </v-card>
   
   <ItemPopup v-if="popup" :popupImage="popup"/>

   <v-dialog v-model="showEditDialog" width="auto">
      <EditGallery :gallery="gallery" @done="showEditDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, onErrorCaptured, ref } from 'vue'
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { useWindowSize } from '@vueuse/core'
   import ItemPopup   from '@/components/item/ItemPopup.vue'
   import EditGallery from '@/components/gallery/EditGallery.vue'
   import EditButton  from '@/components/util/EditButton.vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { useLogStore }     from '@/stores/logStore'
   import { displayDate } from '@/utils/dateUtils'
   import { backgroundColorStyle, handleError, objAspectRatio } from '@/utils/utils'
   import { GalleryThumbWidth, ImageType, ItemOrigin, ThumbField, URL } from '@/utils/constants'
   
   const XsGalleryThumbWidth = 125
   const props = defineProps({ gallery: Object, showChildImages:Boolean, dense:Boolean })
   
   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const { width: windowWidth } = useWindowSize()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const itemMgr      = useItemMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const logStore     = useLogStore()
   const cardRef = ref(null)
   const popup = ref(null)
   const showEditDialog = ref(false)
   const mouseleaveTime = ref(Date.now())
   const galleryImageIndex = ref(0)
   
   onErrorCaptured((err) => { return handleError(err, "GalleryThumb", logStore) })

   const cardWidth = computed(() =>  {
      if (xs.value) { return props.dense ? XsGalleryThumbWidth : windowWidth.value * .4 } // .4 adjusts width for 2 thumbs/row
      return GalleryThumbWidth
   })
   const carouselHeight = computed(() => cardWidth * 9 / 16)
   const carouselInterval = computed(() => 4000 + Math.floor(Math.random() * 4000)) // random bet 4-8 secs 
   const carouselDirection = computed(() => Math.random() < .8 ? "horizontal" : "vertical") // 80% horizontal

   const visibleItemCount = computed(() => viewMgr.galleryItemCount(props.gallery))
   const selectedFields   = computed(() => viewStore.visibleThumbFields.get(ItemOrigin.GALLERY))
   const showDateModified = computed(() => selectedFields.value.includes(ThumbField.DATE_UPDATED))
   
   // todo - this only goes down one level
   const childGalleryImages = computed(() => { 
      const images = []
      for (const childGalleryId of props.gallery.childGalleryIds) {
         const childGallery = galleryStore.getGallery(childGalleryId)
         if (childGallery.images.length && viewMgr.galleryIsVisibleToUser(childGallery)) { images.push(...childGallery.images) }
      }
      return images
   })

   const galleryImages = computed(() => { 
      const images = []
      const allImages = [ ...props.gallery.images ]
      if (props.showChildImages) { allImages.push(...childGalleryImages.value) }
      for (const image of allImages) {
         if (image.active && (!image.imageType || image.imageType == ImageType.GALLERY)) { images.push(image) }
      }
      if (!images.length) images.push(props.gallery.images[0]) 
      return images
   })

   const setGalleryImageIndex = (index) => { galleryImageIndex.value = index }
   const galleryImage = computed(() => { 
      // galleryImageIndex can be invalid if showChildImages toggle reduces number of images
      if (galleryImageIndex.value > galleryImages.value.length-1) { galleryImageIndex.value = 0 }
      return galleryImages.value[galleryImageIndex.value]
   })

   const editInPlace = computed(() => viewStore.editInPlace && (userStore.userId == props.gallery.userId) )
   const nameStyle = computed(() => { return editInPlace.value ? backgroundColorStyle(props.gallery.state) : "" })

   const mouseover = () => {
      if (xs.value) { return }
      
      const mouseoverTime = Date.now()  
      setTimeout(() => {  // debounce mouseover 
         if (mouseoverTime > mouseleaveTime.value ) { 
            const boundingRect = cardRef.value.$el.getBoundingClientRect()
            const aspectRatio = objAspectRatio(galleryImage.value.originalDimensions)
            popup.value = itemMgr.getPopupImage(
               galleryImage.value.name, null, galleryImage.value.originalLargeThumbUrl, boundingRect, aspectRatio)
         }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      popup.value = null 
   }

</script>

<style>
</style>
