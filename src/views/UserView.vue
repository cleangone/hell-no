<template>
   <v-container v-if="viewMgr.isDeskTop" class="pa-0 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="2" class="flex-grow-0 flex-shrink-0"/>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div class="title">{{ username }} </div>
         </v-col>
         <v-col cols="2" class="mr-n2 d-flex flex-grow-0 flex-shrink-0 justify-end">
            <IconButton v-if="userExists" icon="mdi-email" @click="sendEmail()"/>
         </v-col>
      </v-row>
   </v-container>
   <div v-if="!contentExists">
      <div class="pt-10 pb=5 text-h5">No Content</div>
      <div>Add Items and Galleries in <RouterLink :to="Route.ACCOUNT.url">My Account</RouterLink></div>
   </div>
   <!-- wall -->
   <div v-if="wallItemsExist" class="walldiv" :style="wallDivStyle">
      <v-img :src="wallImage" cover :style="wallBackgroundStyle" class="wall-background"></v-img>
      <div class="wall-content">
         <SwipeWall :wall="displayWall" :rowHeight="slideRowHeight"/>
      </div> 
   </div>
   <!-- galleries -->
   <v-container v-if="thumbGalleries.length">
      <div class="my-5">
         <span class="font-weight-bold">Galleries</span> |
         <RouterLink :to="Route.GALLERIES.url + route.params.id">View all</RouterLink>   
      </div>
      <v-row justify="space-around" ref="galleryRef" class="mb-md-4" >
         <GalleryThumb v-for="gallery in thumbGalleries" :key="gallery.id" :gallery="gallery" bypassShowUser showChildImages dense />
      </v-row>
   </v-container>
   <!-- recent items -->
   <v-container v-if="recentItems.length" class="mt-4 pt-1 bg-shade">
      <div class="my-3">
         <span class="font-weight-bold">Recent Updates</span> |
         <RouterLink :to="Route.RECENT.url + route.params.id">View all</RouterLink>   
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
   import { useProfileStore } from '@/stores/profileStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import GalleryThumb from '@/components/gallery/GalleryThumb.vue'
   import ItemThumb    from '@/components/item/thumb/ItemThumb.vue'
   import SwipeWall    from '@/components/wall/SwipeWall.vue'
   import IconButton   from '@/components/util/IconButton.vue'
   import { ThumbRow } from '@/utils/utilClasses'
   import { randomizeArray } from '@/utils/utils'
   import { DefaultWall, GalleryThumbWidth, ItemOrigin, Route, WallRowHeight } from '@/utils/constants'
   
   const route  = useRoute()
   const router = useRouter()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const itemMgr      = useItemMgr()
   const wallStore    = useWallStore()
   const wallMgr      = useWallMgr()
   const profileStore = useProfileStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const galleryRef = ref(null)
   const recentRef  = ref(null)
   const { width: galleryWidth } = useElementSize(galleryRef)
   const { width: recentWidth }  = useElementSize(recentRef)

   useSeoMeta({
      title: "Hell-No User"
   })

   // id param can be a userId or a profileId
   const rawUser    = computed(() => userStore.getUser(route.params.id) )
   const rawProfile = computed(() => profileStore.getProfile(route.params.id)) 
   const user = computed(() => {
      if (rawUser.value) { return rawUser.value } 
      return rawProfile.value ? userStore.getUser(rawProfile.value.userId) : null 
   })

   const profileId = computed(() => rawProfile.value ? rawProfile.value.id : null )
   const userExists = computed(() => user.value ? true : false )
   const userId = computed(() => user.value ? user.value.id : null )
   const username = computed(() => {
      if (rawUser.value) { return rawUser.value.username }
      return rawProfile.value ? rawProfile.value.username : "User" 
   })

   const contentExists = computed(() => wallItemsExist.value || thumbGalleries.value.length || recentItems.value.length) 
   
   const visibleGalleries = computed(() => { 
      const galleries = []     
      for (const gallery of galleryStore.getPublicGalleries(user.value.id) ) {
         if (rawUser.value && !gallery.profileId || rawProfile.value && gallery.profileId == rawProfile.value.id) {
            if (gallery.images.length && !gallery.parentGalleryId && viewMgr.galleryIsVisibleToUser(gallery)) { galleries.push(gallery) }
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
      for (const item of itemMgr.getRecentPublicItems(userId.value)) {
         if (rawUser.value && !item.profileId || rawProfile.value && item.profileId == rawProfile.value.id) { visibleItems.push(item) }
      } 
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupItems(visibleItems) : visibleItems
      return viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates",  Route.RECENT.url + route.params.id, ungroupedItems)
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

   const displayWall = computed(() => {
      const wall = profileId.value ? { ...DefaultWall } : wallStore.getUserWall(userId.value) 
      if (profileId.value) { wall.wallRows = allRecentItems.value.length < 8 ? 1 : 2 }   
      return wallMgr.fillWall(wall, allRecentItems.value)
   })

   const wallBackgroundOpacity = ref(.15) // todo - configurable?
   const wallItemsExist = computed(() => displayWall.value?.wallItems.length ? true : false )
   const slideRowHeight = computed(() => viewMgr.isMobile ? WallRowHeight.XS : WallRowHeight.DEFAULT)
   const wallRows       = computed(() => displayWall.value ? displayWall.value.wallRows : 2 )
   const wallDivStyle   = computed(() => "height:" + (((slideRowHeight.value + 10) * wallRows.value)) + "px;")
   const wallBackgroundStyle = computed(() => wallDivStyle.value + " opacity:" + wallBackgroundOpacity.value + ";")

   const wallImage = computed(() => {
      const urls = itemMgr.getPublicGalleryThumbUrls(userId.value, profileId.value)
      return urls.length ? randomizeArray(urls)[0] : wallMgr.randomWallImage
   })

   const sendEmail = () => {
      viewStore.setEmailContext(user.value)
      router.push(Route.MESSAGE.url)
   }
</script>

<style>
</style>
