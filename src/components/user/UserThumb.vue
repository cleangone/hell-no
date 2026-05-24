<template>
   <v-card :width="cardWidth" ref="cardRef" class="d-flex flex-column text-center user-thumb-link pa-2" 
         :class="cardMargin" :style="backgroundStyle" style="z-index: 1">
      <HorizontalDiv>
         <RouterLink v-if="userImages.length" :to="mouseoverLink">
            <Avatar :image="userImages[0]" @mouseover="mouseover()" @mouseleave="mouseleave()"/>
         </RouterLink>
         <div class="ml-2 text-left">
            <RouterLink :to="userUrl">{{ username }} {{ itemCount ? "(" + itemCount + ")" : "" }}</RouterLink>
            <div>{{ recentDateModified }}</div>
         </div>
      </HorizontalDiv>
   </v-card>
   
   <ItemPopup v-if="popupImage" :popupImage="popupImage"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useWindowSize } from '@vueuse/core'
   import { useItemStore }  from '@/stores/itemStore'
   import { useItemMgr }    from '@/stores/itemMgr'
   import { useImageMgr }   from '@/stores/image/imageMgr'
   import { useViewStore }  from '@/stores/viewStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import ItemPopup      from '@/components/item/ItemPopup.vue'
   import Avatar         from '@/components/user/Avatar.vue'
   import HorizontalDiv  from '@/components/util/HorizontalDiv.vue'
   import { objAspectRatio, thumbBackgroundColorStyle } from '@/utils/utils'
   import { displayDate } from '@/utils/dateUtils'
   import { GalleryThumbOptions, GalleryThumbWidth, ItemOrigin, Route } from '@/utils/constants'

   const XsGalleryThumbWidth = 125
   const props = defineProps({ user: Object, dense:Boolean })
   
   const { width: windowWidth } = useWindowSize()
   const itemMgr   = useItemMgr()
   const itemStore = useItemStore()
   const imageMgr  = useImageMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const cardRef = ref(null)
   const popupImage = ref(null)
   const mouseleaveTime = ref(Date.now())
   
   const userUrl = computed(() =>  props.user ? Route.USER.url + props.user.id :  Route.HOME.url)
   const smallThumb = computed(() => viewMgr.isXs && viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SM_THUMB))
   const cardWidth = computed(() =>  {
      if (viewMgr.isXs) { 
         // .4 is 2 thumbs/row, .28 is 3 thumbs
         const galleryWidthPct = smallThumb.value ? .28 : .4
         return props.dense ? XsGalleryThumbWidth : windowWidth.value * galleryWidthPct
      } 
      return GalleryThumbWidth
   })
   
   const cardMargin = computed(() => smallThumb.value ? "mb-2" : "mb-5")
   const username   = computed(() => props.user ? props.user.username : "" ) 

   const userImages = computed(() => { 
      const images = []
      if (props.user?.images?.length) {
         for (const imageSet of props.user.images) {
            if (imageMgr.isActiveUserImage(imageSet)) { images.push(imageSet) }
         }
      }
      return images
   }) 

   // todo - this includes profile items
   const itemCount = computed(() => props.user ? itemStore.getUserPubicItems(props.user.id).length : 0)
   const backgroundStyle = computed(() => thumbBackgroundColorStyle(props.gallery))

   // itemMgr?
   const recentItems = computed(() => {
      const items = []
      if (props.user) {
         for (const item of itemMgr.getRecentPublicItems(props.user.id) ) {
            if (!item.profileId) { items.push(item) }
         }
      }
      return items
   })
   const recentItem  = computed(() => recentItems.value?.length ? recentItems.value[0] : null )
   const recentDateModified = computed(() => recentItem.value ? displayDate(recentItem.value.dateContentModified) : "" )
   
   const mouseoverItem = ref(null)
   const mouseoverLink = computed(() => mouseoverItem.value ? itemMgr.itemURL(mouseoverItem.value.id, ItemOrigin.EXTERNAL) : "")
   const mouseover = () => {
      if (viewMgr.isXs || !recentItems.value?.length) { return }
      
      const index = Math.floor(Math.random() * recentItems.value.length)
      mouseoverItem.value = recentItems.value[index]
      const mouseoverTime = Date.now()  
      setTimeout(() => {  
         if (mouseoverTime > mouseleaveTime.value ) { 
            const boundingRect = cardRef.value.$el.getBoundingClientRect()
            const aspectRatio = objAspectRatio(mouseoverItem.value.primaryImage.dimensions)
            popupImage.value = itemMgr.getPopupImage(
               mouseoverItem.value.name, null, mouseoverItem.value.primaryImage.largeThumbUrl, boundingRect, aspectRatio)
         }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      popupImage.value = null 
   }

</script>

<style>
</style>
