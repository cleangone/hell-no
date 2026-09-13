<template>
   <HorizontalDiv>
      <RouterLink :to="userUrl">
         <AvatarImage :image="userImage" class="pa-1 bg-black"/>
      </RouterLink>
      <div class="ml-2 mb-2 d-flex flex-column align-start justify-center">
         <RouterLink :to="userUrl">
            <div>{{ username }}</div>
         </RouterLink>
         <div class="mt-n1">{{ itemCount ? "(" + itemCount + ")" : "&nbsp" }}</div>
      </div>
   </HorizontalDiv>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemStore }  from '@/stores/itemStore'
   import { useImageMgr }   from '@/stores/image/imageMgr'
   import AvatarImage       from '@/components/user/avatar/AvatarImage.vue'
   import HorizontalDiv     from '@/components/util/HorizontalDiv.vue'
   import { Route } from '@/utils/constants'

   const props = defineProps({ user: Object, dense:Boolean })
   
   const DEFAULT_IMAGE = { thumbUrl: "/images/user-hell-no.png" }
   const itemStore = useItemStore()
   const imageMgr  = useImageMgr()
   
   const userUrl  = computed(() =>  props.user ? Route.USER.url + props.user.id :  Route.HOME.url)
   const username = computed(() => props.user ? props.user.username : "" ) 

   // overlap with userMgr
   const userImage = computed(() => { 
      if (props.user?.images?.length) {
         for (const imageSet of props.user.images) {
            if (imageMgr.isActiveUserImage(imageSet)) { return imageSet }
         }
      }
      return DEFAULT_IMAGE
   }) 

   const itemCount = computed(() => props.user ? itemStore.getUserPubicItems(props.user.id).length : 0)
</script>

<style>
</style>
