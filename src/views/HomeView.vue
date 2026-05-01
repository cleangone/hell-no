<template>
   <!-- title if not mobile - mobile title in app -->
   <v-container v-if="!viewMgr.isMobile" class="pa-0 mt-2 mb-1 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="1" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <span class="title">Hell-No Gallery</span>
         </v-col>
         <v-col cols="1" class="flex-grow-0 flex-shrink-0 d-flex justify-end">
            <DarkButton class="mr-n2"/>
         </v-col>
      </v-row>
   </v-container>
   <!-- greeting, notifications, wall -->
   <v-container class="pa-0 mb-2 width-100">   
      <ShowNotifications v-if="notifications.length" :notifications="notifications" class="mb-3"/>
      <div class="walldiv" :style="wallDivStyle">
         <v-img :src="wallImage" cover :style="wallBackgroundStyle" class="wall-background"></v-img>
         <div class="wall-content">
            <SwipeWall v-if="showWall" :wall="displayWall" :rowHeight="slideRowHeight" transparent/>
         </div> 
      </div>
   </v-container>
   
   <!-- galleries, favorites -->
   <div v-if="recentGalleries.length || favoriteItems?.length" class="my-3">
      <v-row>
         <v-col v-if="recentGalleries.length">
            <div class="my-5">
               <span class="font-weight-bold">Galleries</span> |
               <RouterLink :to="Route.GALLERIES.url + Defaults.SITE_ID">View all</RouterLink>
            </div>
            <v-row justify="space-around" ref="galleryRef" class="mb-md-4" >
               <GalleryThumb v-for="gallery in thumbGalleries" :key="gallery.id" :gallery="gallery" showChildImages dense />
            </v-row>
         </v-col>
         <v-col v-if="favoriteItems?.length" class="box-border box-border-color ma-4 px-3">
            <div class="font-weight-bold">
               Favorites | <RouterLink :to="Route.FAVORITES.url">View all</RouterLink>
            </div>
            <v-row justify="space-around" ref="favoritesRef" class="mt-4">
               <ItemThumb v-for="item in favoriteItems" :key="item.id" :item="item" :origin="ItemOrigin.FAVORITES" tight/>
            </v-row>
         </v-col>
      </v-row>
   </div>

   <!-- updates -->
   <v-container class="mt-5 pt-3 bg-shade">
      <div class="mb-3">
         <span class="font-weight-bold">Recent Updates</span> |
         <RouterLink :to="Route.RECENT.url + Defaults.SITE_ID">View all</RouterLink>
      </div>
      <v-container>
         <v-row justify="space-around" ref="recentRef" class="mb-md-4">
            <ItemThumb v-for="item in recentItems" :key="item.id" :item="item" :origin="ItemOrigin.RECENT" tight/>
         </v-row>
      </v-container>
   </v-container>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useElementSize } from '@vueuse/core'
   import { useSeoMeta } from '@unhead/vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useInviteStore }  from '@/stores/inviteStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useWallMgr }      from '@/stores/wallMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { useLocalStore }   from '@/stores/localStore'
   import ItemThumb    from '@/components/item/thumb/ItemThumb.vue'
   import GalleryThumb from '@/components/gallery/GalleryThumb.vue'
   import SwipeWall    from '@/components/wall/SwipeWall.vue'
   import DarkButton   from '@/components/util/DarkButton.vue'
   import ShowNotifications from '@/components/notification/ShowNotifications.vue'
   import { timestampsEqual } from '@/utils/dateUtils'
   import { ThumbRow } from '@/utils/utilClasses'
   import { Defaults, GalleryThumbWidth, ItemOrigin, TodoType, Route, WallRowHeight } from '@/utils/constants'
   
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const inviteStore  = useInviteStore()
   const itemMgr      = useItemMgr()
   const wallMgr      = useWallMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const localStore   = useLocalStore()
   const galleryRef   = ref(null)
   const favoritesRef = ref(null)
   const recentRef    = ref(null)
   const { width: galleryWidth   } = useElementSize(galleryRef)
   const { width: favoritesWidth } = useElementSize(favoritesRef)
   const { width: recentWidth    }  = useElementSize(recentRef)
   const images = [ "/images/speakeasy.jpg", "/images/hell-no-sofia.jpg", "/images/hell-no-solo.jpg" ]
   const currSiteWall = ref(null)
   const wallBackgroundOpacity = ref(.1) 
   const isBrowserDarkMode = ref(false)
   
   onMounted(() => {
      // console.log("Home")
      viewMgr.init()
      if (!viewStore.showSiteWall) {
         wallBackgroundOpacity.value = 1.0
         setTimeout(() => { 
            viewStore.setShowSiteWall(true) 
            fadeWallBackground()
         }, 1000)  
      }

      // not working
      isBrowserDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
   })

   useSeoMeta({
      title: "Hell-No Gallery" // displayed in browser tabs
   })
   
   // const seconds = () => { return " (" + viewStore.getSeconds() + " seconds)" }
   const showWall = computed(() => viewStore.showSiteWall)
   const fadeWallBackground = () => {
      if (wallBackgroundOpacity.value > .10) { 
         wallBackgroundOpacity.value -= .04
         setTimeout(() => { fadeWallBackground() }, 50)  
      }
   }

   const notifications = computed(() => {
      // console.log("notifications", inviteStore.myActiveInvites)
      const todos = []
      for (const invite of inviteStore.myActiveInvites) {
         todos.push({ type: TodoType.INVITE, invite: invite })
      }  
      // console.log("notifications", todos)
      return todos
   })

   const wallImage = computed(() => { return images[Math.floor(Math.random() * images.length)] })
   const displayWall = computed(() => {
      // console.log("displayWall")
      let wall = wallMgr.filledSiteWall
      if (wall.wallRows) { localStore.setSiteWall(wall) }
      else if (localStore.siteWall.wallRows) { wall = { ...localStore.siteWall } }

      // use currWall if it exists - prevent flashing of retrieved after display of one from local store
      if (currSiteWall.value) { 
         // console.log("currSiteWall")
         return currSiteWall.value }
      if (wall.wallRows) { currSiteWall.value = wall }
      return wall
   })
   
   const slideRowHeight = computed(() => viewMgr.isMobile ? WallRowHeight.XS : WallRowHeight.DEFAULT)
   const slideRowMargin = computed(() => viewMgr.isMobile ? 30 : 10 )
   const wallRows       = computed(() => displayWall.value ? displayWall.value.wallRows : 2 )
   const wallDivStyle   = computed(() => "height:" + (((slideRowHeight.value + slideRowMargin.value) * wallRows.value)) + "px;")
   const wallBackgroundStyle = computed(() => wallDivStyle.value + " opacity:" + wallBackgroundOpacity.value + ";")

   const recentGalleries = computed(() => { 
      const galleries = []     
      const publicGalleries = galleryStore.publicGalleries
      for (const gallery of publicGalleries) {
         if (gallery.images.length && showGallery(gallery) ) { galleries.push(gallery) }
      }    
      galleries.sort(function(a, b) { return b.dateContentModified - a.dateContentModified }) 
      return galleries
   })
   const showGallery = (gallery)  => {
      if (!gallery.childGalleryIds.length) { return true } // not a parent
      for (const childGallery of galleryStore.publicGalleryIdToChildGalleries.get(gallery.id)) {
         if (timestampsEqual(gallery.dateContentModified, childGallery.dateContentModified)) {
            return false // parent has same dateContentModified as a child
         }
      } 
      return true // gallery a parent with dateContentModified different than all children
   }

   const thumbGalleries = computed(() => {   
      // console.log("galleryWidth " + galleryWidth.value)
      const thumbRow = new ThumbRow(2, galleryWidth.value ? galleryWidth.value : 400 ) // maxRows, maxWidth
      for (const gallery of recentGalleries.value) {
         if (!thumbRow.addThumb(gallery, GalleryThumbWidth)) { break }  
      } 
      return thumbRow.thumbs
   })
   
   const allRecentItems = computed(() => {
      let items = [ ...itemMgr.recentPublicItems ]
      if (items.length) { 
         items.sort(function(a, b){return b.dateContentModified - a.dateContentModified}) 
         localStore.setRecentItems(items) 
      }
      else if (localStore.recentItems.length)  { 
         // console.log("Replacing default recentItems with stored ones")
         items = [ ...localStore.recentItems ]
      }

      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates", 
         Route.RECENT.url + (userStore.userExists ? userStore.userId : Defaults.SITE_ID), ungroupedItems)
      return ungroupedItems
   })

   const allFavoriteItems = computed(() => {
      const visibleItems = []
      if (userStore.userExists && userStore.user.favoriteItems) {
         const favoriteItemIds = userStore.user.favoriteItems
         const items = itemMgr.getItems(favoriteItemIds)
         const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
         for (const item of ungroupedItems) { 
            if (viewMgr.itemIsVisibleToUser(item)) { visibleItems.push(item) }
         }
      }
      return viewStore.setVisibleItems(ItemOrigin.FAVORITES, "My Favorites", Route.FAVORITES.url, visibleItems)
   })

   const recentItems   = computed(() => getThumbItems(allRecentItems.value,   2, recentWidth.value, 500))
   const favoriteItems = computed(() => getThumbItems(allFavoriteItems.value, 1, favoritesWidth.value, 400))
   function getThumbItems(items, rows, elementWidth, defaultWidth) {
      const thumbRow = new ThumbRow(rows, elementWidth ? elementWidth : defaultWidth )  
      for (const item of items) {
         const aspectRatio = itemMgr.itemAspectRatio(item)  // w/h
         const newThumbWidth = Math.round(200 * aspectRatio) + 5
         if (!thumbRow.addThumb(item, newThumbWidth))  { break }  
      } 
      return thumbRow.thumbs
   }
</script>

<style>
.box-border {
   border: 5px solid; 
}
.wall-background {
   position: absolute;
   left: 0;
   top: 0;
   width: 100%;
   height: 600px;
   z-index: 1;
}
.wall-content {
   position: absolute;
   left: 0;
   top: 0;
   width: 100%;
   z-index: 2;
}
</style>
