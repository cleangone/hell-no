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
            <div v-else-if="viewMgr.solo" class="text-subtitle-1 mt-n2 mb-2">Solo Mode</div>
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
   import { useGalleryMgr }   from '@/stores/galleryMgr'
   import { useProfileStore } from '@/stores/profileStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import GalleryThumb        from '@/components/gallery/GalleryThumb.vue'
   import GalleryThumbsConfig from '@/components/gallery/GalleryThumbsConfig.vue'
   import { handleError, isPrivate } from '@/utils/utils'
   import { Defaults, GalleryThumbOptions, Route } from '@/utils/constants'
  
   const route = useRoute()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
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
   const username = computed(() => { 
      if (rawUser.value) { return rawUser.value.username }
      else if (rawProfile.value) { return rawProfile.value.username }
      return null
   })
  
   const showChildGalleries     = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SHOW_CHILD))
   const showMyPrivateGalleries = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SHOW_PRIVATE))
   const sortByDate             = computed(() => viewStore.galleryThumbOptions.includes(GalleryThumbOptions.SORT_BY_DATE))
   
   const visibleGalleries = computed(() => { 
      if (route.params.id == Defaults.SITE_ID) {
         return viewMgr.solo ? galleryStore.myGalleries : galleryStore.publicGalleries 
      }

      const galleries = []
      if (rawUser.value) { 
         const allGalleries = rawUser.value.id == userStore.userId ? 
            galleryStore.myGalleries : galleryStore.getPublicGalleries(rawUser.value.id)
         galleries.push( ...allGalleries.filter(gallery => !gallery.profileId) )
      }
      else if (rawProfile.value) { 
         const allGalleries = galleryStore.getPublicGalleries(rawProfile.value.userId)
         galleries.push( ...allGalleries.filter(gallery => gallery.profileId == rawProfile.value.id) )
      }

     return galleries.filter(gallery => viewMgr.galleryThumbVisibleToUser(gallery))
   })

   const thumbGalleries = computed(() => { 
      const galleries = []     
      for (const gallery of visibleGalleries.value) {
         if (galleryMgr.hasGalleryThumbImage(gallery)) {
            let thumbGallery = showChildGalleries.value || !gallery.parentGalleryId ? gallery : null 
            if (gallery && !showMyPrivateGalleries.value && isPrivate(gallery)) { thumbGallery = null }
            if (thumbGallery) { galleries.push(thumbGallery) }
         }
      }  
      
      if (sortByDate.value) { galleries.sort(function(a, b) { return b.dateContentModified - a.dateContentModified }) }
      else { galleries.sort(function(a, b) { return a.name.localeCompare(b.name) }) }
      return galleries
   })

   const bypassShowUser = computed(() => username.value ? true : false)
</script>

<style>
</style>
