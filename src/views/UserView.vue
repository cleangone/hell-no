<template>
   <div v-if="viewMgr.isDeskTop" class="title">
      {{ title }} <IconButton v-if="userExists" icon="mdi-email" @click="sendEmail()"/>
   </div>
   <div v-if="!contentExists">
      <div class="pt-10 pb=5 text-h5">No Content</div>
      <div>Add Items and Galleries in <RouterLink :to="URL.ACCOUNT">My Account</RouterLink></div>
   </div>
   <div v-if="wallItemsExist" class="walldiv" :style="wallDivStyle">
      <SwipeWall :wall="displayWall" :rowHeight="slideRowHeight" :linkUrl="URL.USER + route.params.id"/>
   </div>
   <v-container v-if="thumbGalleries.length">
      <div class="my-5">
         <span class="font-weight-bold">Galleries</span> |
         <RouterLink :to="URL.GALLERIES + route.params.id">View all</RouterLink>   
      </div>
      <v-row justify="space-around" ref="galleryRef" class="mb-md-4" >
         <GalleryThumb v-for="gallery in thumbGalleries" :key="gallery.id" :gallery="gallery" bypassShowUser showChildImages dense />
      </v-row>
   </v-container>
   <v-container v-if="recentItems.length" class="mt-4 pt-1 bg-shade">
      <div class="my-3">
         <span class="font-weight-bold">Recent Updates</span> |
         <RouterLink :to="URL.RECENT + route.params.id">View all</RouterLink>   
      </div>
      <v-container>
         <v-row justify="space-around" ref="recentRef" class="mb-md-4" >
            <ItemThumb v-for="item in recentItems" :key="item.id" :item="item" :origin="ItemOrigin.RECENT" bypassShowUser/>
         </v-row>
      </v-container> 
   </v-container>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useSeoMeta } from '@unhead/vue'
   import { useRoute, useRouter } from 'vue-router'
   import { useElementSize } from '@vueuse/core'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useWallStore }    from '@/stores/wallStore'
   import { useWallMgr }      from '@/stores/wallMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import GalleryThumb from '@/components/gallery/GalleryThumb.vue'
   import ItemThumb    from '@/components/item/thumb/ItemThumb.vue'
   import SwipeWall    from '@/components/wall/SwipeWall.vue'
   import IconButton   from '@/components/util/IconButton.vue'
   import { ThumbRow } from '@/utils/utilClasses'
   import { GalleryThumbWidth, ItemOrigin, URL, WallRowHeight } from '@/utils/constants'
   
   const route  = useRoute()
   const router = useRouter()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const itemMgr      = useItemMgr()
   const wallStore    = useWallStore()
   const wallMgr      = useWallMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const galleryRef = ref(null)
   const recentRef  = ref(null)
   const { width: galleryWidth } = useElementSize(galleryRef)
   const { width: recentWidth }  = useElementSize(recentRef)

   useSeoMeta({
      title: "Hell-No User"
   })

   const user          = computed(() => userStore.getUser(route.params.id) )
   const userExists    = computed(() => user.value ? true : false )
   const title         = computed(() => user.value ? user.value.username : "User" )
   const contentExists = computed(() => wallItemsExist.value || thumbGalleries.value.length || recentItems.value.length) 
   
   const visibleGalleries = computed(() => { 
      const galleries = []     
      for (const gallery of galleryStore.getPublicGalleries(user.value.id) ) {
         if (gallery.images.length && !gallery.parentGalleryId && viewMgr.galleryIsVisibleToUser(gallery)) { 
            galleries.push(gallery) 
         }
      }    

      galleries.sort(function(a, b){return b.dateModified - a.dateModified}) 
      return galleries
   })
   const thumbGalleries = computed(() => {    
      const thumbRow = new ThumbRow(2, galleryWidth.value ? galleryWidth.value : 400 ) // maxRows, maxWidth
      for (const gallery of visibleGalleries.value) {
         if (!thumbRow.addThumb(gallery, GalleryThumbWidth))  { break }  
      } 
      return thumbRow.thumbs
   })

   const allRecentItems = computed(() => {
      const visibleItems = []
      for (const item of itemMgr.getRecentItems(route.params.id)) {
         if (!item.profileId && viewMgr.itemIsVisibleToUser(item)) { visibleItems.push(item) }
      } 
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupItems(visibleItems) : visibleItems
      
      viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates", URL.USER + route.params.id, ungroupedItems)
      return ungroupedItems
   })

   const recentItems = computed(() => {
      const thumbRow = new ThumbRow(2, recentWidth.value ? recentWidth.value : 500 ) // maxRows, maxWidth  
      for (const item of allRecentItems.value) {
         const aspectRatio = itemMgr.itemAspectRatio(item)  // w/h
         const newThumbWidth = Math.round(200 * aspectRatio) + 5
         if (!thumbRow.addThumb(item, newThumbWidth))  { break }  
      } 
      return thumbRow.thumbs
   })

   const wall = computed(() => wallStore.getUserWall(route.params.id))
   const displayWall    = computed(() => wall.value?.addRecent ? wallMgr.fillWall(wall.value, itemMgr.getRecentPublicItems(route.params.id)) : wall.value)
   const wallItemsExist = computed(() => wall.value?.wallItems.length ? true : false )
   const slideRowHeight = computed(() => viewMgr.isMobile ? WallRowHeight.XS : WallRowHeight.DEFAULT)
   const slideRowMargin = computed(() => viewMgr.isMobile ? 30 : 15)
   const wallDivStyle   = computed(() => "height:" + ((slideRowHeight.value + slideRowMargin.value) * wall.wallRows) + "px;")

   const sendEmail = () => {
      viewStore.setEmailContext(user.value)
      router.push(URL.MESSAGE)
   }
</script>

<style>
</style>
