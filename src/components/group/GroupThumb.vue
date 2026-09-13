<template>
   <v-card :height="height" :class="cardMargin" class="group-card d-flex flex-column thumb-link">
      <HorizontalDiv>
         <RouterLink v-if="image" :to="groupUrl" class="d-block flex-grow-1"> <!-- class keeps RouterLink from minimizing -->
            <v-img :height="height" :width="width" :src="image.thumbUrl" class="hand image-tails"/>
         </RouterLink>
         <div class="mt-1 mr-3 d-flex flex-column justify-center">
            <div class="font-weight-bold">{{ group.name }}</div>        
            <UserDateText :date="group.dateModified" class="text-body-2"/>
         </div>
      </HorizontalDiv>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useViewMgr } from '@/stores/viewMgr'
   import HorizontalDiv  from '@/components/util/HorizontalDiv.vue'
   import UserDateText   from '@/components/util/UserDateText.vue'
   import { Emit, ImageType, Route } from '@/utils/constants'
   
   const props = defineProps({ group: Object })
   const emit  = defineEmits([ Emit.CLOSE ])
   
   const viewMgr = useViewMgr()
   
   const height     = computed(() => viewMgr.isXs ? 60 : 90)
   const width      = computed(() => height.value * 4 / 3) // todo - make constant shared by Cropper
   const cardMargin = computed(() => viewMgr.isXs ? "mb-2" : "mb-5")
   const groupUrl   = computed(() => Route.GROUP.url + props.group.id)
   
   const image = computed(() => { 
      for (const image of props.group.images) {
         if (image.active && image.imageType == ImageType.GROUP) { 
            console.log("thumbUrl", image.thumbUrl)
            return image }
      }
      return null
   })
</script>

<style>
.group-card {
   border-radius: 60px 0 0 60px !important;
   overflow: hidden; 
}
.image-tails { 
   /* cuts right edge inward */
   clip-path: polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%) !important;
   -webkit-clip-path: polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%) !important;
}
</style>
