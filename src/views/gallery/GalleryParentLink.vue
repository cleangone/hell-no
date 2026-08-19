<template>
   <span>
      <RouterLink v-if="gallery.parentGalleryId" :to="Route.GALLERY.url + gallery.parentGalleryId">{{ parentGalleryName }} Gallery</RouterLink>
      <RouterLink v-else-if="viewMgr.solo" :to="Route.GALLERIES.url + Defaults.SITE_ID">Galleries</RouterLink>
      <RouterLink v-else :to="Route.GALLERIES.url + galleriesLinkId">{{ usernamePossessive }} Galleries</RouterLink>
   </span>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import { possessive } from '@/utils/utils'
   import { Defaults, Route } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object })
   
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const viewMgr      = useViewMgr()
   
   const galleriesLinkId    = computed(() => props.gallery ? props.gallery.userId : "0")
   const parentGallery      = computed(() => galleryStore.getGallery(props.gallery.parentGalleryId))
   const parentGalleryName  = computed(() => parentGallery.value ? parentGallery.value.name : "")
   const galleryUsername    = computed(() => userStore.getUsername(props.gallery.userId))
   const usernamePossessive = computed(() => possessive(galleryUsername.value))
</script>

<style>
</style>
