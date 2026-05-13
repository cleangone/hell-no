<template>
   <span>
      <RouterLink v-if="gallery.parentGalleryId" :to="Route.GALLERY.url + gallery.parentGalleryId">{{ parentGalleryName }} Gallery</RouterLink>
      <RouterLink v-else :to="Route.GALLERIES.url + galleriesLinkId">{{ usernamePossessive }} Galleries</RouterLink>
   </span>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }    from '@/stores/userStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useProfileStore } from '@/stores/profileStore'
   import { Route } from '@/utils/constants'
   
   const props = defineProps({ gallery: Object })
   
   const userStore    = useUserStore()
   const galleryStore = useGalleryStore()
   const profileStore = useProfileStore()
   
   const galleriesLinkId = computed(() => {
      if (!props.gallery) { return "0" } // default if gallery not yet populated
      return props.gallery.profileId ? props.gallery.profileId : props.gallery.userId
   })

   const parentGallery      = computed(() => galleryStore.getGallery(props.gallery.parentGalleryId))
   const parentGalleryName  = computed(() => parentGallery.value ? parentGallery.value.name : "")
   const galleryUsername    = computed(() => props.gallery.profileId ? 
               profileStore.getUsername(props.gallery.profileId) : userStore.getUsername(props.gallery.userId))
   const usernamePossessive = computed(() => galleryUsername.value?.length ? 
               galleryUsername.value + (galleryUsername.value.endsWith("s") ? "'" : "'s") : "")
</script>

<style>
</style>
