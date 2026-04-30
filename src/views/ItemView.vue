<template>
   <DefineTemplate> <!-- desktop item info beside or below image -->
      <div v-if="alternateName" class="mt-n2">
         also <span class="text-h5">{{ alternateName }}</span>
      </div>
      <div v-if="artist" class="text-h6 mt-n2">
         <RouterLink :to="URL.ARTIST + artist.id">{{ artist.fullName }}</RouterLink> 
      </div>
      <div v-if="paramItem.yearCreated" class="text-h6 mt-n2">{{ paramItem.yearCreated }}</div>
      <div v-if="populated(paramItem.subtitle)" class="font-weight-medium mb-1">{{ paramItem.subtitle }}</div>
      <div v-if="paramItem.size" class="mt-n2">{{ paramItem.size }}</div>
      <div v-if="itemUser" class="mt-n1">
         From <RouterLink :to="URL.USER + fromUser.id">{{ fromUser.username }}</RouterLink> 
         <IconButton v-if="!isOwnedByUser" icon="mdi-email" @click="sendEmail()"/>
      </div>
      <div v-if="isOwnedByUser && !isPublic(paramItem)">{{ paramItem.state }}</div> 
      <div v-html="paramItem.desc" class="mt-3 mb-1"></div>
   </DefineTemplate>

   <div v-if="viewMgr.isDeskTop && paramItem">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="2" class="flex-grow-0 flex-shrink-0"/>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <span style="font-size: 30px">{{ paramItem.name }}</span>
         </v-col>
         <v-col cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end align-center">
            <PlayItems :items="viewStoreItems" :item="paramItem" buttonClass="mr-n2"/>
            <CopyLink :route="Route.ITEM" :id="route.params.id"/>
            <EditButton v-if="isOwnedByUser" @click="editItem(paramItem)" class="mx-n2"/>
         </v-col>
      </v-row>
   </div>

   <div> <!-- origin page and galleries -->
      <span style="text-align:center">
         <div v-if="showNav"> <!-- origin page and gallery if there is only one -->
            <RouterLink v-if="viewStoreVisibleItems" :to="viewStoreVisibleItems.linkUrl" :class="singleOtherGallery ? 'font-weight-bold' : ''">
               {{ viewStoreVisibleItems.linkName }}
            </RouterLink> 
            <span v-if="singleOtherGallery">
               | <RouterLink :to="galleryUrl(otherGalleries[0].id)">{{ otherGalleries[0].name }} Gallery</RouterLink>
            </span>
         </div>
         <div v-if="!showNav || multipleOtherGalleries"> <!-- row of galleries -->
            <span v-for="gallery,index in otherGalleries" :key="gallery.id">
               <span v-if="index"> | </span>
               <RouterLink :to="galleryUrl(gallery.id)">{{ gallery.name }} Gallery</RouterLink>
            </span>
         </div>
      </span>
   </div>
   
   <div style="clear:both"></div>
   <div v-if="showPrevNext"> <!-- prev/next -->
      <v-row v-if="viewMgr.isMobile" class="align-center justify-center flex-nowrap my-1" >
         <v-col cols="6" class="d-flex flex-grow-1 flex-shrink-0 justify-end align-center px-0">
            <RouterLink v-if="navItems.prev" :to="prevItemUrl">{{ navItems.prev.name }}</RouterLink>  
         </v-col>
         <v-col v-if="navItems.prev || navItems.next" class="d-flex flex-grow-0 flex-shrink-0 justify-center text-no-wrap">|</v-col>
         <v-col cols="6" class="d-flex flex-grow-1 flex-shrink-0 justify-start align-center px-0">
            <RouterLink v-if="navItems.next" :to="nextItemUrl">{{ navItems.next.name }}</RouterLink> 
         </v-col>
      </v-row>
      <v-row v-else class="smThumbRow align-center justify-center flex-nowrap my-5" >
         <v-col cols="1" class="d-flex flex-shrink-0"/>
         <v-col cols="5" class="d-flex flex-grow-1 flex-shrink-0 justify-end align-center">
            <div v-if="navItems.prev" class="align-self-center mr-2">{{ navItems.prev.name }}</div>
            <RouterLink v-if="navItems.prev" :to="prevItemUrl">
               <ItemGroupSmThumb v-if="isItemGroup(navItems.prev)" :item="navItems.prev" :height="75" class="ml-0"/>
               <v-img v-else :src="navItems.prev.primaryImage.thumbUrl" contain :width="navItemWidth(navItems.prev, 75)"/>
            </RouterLink>  
         </v-col>
         <v-col class="d-flex flex-grow-0 flex-shrink-0 justify-center text-no-wrap px-5">
            <ItemGroupSmThumb v-if="isItemGroup(paramItem)" :item="paramItem" :height="100" class="ml-0" />
            <v-img v-else :src="paramItem.primaryImage.thumbUrl" contain :width="navItemWidth(paramItem, 100)"/>
         </v-col>
         <v-col cols="5" class="d-flex flex-grow-1 flex-shrink-0 justify-start align-center">
            <RouterLink v-if="navItems.next" :to="nextItemUrl">
               <ItemGroupSmThumb v-if="isItemGroup(navItems.next)" :item="navItems.next" :height="75" class="mr-0"/>
               <v-img v-else :src="navItems.next.primaryImage.thumbUrl" contain :width="navItemWidth(navItems.next, 75)"/>
            </RouterLink> 
            <div v-if="navItems.next" class="align-self-center ml-2">{{ navItems.next.name }}</div>
         </v-col>
         <v-col cols="1" class="d-flex flex-shrink-0"/>
      </v-row>
   </div>

   <div v-if="paramItem" style="position:relative" class="w-100" ref="imageDivRef">  
      <div v-if="viewMgr.isMobile">
         <!-- mobile swipe -->
         <div v-if="viewStore.isMobileSwipe">  
            <div ref="swipeElement" class="center d-flex justify-center">  
               <ItemSwipe v-for="item in swipeItems" :key="item.id" :item="item" v-on:done="onSwipeDone"
                  :canSwipeLeft="navItems.next!=null" :canSwipeRight="navItems.prev!=null"
                  :canSwipeUp="isFeed && !isSavedFeedItem" :canSwipeDown="isFeed"
                  v-on:swipeLeft="onSwipeLeftStarted" v-on:swipeRight="onSwipeRightStarted" 
                  class="itemSwipe" :style="itemSwipeWidthStyle"/>
            </div>
         </div>
         <div v-else>
            <!-- mobile image -->
            <v-img :src="paramItem.primaryImage.url" contain  :class="imageClass" />
             <!-- <v-img :src="paramItem.primaryImage.url" contain :min-width="windowWidth" :class="imageClass" :style="xsExpandedImageStyle"/> -->
            <div class="text-left mt-2">
               <ItemArtistYear :item="paramItem" />
            </div>
            <!-- mobile infinite scroll -->
            <v-infinite-scroll :items="scrollItems" :onLoad="loadItems">
               <template v-for="item in scrollItems" :key="item.id">
                  <div v-if="item.id != route.params.id" class="mt-5">
                     <div class="text-h6">{{ item.name }}</div>
                     <div v-if="itemOtherGalleries(item).length"> 
                        <span v-for="gallery,index in itemOtherGalleries(item)" :key="gallery.id">
                           <span v-if="index"> | </span>
                           <RouterLink :to="galleryUrl(gallery.id)">{{ gallery.name }} Gallery</RouterLink>
                        </span>
                     </div>
                  </div>
                  <!-- <v-img :src="item.primaryImage.url" contain :min-width="windowWidth" :class="imageClass" class="my-2" :style="xsExpandedImageStyle"/> -->
                  <v-img :src="item.primaryImage.url" contain  :class="imageClass"/>
                  <div class="text-left mt-2">
                     <ItemArtistYear :item="item"/>
                  </div>
               </template>
               <template v-slot:empty></template>
            </v-infinite-scroll>
         </div>
      </div>
      <!-- desktop - image and info -->
      <div v-else class="text-left"> 
         <IconButton :icon="descBeside?'mdi-image':'mdi-image-text'" @click="viewStore.toggleItemDescBesideImage()" class="mx-n2"/>
         <PlayItems :items="viewStoreItems" :item="paramItem" icon="mdi-arrow-expand" fullscreen :buttonClass="PLAY_ITEMS_CLASS"/>
         <IconButton v-if="userStore.userExists" :icon="isUserFavorite?'mdi-heart':'mdi-heart-plus-outline'" @click="toggleUserFavorite()" class="mx-n2"/>
         <v-row class="w-100">
            <v-col :cols="descBeside ? 8 : 12">
               <div v-if="isItemGroup(paramItem)" @click="viewStore.toggleItemDescBesideImage()" class="center d-flex justify-center" style="width: 100%">
                  <div class="d-flex align-center bg-black">
                     <img v-if="paramItem.childItems.length" :src="paramItem.childItems[0].primaryImage.url" 
                        :width="childItemTargetWidth(0)" class="first-image" :class="imageClass"/>
                     <img v-if="paramItem.childItems.length > 1" :src="paramItem.childItems[1].primaryImage.url" 
                        :width="childItemTargetWidth(1)" class="next-image" :class="imageClass"/> 
                     <img v-if="paramItem.childItems.length > 2" :src="paramItem.childItems[2].primaryImage.url" 
                        :width="childItemTargetWidth(2)" class="next-image" :class="imageClass"/>
                  </div>
               </div>
               <v-img v-else :src="paramItem.primaryImage.url" contain :max-width="imageWidth" 
                  @click="viewStore.toggleItemDescBesideImage()" :class="imageClass"/>
               <div v-if="!descBeside" class="mt-5">
                  <div v-if="additionalImages.length" class="bg-shade mb-5">
                     <v-row class="mx-3">
                        <div v-for="additionalImage in additionalImages" :key="additionalImage.id" class="py-3 px-1">
                           <div class="text-center pointer">
                              <v-img :src="additionalImage.url" @click="showAdditionalImages(additionalImage)" contain :width="75"/>
                              {{ additionalImage.name }}
                           </div>
                        </div>
                     </v-row>
                  </div>
                  <div class="text-left">
                     <ReuseTemplate/>
                  </div>
               </div>
            </v-col> 
            <v-col v-if="descBeside && additionalImages.length" cols="1" class="bg-shade my-3">
               <div v-for="additionalImage in additionalImages" :key="additionalImage.id" class="pb-4 pointer text-center">      
                  <v-img :src="additionalImage.url" @click="showAdditionalImages(additionalImage)" contain :width="100"/>
                  {{ additionalImage.name }}
               </div>    
            </v-col>
            <v-col v-if="descBeside">
               <ReuseTemplate/>
            </v-col>
         </v-row>
      </div>
   </div>
                     
   <v-dialog v-model="showItemImagesDialog" width="auto">
      <ShowItemImages :initialImage="selectedImage" :item="selectedItem" @done="showItemImagesDialog=false"/>
   </v-dialog>   
   <v-dialog v-model="showItemGroupImagesDialog" width="auto">
      <ShowItemGroupImages :initialItem="selectedItem" :parentItem="paramItem" @done="showItemGroupImagesDialog=false"/>
   </v-dialog>   
   <v-dialog v-model="showEditDialog" width="auto" height="auto">
      <EditItemDialog :item="selectedItem" @done="showEditDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, onErrorCaptured, onMounted, ref } from 'vue'
   import { useRoute, useRouter } from 'vue-router'
   import { createReusableTemplate, onKeyStroke, useWindowSize } from '@vueuse/core'
   import { useSeoMeta } from '@unhead/vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useUserMgr }      from '@/stores/userMgr'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useFeedStore }    from '@/stores/feedStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useProfileStore } from '@/stores/profileStore'
   import { useWallStore }    from '@/stores/wallStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import ItemArtistYear   from '@/components/item/ItemArtistYear.vue'
   import ItemGroupSmThumb from '@/components/item/ItemGroupSmThumb.vue'
   import ItemSwipe        from '@/components/item/ItemSwipe.vue'
   import PlayItems        from '@/components/item/PlayItems.vue'
   import ShowItemImages   from '@/components/item/ShowItemImages.vue'
   import ShowItemGroupImages from '@/components/item/ShowItemGroupImages.vue'
   import EditItemDialog   from '@/components/item/crud/EditItemDialog.vue'
   import EditButton       from '@/components/util/EditButton.vue'
   import IconButton       from '@/components/util/IconButton.vue'
   import CopyLink         from '@/components/util/CopyLink.vue'
   import { handleError, isOwned, isPublic, populated } from '@/utils/utils'
   import { Emit, ItemNavAction, ItemOrigin, ParentFeedType, Route, URL } from '@/utils/constants'

   const PLAY_ITEMS_CLASS = "PlayItems"
   const AdditionalImagesType = { ITEM: 'item', IMAGE: 'image' }
   const route = useRoute()
   const router = useRouter()
   const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
   const userStore    = useUserStore()
   const userMgr      = useUserMgr()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const feedStore    = useFeedStore()
   const galleryStore = useGalleryStore()
   const profileStore = useProfileStore()
   const wallStore    = useWallStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const showNav = ref(false)
   const swipeBotItem = ref(null)
   const { width: windowWidth, height: windowHeight } = useWindowSize()
   const imageDivRef = ref(null)
   const showItemImagesDialog      = ref(false)
   const showItemGroupImagesDialog = ref(false)
   const showEditDialog            = ref(false)
   const selectedItem  = ref(null)
   const selectedImage = ref(null)
   const meta = ref({})
   
   // onMounted not guar to be called before other methods/computed
   onMounted(async() => {
      // console.log("ItemView.onMounted")
      if (viewStore.isInitialized && route.params.origin != ItemOrigin.EXTERNAL) { showNav.value = true }
      else {
         console.log("ItemView - external/direct link to " + route.params.id)
         viewMgr.init()
      }
      
      if (viewMgr.isMobile) { initializeScrollItems() }
   })

   onErrorCaptured((err) => { return handleError(err, "ItemView") })

   const paramItem = computed(() => { 
      // console.log("paramItem - route.params.id", route.params.id)
      let item = itemStore.getItem(route.params.id)
      // console.log("paramItem - item", item)
      if (!item) { return null }  // itemStore has not intiailized yet

      viewMgr.addHit(route.params.id)
      
      if (viewMgr.isMobile && isItemGroup(item)) { 
         item = { ...item, childNum: route.params.child ? route.params.child : "1" }
         item = itemMgr.extractFromItemGroup(item) 
      }

      viewStore.setPageName(item.name)
      meta.value.title = item.name
      return item 
   })

   // changed back to hardcoded because was causing load issue for mobile
   useSeoMeta({
      // title: paramItem.value ? "Hell-No - " + paramItem.value.name : "Hell-No Gallery"
      title: "Hell-No Gallery" 
   })

   const additionalImages = computed(() => {
      const images = []
      if (isItemGroup(paramItem.value)) { 
         for (const childItem of paramItem.value.childItems) {
            images.push({ id:childItem.id, type:AdditionalImagesType.ITEM, url:childItem.primaryImage.thumbUrl, item:childItem })
         }
      }
      else { 
         for (const image of paramItem.value.otherImages) {
            if (image.showWithItem) {
               const additionalImage = { 
                  id:image.id, type:AdditionalImagesType.IMAGE, url:image.thumbUrl, name:image.name, image:image }
               if (!additionalImage.name) {
                  additionalImage.name = wallStore.myWallIncludesImage(image.id) ? "Wall" : image.imageType 
               }
               images.push(additionalImage)
            }
         }
      }
      return images
   })

   // const itemName      = computed(() => paramItem.value.name)   
   const alternateName = computed(() => paramItem.value.alternateName?.length ? paramItem.value.alternateName : null)
   const itemUser      = computed(() => userStore.getUser(paramItem.value.userId)) 
   const descBeside    = computed(() => viewStore.itemDescBesideImage)
   const artist        = computed(() => paramItem.value.primaryArtist) 
   
   const fromUser = computed(() => paramItem.value.profileId ?
      { id: paramItem.value.profileId, username: profileStore.getUsername(paramItem.value.profileId) } :
      { id: paramItem.value.userId,    username: itemUser.value ? itemUser.value.username : null })

   const originGalleryId = computed(() => {  
      let originGalleryId = route.params.origin == ItemOrigin.GALLERY ? viewStoreVisibleItems.value?.linkId : null
      if (!originGalleryId || originGalleryId.length > 15) { return originGalleryId }
        
      // id is actually a tag
      const gallery = galleryStore.getGalleryByTag(originGalleryId) 
      return gallery ? gallery.id : null
   })

   const singleOtherGallery     = computed(() => otherGalleries.value.length == 1)
   const multipleOtherGalleries = computed(() => otherGalleries.value.length > 1)
   const otherGalleries = computed(() => {  
      const galleries = []
      for (const galleryId of paramItem.value.galleryIds) {
         const gallery = galleryStore.getGallery(galleryId)
         if (gallery.id != originGalleryId.value && viewMgr.galleryThumbVisibleToUser(gallery)) { galleries.push(gallery) }
      }
      galleries.sort(function(a, b){return a.name.localeCompare(b.name)}) 
      return galleries
   })

   const itemIdToOtherGalleries = new Map()
   const itemOtherGalleries = (item) => {
      if (itemIdToOtherGalleries.has(item.id)) { return itemIdToOtherGalleries.get(item.id) }
 
      let galleryIds = item.galleryIds
      if (!galleryIds) {
         // workaround for wall items
         // console.log("Retrieving " + item.name + " galleries")
         const fullItem = itemStore.getItem(item.id)
         galleryIds = fullItem ? fullItem.galleryIds : []
      }

      const galleries = []
      for (const galleryId of galleryIds) {
         const gallery = galleryStore.getGallery(galleryId)
         if (gallery.id != originGalleryId.value && viewMgr.galleryIsVisibleToUser(gallery)) { galleries.push(gallery) }
      }
      galleries.sort(function(a, b){return a.name.localeCompare(b.name)}) 
      itemIdToOtherGalleries.set(item.id, galleries)
      
      return galleries
   }

   const isUserFavorite = computed(() => userStore.user?.favoriteItems?.includes(route.params.id))
   const toggleUserFavorite = () => {
      if (isUserFavorite.value) { userMgr.removeFavoriteItem(route.params.id) }
      else { userMgr.addFavoriteItem(route.params.id) }
   }

   // do not show prev/next if mobile set to scroll through items
   const showPrevNext = computed(() => 
      viewMgr.isMobile && !viewStore.isMobileSwipe ? false : showNav.value)
   
   // todo - why did I care about horizontal windows?
   // const showPrevNext = computed(() => 
   //    viewMgr.isMobile && windowWidth.value > windowHeight.value ? false : showNav.value)
   
   const showAdditionalImages = (additionalImage) => { 
      if (additionalImage.type == AdditionalImagesType.ITEM) { showItem(additionalImage.item) }
      else { showImage(additionalImage.image) }
   }

   const showItem  = (item)  => { showDialog(showItemGroupImagesDialog, item) }
   const showImage = (image) => { showDialog(showItemImagesDialog, paramItem.value, image) }
   const editItem  = (item)  => { showDialog(showEditDialog, item) }
   const showDialog = (dialog, item, image) => { 
      selectedItem.value  = item 
      selectedImage.value = image 
      dialog.value = true
   }
   
   const viewStoreVisibleItems = computed(() => showNav.value ? viewStore.getVisibleItems(route.params.origin) : null)
   const viewStoreItems = computed(() => viewStoreVisibleItems.value ? viewStoreVisibleItems.value.items : [])
   const itemIdVisibleItem = computed(() => viewStoreItems.value ? new Map(viewStoreItems.value.map((obj) => [obj.id, obj])) : new Map())

   const isItemGroup  = (item) => { return itemMgr.isItemGroup(item) }
   const isOwnedByUser = computed(() => isOwned(paramItem.value, userStore.userId))
   const prevItemUrl = computed(() => itemMgr.itemNavURL(linkId(navItems.value.prev), route.params.origin, ItemNavAction.PREV, navItems.value.prev.childNum))
   const nextItemUrl = computed(() => itemMgr.itemNavURL(linkId(navItems.value.next), route.params.origin, ItemNavAction.NEXT, navItems.value.next.childNum))
   const linkId     = (item)      => { return item.linkId ? item.linkId : item.id }
   const itemUrl    = (itemId)    => { return itemMgr.itemURL(itemId, route.params.origin) }
   const galleryUrl = (galleryId) => { return URL.GALLERY + galleryId }
   
   const imageWidth = computed(() => { return paramItem.value?.primaryImage?.dimensions ? paramItem.value.primaryImage.dimensions.width : 500 })

   // small/mobile screen avoids pointer events so they will flow up to div for swipe
   const imageClass = computed(() => { return windowWidth.value < 500 ? "no-pointer-events" : "pointer" })
   
   const navItems = computed(() => { 
      // console.log("navItems looking for param id/child", route.params.id, route.params.child)
      // console.log("viewStoreItems.length", viewStoreItems.value.length)
      
      for (let i=0; i<viewStoreItems.value.length; i++) {
         const viewStoreItem = viewStoreItems.value[i]
         // console.log("viewStoreItem", linkId(viewStoreItem), viewStoreItem.childNum)
         if (linkId(viewStoreItem) == route.params.id &&
             ((!viewStoreItem.childNum && !route.params.child) || 
              (viewStoreItem.childNum  ==  route.params.child))) {

            // console.log("found navItem " + viewStoreItem.name, viewStoreItem.id, viewStoreItem.childNum)
            let prev = i > 0 ? viewStoreItems.value[i-1] : null
            let next = i < viewStoreItems.value.length - 1 ? viewStoreItems.value[i+1] : null
         
            // console.log("prev", prev)
            // console.log("next", next)

            // preload next image (prev probably already been displayed)
            if (next) { 
               if (isItemGroup(next)) {
                  for (const childItem of next.childItems) {
                     viewStore.loadImage(childItem.primaryImage.url)
                  }
               }
               else { viewStore.loadImage(next.primaryImage.url) } 
            }
            
            // preload predicted bottom image, which will be gradually revealed during swipe
            // if at either end, preload the only possible direction to swipe/arrow 
            // in middle, user swiping or arrowing in a direction will prob continue that way 
            // if prediction wrong, correct bottom will be set at beginning of swipe
            setTimeout(() => { // delay prevents flash of top image
               if (prev || next) {
                  if (prev == null) {  swipeBotItem.value = next } 
                  else if (next == null) {  swipeBotItem.value = prev } 
                  else if (route.params.nav == ItemNavAction.PREV) { swipeBotItem.value = prev } 
                  else { swipeBotItem.value = next } 
               }
            }, 500)
         
            return { prev: prev, next: next }
         } 
      }
      return { }
   })

   const navItemWidth = (item, targetHeight) => { 
      // console.log("navItemWidth", item)
      const aspectRatio = itemMgr.itemAspectRatio(item)
      const targetWidth = aspectRatio ? Math.round(targetHeight * aspectRatio) : 60 // get width for specified height
      return targetWidth.toString()
   }

   const childItemsTotalWidth = computed(() => { 
      let totalWidth = 0
      if (isItemGroup(paramItem.value)) {
         for (const childItem of paramItem.value.childItems) {
            totalWidth += childItem.primaryImage.dimensions.width
         }
      }
      return totalWidth
   })

   const childItemTargetWidth = (index) => {
      const pct = descBeside.value ? .65 : 1
      const totalTargetWidth = (windowWidth.value -100) * pct
      const childTargetWidth =  
         Math.round(totalTargetWidth * paramItem.value.childItems[index].primaryImage.dimensions.width / childItemsTotalWidth.value)
      return childTargetWidth
   }

   const xsExpandedImageStyle = computed(() => { 
      const left = imageDivRef.value ? imageDivRef.value.offsetLeft : 30
      return "position:relative;left:-" + left + "px"
   })
   

   const sendEmail = () => {
      viewStore.setEmailContext(itemUser.value, paramItem.value)
      router.push(URL.MESSAGE)
   }

   // --- Infinite Scroll ------------------------------------------------------------------ 
   const scrollItems = ref([])
   const scrollEndIndex = ref(0)
   const setScrollEndIndex = (startIndex) => { scrollEndIndex.value = viewStoreItems.value.length > startIndex + 2 ? startIndex + 2 : viewStoreItems.value.length } 
   
   const initializeScrollItems = () => { 
      if (viewStoreItems.value?.length) {
         let startIndex = 0
         for (var i=0; i<viewStoreItems.value.length; i++) { 
            const viewItem = viewStoreItems.value[i]
            if (route.params.id == viewItem.id || route.params.id == viewItem.linkId && route.params.child == viewItem.childNum) {
               startIndex = i + 1  // scroll starts after paramItem
            } 
         }
         scrollItems.value.push(...getNewScrollItems(startIndex))
      }
   }
   
   const getNewScrollItems = (startIndex) => { 
      const newScrollItems = []
      if (startIndex) {
         setScrollEndIndex(startIndex)
         for (var i=startIndex; i<scrollEndIndex.value; i++) { 
            const newScrollItem = viewStoreItems.value[i]
            newScrollItems.push(newScrollItem)
            viewStore.loadImage(newScrollItem.primaryImage.url) 
         }
      }
      return newScrollItems
   }

   async function getNextScrollItems() {
      return new Promise(resolve => {
         setTimeout(() => { resolve(getNewScrollItems(scrollEndIndex.value)) }, 1000)
      })
   }

   async function loadItems ({ done }) {
      const nextScrollItems = await getNextScrollItems()
      scrollItems.value.push(...nextScrollItems)
      done(nextScrollItems.length ? 'ok' : 'empty')
   }

   // --- Feed ------------------------------------------------------------------ 
   const isFeed = computed(() => route.params.origin == ItemOrigin.FEED)
   const isSavedFeedItem = computed(() => { 
      const visibleItem = itemIdVisibleItem.value.get(paramItem.value.id)
      return visibleItem ? visibleItem.parentFeedType == ParentFeedType.SAVED : false
   })

   const FeedItemActions = { SAVE: "save", ADD_TO_SAVED: "addSaved", DISMISS: "dismiss" }
   const saveFeedItem    = () => { processFeedItem(FeedItemActions.SAVE) }
   const dismissFeedItem = () => { processFeedItem(FeedItemActions.DISMISS) }
   const processFeedItem = (feedItemAction) => {
      console.log("processfeedItem", feedItemAction, paramItem.value)   

      // find orig viewstore item/index associtated with displayed item
      const visibleItem = itemIdVisibleItem.value.get(paramItem.value.id)
      if (!visibleItem) { 
         console.log("ItemView.processfeedItem - cannot find visibleItem with id " + feedItemId) 
         return
      }

      const feedItemId = visibleItem.ungroupedFromItemId ? visibleItem.ungroupedFromItemId : visibleItem.id
      let indexedFeedItem = null
      for (let i=0; i<viewStoreItems.value.length; i++) {
         if (viewStoreItems.value[i].id == feedItemId) {
            indexedFeedItem = { index: i, item: viewStoreItems.value[i] }
            break
         } 
      }
      if (!indexedFeedItem) { 
         console.log("ItemView.processfeedItem - cannot find viewStoreVisibleItem with id " + feedItemId) 
         return
      }

      // save navToItem because viewStore updates will propagate and change it
      const navToItem = navItems.value.next ? navItems.value.next : navItems.value.prev
      
      if (visibleItem.ungroupedFromItemId) {
         // cannot remove feedItem from feed until all its children have been processed
         viewStore.addProcessedFeedItemId(visibleItem.id)
         let allChildItemsProcessed = true
         for (const childItem of indexedFeedItem.item.childItems) {
            if (!viewStore.processedFeedItemIds.includes(childItem.id)) { allChildItemsProcessed = false }
         }
         
         if (allChildItemsProcessed) { updateFeedItem(feedItemAction, indexedFeedItem) }
         else if (feedItemAction == FeedItemActions.SAVE) { updateFeedItem(FeedItemActions.ADD_TO_SAVED, indexedFeedItem) }
      } 
      else { updateFeedItem(feedItemAction, indexedFeedItem) }
      
      router.push(navToItem ? itemUrl(navToItem.id) : URL.FEED)
   }

   const updateFeedItem = (feedItemAction, indexedFeedItem) => {
      console.log("updateFeedItem", feedItemAction, indexedFeedItem)   
      if (feedItemAction == FeedItemActions.SAVE) { feedStore.saveMyFeedItem(indexedFeedItem.item) }
      else if (feedItemAction == FeedItemActions.ADD_TO_SAVED) { feedStore.addMyFeedItemToSaved(indexedFeedItem.item) }
      else { feedStore.dismissMyFeedItem(indexedFeedItem.item) }

      if (feedItemAction == FeedItemActions.SAVE || feedItemAction == FeedItemActions.DISMISS) {
         // remove processed item from viewstore
         const updatedItems = viewStoreItems.value.toSpliced(indexedFeedItem.index, 1)
         viewStore.updateVisibleItems(route.params.origin, updatedItems)
      }
   }

   // --- Swipe ----------------------------------------------------------------- 
   const swipeItems = computed(() => {
      const swipeTop = { ...paramItem.value, isTop: true }
      const swipeBot = swipeBotItem.value ? { ...swipeBotItem.value } : null
      return swipeBot ? [ swipeBot, swipeTop ] : [ swipeTop ]
   })

   const itemSwipeWidth = computed(() => Math.min(windowWidth.value, imageWidth.value))
   const itemSwipeWidthStyle = computed(() => "width:" + itemSwipeWidth.value +  "px")
   const onSwipeLeftStarted  = (itemName) => { swipeBotItem.value = navItems.value.next }
   const onSwipeRightStarted = (itemName) => { swipeBotItem.value = navItems.value.prev }
   const onSwipeDone = (swipeEmit, itemName) => {
      setTimeout(() => { // delay actions so swipe finishes smoothly 
         if (swipeEmit == Emit.SWIPE_LEFT) {
            if (navItems.value.next) { router.push(nextItemUrl.value) } 
         }
         else if (swipeEmit == Emit.SWIPE_RIGHT) {
            if (navItems.value.prev) { router.push(prevItemUrl.value) } 
         }
         else if (swipeEmit == Emit.SWIPE_UP) {
            saveFeedItem()
         }
         else if (swipeEmit == Emit.SWIPE_DOWN) {
            dismissFeedItem()
         }
      }, 300)
   }

   // --- onKeyStroke, also active in fullscreen mode --------------------------
   // multiple listeners for same element/event are called in the order they were added
   // ItemView added first - it is called before dialog listeners
   const showingDialog = computed(() => showItemImagesDialog.value || showItemGroupImagesDialog.value || showEditDialog.value)
   onKeyStroke('ArrowLeft', (e) => {
      // console.log("ItemView.ArrowLeft")
      if (navItems.value.prev && !showingDialog.value && !eventClass(e, PLAY_ITEMS_CLASS)) { router.push(prevItemUrl.value) }  
      if (!showEditDialog.value) { e.preventDefault() }
   })
   onKeyStroke('ArrowRight', (e) => {
      // console.log("ItemView.ArrowRight")
      if (navItems.value.next && !showingDialog.value && !eventClass(e, PLAY_ITEMS_CLASS)) { router.push(nextItemUrl.value) } 
      if (!showEditDialog.value) { e.preventDefault() }
   })
   onKeyStroke('ArrowUp', (e) => {
      if (!showingDialog) { router.push(visibleItemsContainer.value.linkUrl) }
      if (!showEditDialog.value) { e.preventDefault() }
   })
   const eventClass = (e, targetClass) => {
      const eleClass = e?.originalTarget?.attributes?.getNamedItem("class")
      const textContent = eleClass ? eleClass.textContent : ""
      return textContent.includes(targetClass)
   }
</script>

<style>
.center {
   display: block;
   margin-left: auto;
   margin-right: auto;
}
.itemSwipe {
   position: absolute;
   max-width: 95%;
}
.smThumbRow {
   height: 140px;
}
.no-pointer-events {
   pointer-events: none;
}
.first-image {
   border: 4px solid black; 
   float: left;
}
.next-image {
   border-top:    4px solid black; 
   border-bottom: 4px solid black; 
   border-right:  4px solid black; 
   float: left;
}
.prevLink {
   min-width: 5em;
   display: inline-block;
   text-align: right;
   margin-right: 3px;
}
.nextLink {
   min-width: 5em;
   display: inline-block;
   text-align: left;
   margin-left: 3px;
}
</style>
