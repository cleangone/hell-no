<template>
   <!-- title if not mobile - mobile title in app -->
   <v-container v-if="!viewMgr.isMobile" class="pa-0 mt-2 mb-1 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="1" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <span class="title">Hell-No H2 Gallery</span>
         </v-col>
         <v-col cols="1" class="flex-grow-0 flex-shrink-0 d-flex justify-end"></v-col>
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
   
   <!-- galleries -->
   <div v-if="visibleGalleries.length" class="my-3">
      <div class="my-5">
         <span class="font-weight-bold">Galleries</span> |
         <RouterLink :to="URL.GALLERIES + Defaults.SITE_ID">View all</RouterLink>
      </div>
      <v-row justify="space-around" ref="galleryRef" class="mb-md-4" >
         <GalleryThumb v-for="gallery in thumbGalleries" :key="gallery.id" :gallery="gallery" showChildImages />
      </v-row>  
   </div>

   <!-- updates -->
   <v-container class="mt-5 pt-3 bg-shade">
      <div class="mb-3">
         <span class="font-weight-bold">Recent Updates</span> |
         <RouterLink :to="URL.RECENT + Defaults.SITE_ID">View all</RouterLink>
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
   import { useWallStore }    from '@/stores/wallStore'
   import { useWallMgr }      from '@/stores/wallMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { useLocalStore }   from '@/stores/localStore'
   import ItemThumb     from '@/components/item/thumb/ItemThumb.vue'
   import GalleryThumb  from '@/components/gallery/GalleryThumb.vue'
   import SwipeWall     from '@/components/wall/SwipeWall.vue'
   import ShowNotifications from '@/components/notification/ShowNotifications.vue'
   import { timestampsEqual } from '@/utils/dateUtils'
   import { ThumbRow } from '@/utils/utilClasses'
   import { Defaults, GalleryThumbWidth, ItemOrigin, TodoType, URL, WallRowHeight } from '@/utils/constants'
   
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const inviteStore  = useInviteStore()
   const itemMgr      = useItemMgr()
   const wallStore    = useWallStore()
   const wallMgr      = useWallMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const localStore   = useLocalStore()
   const galleryRef = ref(null)
   const recentRef  = ref(null)
   const { width: galleryWidth } = useElementSize(galleryRef)
   const { width: recentWidth }  = useElementSize(recentRef)
   const images = ["/images/speakeasy.jpg", "/images/hell-no-sofia.jpg", "/images/hell-no-solo.jpg"]
   const soloImage =  "/images/solo.jpg"
   const currSiteWall = ref(null)
   const currMyWall   = ref(null)
   const wallBackgroundOpacity = ref(.1) 
   
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

   const wallImage   = computed(() => viewMgr.solo ? soloImage : randomImage.value)
   const randomImage = computed(() => {return images[Math.floor(Math.random() * images.length)] })

   const displayWall = computed(() => viewMgr.solo ? myDisplayWall.value : siteDisplayWall.value)

   const siteDisplayWall = computed(() => {
      let wall = wallStore.siteWall
      if (wall.wallRows) { 
         wall = wallMgr.fillWall(wall, itemMgr.recentPublicItems) 
         localStore.setSiteWall(wall) 
      }
      else if (localStore.siteWall.wallRows) { wall = { ...localStore.siteWall } }

      // use currWall if it exists - prevent flashing of retrieved after dispaly of one from local store
      if (currSiteWall.value) { return currSiteWall.value }
      if (wall.wallRows) { currSiteWall.value = wall }
      return wall
   })
   
   const myDisplayWall = computed(() => {
      let wall = wallStore.myWall
      if (wall.wallRows) { 
         wall = wallMgr.fillWall(wall, itemMgr.myRecentItems) 
         localStore.setMyWall(wall) 
      }
      else if (localStore.myWall.wallRows) { wall = { ...localStore.myWall } }

      if (currMyWall.value) { return currMyWall.value }
      if (wall.wallRows) { currMyWall.value = wall }
      return wall
   })
   
   const slideRowHeight = computed(() => viewMgr.isMobile ? WallRowHeight.XS : WallRowHeight.DEFAULT)
   const slideRowMargin = computed(() => viewMgr.isMobile ? 30 : 10 )
   const wallRows       = computed(() => displayWall.value ? displayWall.value.wallRows : 2 )
   const wallDivStyle   = computed(() => "height:" + (((slideRowHeight.value + slideRowMargin.value) * wallRows.value)) + "px;")
   const wallBackgroundStyle = computed(() => wallDivStyle.value + " opacity:" + wallBackgroundOpacity.value + ";")

   // const groups = computed(() => { return groupStore.myGroups })

   const visibleGalleries = computed(() => { 
      const galleries = []     
      const allGalleries = viewMgr.solo ? galleryStore.myGalleries : galleryStore.publicGalleries
      for (const gallery of allGalleries) {
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
      for (const gallery of visibleGalleries.value) {
         // console.log("checking " + gallery.name)
         if (viewMgr.galleryIsVisibleToUser(gallery)) { 
            if (!thumbRow.addThumb(gallery, GalleryThumbWidth)) { break }  
         }
      } 
      return thumbRow.thumbs
   })
   
   const allRecentItems = computed(() => {
      let items = viewMgr.solo ? [ ...itemMgr.myRecentItems ] : [ ...itemMgr.recentPublicItems, ...itemMgr.recentGroupMemberItems ]
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
         URL.RECENT + (userStore.userExists ? userStore.userId : Defaults.SITE_ID), ungroupedItems)
      return ungroupedItems
   })

   const recentItems = computed(() => {
      const thumbRow = new ThumbRow(2, recentWidth.value ? recentWidth.value : 500 )  
      for (const item of allRecentItems.value) {
         const aspectRatio = itemMgr.itemAspectRatio(item)  // w/h
         const newThumbWidth = Math.round(200 * aspectRatio) + 5
         if (!thumbRow.addThumb(item, newThumbWidth))  { break }  
      } 
      return thumbRow.thumbs
   })

   // const allFeedItems = computed(() =>  {  
   //    const items = []
   //    if (feedMgr.myFeed) { 
   //       if (feedMgr.myFeed.feedItems.length) { items.push(...feedMgr.myFeed.feedItems) } 
   //       else if (feedMgr.myFeed?.savedItems?.length ) { 
   //          viewStore.setShowSavedFeedItems(true)
   //          items.push(...feedMgr.myFeed.savedItems)
   //       } 
   //    }
   //    viewStore.setVisibleItems(ItemOrigin.FEED, "Feed", URL.FEED, items)
   //    return items
   // })

   // const feedItemsExist = computed(() => allFeedItems.value.length > 0)
   
   // return number of feed items to fill one row of the feed display
   // const feedItems = computed(() => { 
   //    const thumbRow = new ThumbRow(1, feedWidth.value ? feedWidth.value : 150 ) 
   //    const ungroupedItems = itemMgr.ungroupAndExtractItems(allFeedItems.value)
   //    for (const item of ungroupedItems) {
   //       const aspectRatio = itemMgr.itemAspectRatio(item)
   //       const newThumbWidth = Math.round(200 * aspectRatio) + 5
   //       if (!thumbRow.addThumb(item, newThumbWidth))  { break }  
   //    } 
   //    return thumbRow.thumbs
   // })
</script>

<style>
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
.feed {
   border: 3px solid black; 
}
</style>
