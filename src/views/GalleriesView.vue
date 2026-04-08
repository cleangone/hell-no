<template>
   <DefineTemplate>
      <v-sheet class="d-flex flex-column align-end">
         <TextButtonTight v-if="showChildGalleries" @click="showChildGalleries=false" text="Hide Child Galleries" class="px-0"/>
         <TextButtonTight v-else @click="showChildGalleries=true" text="Show Child Galleries" class="px-0"/>
         <TextButtonTight v-if="sort==SortBy.DATE" @click="sort=SortBy.NAME" text="Sort by Name" class="px-0"/>
         <TextButtonTight v-else @click="sort=SortBy.DATE" text="Sort by Date" class="px-0"/>
     </v-sheet>
   </DefineTemplate>

   <div v-if="viewMgr.isMobile && username" class="mt-n2">
      <RouterLink :to="URL.USER + route.params.id">{{ username }}</RouterLink>
   </div>
   <div v-if="viewMgr.isMobile" style="float:right">
      <ReuseTemplate/>
   </div>
   <v-container v-else class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="2" class="flex-grow-0 flex-shrink-0"/>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div class="title">Galleries</div>
            <RouterLink v-if="username" :to="URL.USER + route.params.id" class="mt-n4">{{ username }}</RouterLink>
         </v-col>      
         <v-col cols="2" class="flex-grow-0 flex-shrink-0">
            <ReuseTemplate/>
         </v-col>
      </v-row>
   </v-container>
   <div style="clear:both"></div>
   <v-container>
      <v-row justify="space-around" class="mb-md-4" >
         <GalleryThumb v-for="gallery in thumbGalleries" :key="gallery.id" :gallery="gallery" 
            :showChildImages="!showChildGalleries" class="bg-red"/>
      </v-row>
   </v-container>
</template>

<script setup>
   import { computed, onErrorCaptured, onMounted, ref } from 'vue'
   import { useRoute } from 'vue-router'
   import { createReusableTemplate } from '@vueuse/core'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import GalleryThumb    from '@/components/gallery/GalleryThumb.vue'
   import TextButtonTight from '@/components/util/TextButton.vue'
   import { handleError } from '@/utils/utils'
   import { Defaults, URL } from '@/utils/constants'
  
   const SortBy = { NAME: "name", DATE: "date" }
   const route = useRoute()
   const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   const sort = ref(SortBy.NAME)

   onMounted(async() => {
      if (!viewStore.isInitialized) { viewMgr.init() }
   })

   onErrorCaptured((err) => { return handleError(err, "GalleriesView") })

   const username = computed(() => route.params.id == Defaults.SITE_ID ? null : userStore.getUsername(route.params.id))

   const showChildGalleries = computed({ 
      get() { return viewStore.showChildGalleries },
      set(showChild) { viewStore.setShowChildGalleries(showChild) } 
   })

   const visibleGalleries = computed(() => { 
      // user can see their own galleries
      const allGalleries = (route.params.id == userStore.userId) ? [] : [...galleryStore.myGalleries]
      const galleryIds = new Set()
      for (const gallery of allGalleries) { galleryIds.add(gallery.id) }
      
      const publicGalleries = route.params.id == Defaults.SITE_ID ? galleryStore.publicGalleries : galleryStore.getPublicGalleries(route.params.id) 
      for (const gallery of publicGalleries) {
         if (!galleryIds.has(gallery.id)) { allGalleries.push(gallery) }
      }   

      const galleries = []     
      for (const gallery of allGalleries) {
         if (gallery.images.length && viewMgr.galleryThumbVisibleToUser(gallery)) { galleries.push(gallery) }
      }   
      return galleries
   })

   const thumbGalleries = computed(() => { 
      // console.log("GalleriesView.thumbGalleries")
      const galleries = []     
      for (const gallery of visibleGalleries.value) {
         if (showChildGalleries.value || !gallery.parentGalleryId) { galleries.push(gallery) }
      }  
      
      if (sort.value == SortBy.DATE) { galleries.sort(function(a, b) { return b.dateContentModified - a.dateContentModified }) }
      else { galleries.sort(function(a, b) { return a.name.localeCompare(b.name) }) }
      return galleries
   })
   
   // const editInPlace = computed(() => viewStore.editInPlace && (userStore.userId == gallery.value.userId) )
   // const editBackgroundStyle = computed(() => { return editInPlace.value ? backgroundColorStyle(gallery.value.state) : "" })
</script>

<style>
</style>
