<template>
   <div v-if="viewMgr.isMobile && username" class="mt-n2">
      <RouterLink :to="Route.USER.url + route.params.id">{{ username }}</RouterLink>
   </div>
   <v-container v-if="!viewMgr.isMobile" class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="1" class="flex-grow-0 flex-shrink-0"/>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div class="title">Galleries</div>
            <RouterLink v-if="username" :to="Route.USER.url + route.params.id" class="mt-n4">{{ username }}</RouterLink>
            <!-- <div v-else-if="viewMgr.solo" class="text-subtitle-1 mt-n2 mb-2">Solo Mode</div> -->
         </v-col>      
         <v-col cols="1" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ThumbSizeButton :thumbType="ThumbType.GALLERY"/>
            <SortButton :sortByDate="sortByDate" @click="sortByDate=!sortByDate" class="mx-2"/>
            <ChildGalleriesButton v-if="childGalleriesExist" class="mr-2"/>
            <GalleryThumbConfig class="mr-2"/>
            <ToolTip location="bottom" iconClass="mx-n2">
               <div>
                  <div><v-icon icon="mdi-image-size-select-large"/> Image size</div>
                  <div><v-icon icon="mdi-sort-calendar-ascending"/> / <v-icon icon="mdi-sort-alphabetical-ascending"/> 
                     Sort by Date/Name</div>
                  <div v-if="childGalleriesExist">
                     <v-icon icon="mdi-folder-multiple-image"/> / <v-icon icon="mdi-folder-image"/> 
                     Show/Hide Child Galleries</div>
                  <div><v-icon icon="mdi-image-edit"/> Additional Config</div>
               </div>
            </ToolTip>   
         </v-col>
      </v-row>
   </v-container>
   <div style="clear:both"></div>
   <HorizontalDiv class="mr-2">
      <div v-if="showAvatars" class="mr-4">
         <div v-for="user in avatarUsers" :key="user.id">
             <Avatar :user="user" :size="60" @click="selectUser(user)" :toolTip="user.username" 
               class="hand pa-1" :class="selectedUserId==user.id?'bg-blue':'bg-black'"/>
         </div>
      </div>
      <v-container>
      <v-row justify="space-around"  density="compact" class="mb-md-4" >
         <GalleryThumb v-for="gallery in selectedGalleries" :key="gallery.id" :gallery="gallery" 
            :bypassShowUser="bypassShowUser" :showChildImages="!showChildGalleries" 
            :parentIcon="getParentIcon(gallery)" @toggle="toggleParentId(gallery.id)"
            :childIcon="getChildIcon(gallery)"   @close="closeChild(gallery)"/>
      </v-row>
      </v-container>
   </HorizontalDiv>
</template>

