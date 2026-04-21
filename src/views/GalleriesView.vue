<template>
   <div v-if="viewMgr.isMobile && username" class="mt-n2">
      <RouterLink :to="URL.USER + route.params.id">{{ username }}</RouterLink>
   </div>
   <v-container v-if="!viewMgr.isMobile" class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="1" class="flex-grow-0 flex-shrink-0"/>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div class="title">Galleries</div>
            <RouterLink v-if="username" :to="URL.USER + route.params.id" class="mt-n4">{{ username }}</RouterLink>
         </v-col>      
         <v-col cols="1" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <GalleryThumbsConfig/>
         </v-col>
      </v-row>
   </v-container>
   <div style="clear:both"></div>
   <v-container>
      <v-row justify="space-around" class="mb-md-4" >
         <GalleryThumb v-for="gallery in thumbGalleries" :key="gallery.id" :gallery="gallery" 
            :bypassShowUser="bypassShowUser" :showChildImages="!showChildGalleries"/>
      </v-row>
   </v-container>
</template>

<script setup>
   import { computed, onErrorCaptured, onMounted, ref } from 'vue'
   import { useSeoMeta } from '@unhead/vue'
   import { useRoute } from 'vue-router'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useProfileStore } from '@/stores/profileStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import GalleryThumb        from '@/components/gallery/GalleryThumb.vue'
   import GalleryThumbsConfig from '@/components/gallery/GalleryThumbsConfig.vue'
   import { handleError, isPrivate } from '@/utils/utils'
   import { GalleryThumbOptions, URL } from '@/utils/constants'
  
   const route = useRoute()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const profileStore = useProfileStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   
   useSeoMeta({ title: "Hell-No Galleries" })
   onMounted(async() => {
      if (!viewStore.isInitialized) { viewMgr.init() }
   })

   onErrorCaptured((err) => { return handleError(err, "GalleriesView") })

   // id param can be a userId, profileId or the default siteId
   const rawUser    = computed(() => userStore.getUser(route.params.id) )
   const rawProfile = computed(() => profileStore.getProfile(route.params.id)) 
   const paramUserId = computed(() => { 
      if (rawUser.value) { return rawUser.value.id }
      else if (rawProfile.value) { return rawProfile.value.userId }
      return null
   })
   const username = computed(() => { 
      if (rawUser.value) { return rawUser.value.username }
      else if (rawProfile.value) { return rawProfile.value.username }
      return null
   })
  
   const showChildGalleries     = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SHOW_CHILD))
   const showMyPrivateGalleries = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SHOW_PRIVATE))
   const sortByDate             = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SORT_BY_DATE))
   
   const visibleGalleries = computed(() => { 
      // user/profile can see their own galleries
      const allGalleries = (paramUserId.value && paramUserId.value == userStore.userId) ? [...galleryStore.myGalleries] : []
      const galleryIds = new Set()
      for (const gallery of allGalleries) { galleryIds.add(gallery.id) }
      
      const publicGalleries = paramUserId.value ? galleryStore.getPublicGalleries(paramUserId.value) : galleryStore.publicGalleries
      for (const gallery of publicGalleries) {
         if (!galleryIds.has(gallery.id)) { allGalleries.push(gallery) }
      }   

      const galleries = []     
      for (const gallery of allGalleries) {
         const inParamView = 
            !username.value || // site 
            rawUser.value && !gallery.profileId || // user view, gallery not associated with a profile
            rawProfile.value && gallery.profileId == rawProfile.value.id // profile view, gallery matches profile
         if (inParamView && gallery.images.length && viewMgr.galleryThumbVisibleToUser(gallery)) { galleries.push(gallery) }
      }   
      return galleries
   })

   const thumbGalleries = computed(() => { 
      const galleries = []     
      for (const gallery of visibleGalleries.value) {
         let thumbGallery = showChildGalleries.value || !gallery.parentGalleryId ? gallery : null 
         if (gallery && !showMyPrivateGalleries.value && isPrivate(gallery)) { thumbGallery = null }
        
         if (thumbGallery) { galleries.push(thumbGallery) }
      }  
      
      if (sortByDate.value) { galleries.sort(function(a, b) { return b.dateContentModified - a.dateContentModified }) }
      else { galleries.sort(function(a, b) { return a.name.localeCompare(b.name) }) }
      return galleries
   })

   const bypassShowUser = computed(() => username.value ? true : false)
</script>

<style>
</style>
