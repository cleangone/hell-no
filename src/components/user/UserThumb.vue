<template>
   <HorizontalDiv>
      <AvatarImage :image="userImage" @click="onImageClick()" class="hand pa-1"
         :class="isSelected?'bg-blue':'bg-black'"/>
      <div class="ml-2 mb-2 d-flex flex-column align-start justify-center">
         <RouterLink :to="userUrl">
            <div>{{ username }}</div>
         </RouterLink>
         <div class="mt-n1">{{ displayInfo ?? "&nbsp" }}</div>
      </div>
   </HorizontalDiv>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRouter }   from 'vue-router'
   import { useImageMgr } from '@/stores/image/imageMgr'
   import AvatarImage     from '@/components/user/avatar/AvatarImage.vue'
   import HorizontalDiv   from '@/components/util/HorizontalDiv.vue'
   import { Emit, Route } from '@/utils/constants'

   const props = defineProps({ user: Object, isSelected: Boolean, emitSelect: Boolean })
   const emit  = defineEmits([ Emit.SELECT ])
   
   const DEFAULT_IMAGE = { thumbUrl: "/images/user-hell-no.png" }
   const router   = useRouter()
   const imageMgr = useImageMgr()
   
   const userUrl     = computed(() => Route.USER.url + props.user.id)
   const username    = computed(() => props.user.username) 
   const displayInfo = computed(() => props.user.displayInfo ?? null)
   
   // overlap with userMgr
   const userImage = computed(() => { 
      if (props.user.images?.length) {
         for (const imageSet of props.user.images) {
            if (imageMgr.isActiveUserImage(imageSet)) { return imageSet }
         }
      }
      return DEFAULT_IMAGE
   }) 

   const onImageClick = () => { 
      if (props.emitSelect) { emit(Emit.SELECT) }
      else { router.push(userUrl.value) }
   }
</script>

<style>
</style>