<script setup>
   import { computed, onErrorCaptured, onMounted, ref, watch } from 'vue'
   import { useSeoMeta } from '@unhead/vue'
   import { useRoute } from 'vue-router'
   import { useUserStore }    from '@/stores/userStore'
   import { useUserMgr }      from '@/stores/userMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import GalleryThumb        from '@/components/gallery/thumb/GalleryThumb.vue'
   import GalleryThumbConfig  from '@/components/gallery/thumb/GalleryThumbConfig.vue'
   import ChildGalleriesButton from '@/components/gallery/thumb/ChildGalleriesButton.vue'
   import Avatar              from '@/components/user/Avatar.vue'
   import HorizontalDiv       from '@/components/util/HorizontalDiv.vue'
   import SortButton          from '@/components/util/SortButton.vue'
   import ThumbSizeButton     from '@/components/util/ThumbSizeButton.vue'
   import ToolTip             from '@/components/util/ToolTip.vue'
   import { handleError, isPrivate } from '@/utils/utils'
   import { Defaults, GalleryThumbOptions, Route, ThumbType } from '@/utils/constants'
  
   const route = useRoute()
   const userStore    = useUserStore()
   const userMgr      = useUserMgr()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const sortByDate   = ref(true)
   const selectedUserId = ref(null)
   const expandedParentIds = ref(new Set())
   const parentIdToChildGalleries = ref(new Map())
   
   useSeoMeta({ title: "Hell-No Galleries" })
   onMounted(async() => {
      if (!viewStore.isInitialized) { viewMgr.init() }
   })

   onErrorCaptured((err) => { return handleError(err, "GalleriesView") })

   const isSiteGallery = computed(() => route.params.id == Defaults.SITE_ID)
   const user          = computed(() => isSiteGallery.value ? null : userStore.getUser(route.params.id) )
   const username      = computed(() => user.value ? user.value.username : null)
  
   const showMyPrivateGalleries = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SHOW_PRIVATE))
   const showChildGalleries     = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SHOW_CHILD))
   watch(showChildGalleries, (newValue, oldValue) => {
      if (newValue) {
         const parentIds = [ ...parentIdToChildGalleries.value.keys() ]
         parentIds.forEach((parentId) => { expandedParentIds.value.add(parentId) })
      }
      else { expandedParentIds.value.clear() }
   })

   const visibleGalleries = computed(() => { 
      if (isSiteGallery.value) {
         return viewMgr.solo ? galleryStore.myGalleries : galleryStore.publicGalleries 
      }

      const galleries = []
      if (user.value) { 
         const allGalleries = user.value.id == userStore.userId ? 
            galleryStore.myGalleries : galleryStore.getPublicGalleries(user.value.id)
         galleries.push(...allGalleries)
      }      

     return galleries.filter(gallery => viewMgr.galleryThumbVisibleToUser(gallery))
   })

   const thumbGalleries = computed(() => { 
      const galleries = []     
      const parentToChildren = new Map()
      for (const gallery of visibleGalleries.value) {
         if (galleryMgr.hasGalleryThumbImage(gallery)) {
            if (showMyPrivateGalleries.value || !isPrivate(gallery)) {
               if (gallery.parentGalleryId) {
                  let childGalleries = parentToChildren.get(gallery.parentGalleryId)
                  if (!childGalleries) {
                     childGalleries = []
                     parentToChildren.set(gallery.parentGalleryId, childGalleries)
                  }
                  childGalleries.push(gallery)
               }
               else {galleries.push(gallery) }
            }
         }
      }  

      parentToChildren.values().forEach((galleryArray) => 
         galleryArray.sort(function(a, b) { return a.name.localeCompare(b.name) }))
      parentIdToChildGalleries.value = parentToChildren // side-effect hack
      return galleries
   })

   const sortedGalleries = computed(() => { 
      return sortByDate.value ?
         thumbGalleries.value.toSorted(function(a, b) { return b.dateContentModified - a.dateContentModified }) :
         thumbGalleries.value.toSorted(function(a, b) { return a.name.localeCompare(b.name) })
   })

   const selectedGalleries = computed(() => {
      const displayGalleries = []
      const topLevelGalleries = selectedUserId.value ?
         sortedGalleries.value.filter(gallery => gallery.userId == selectedUserId.value) : sortedGalleries.value
      for (const gallery of topLevelGalleries) {
         addGalleryAndChildren(gallery, displayGalleries)
      }

      return displayGalleries
   })

   // recursive
   const addGalleryAndChildren = (gallery, displayGalleries) => { 
      displayGalleries.push(gallery)
      if (expandedParentIds.value.has(gallery.id) && parentIdToChildGalleries.value.has(gallery.id)) {
         for (const childGallery of parentIdToChildGalleries.value.get(gallery.id)) {
            addGalleryAndChildren(childGallery, displayGalleries)
         }
      }
   }

   const showAvatars = computed(() => isSiteGallery.value && !viewMgr.solo)   
   const avatarUsers = computed(() => userMgr.avatarUsers)
   const selectUser = (user) => { selectedUserId.value = selectedUserId.value == user.id ? null : user.id }
   
   const bypassShowUser = computed(() => username.value ? true : false)

   const childGalleriesExist = computed(() => parentIdToChildGalleries.value.size)

   const getChildIcon  = (gallery) => { return gallery.parentGalleryId ? "mdi-close-circle" : null }
   const getParentIcon = (gallery) => { 
      if (gallery.childGalleryIds?.length) {
         return expandedParentIds.value.has(gallery.id) ? "mdi-folder-multiple-image" : "mdi-folder-image"
      }
      return null
   }
   
   const closeChild = (gallery) => { toggleParentId(gallery.parentGalleryId) }
   const toggleParentId = (galleryId) => {    
      if (expandedParentIds.value.has(galleryId)) { expandedParentIds.value.delete(galleryId) } 
      else { expandedParentIds.value.add(galleryId) }
   }
</script>

<style>
</style>
