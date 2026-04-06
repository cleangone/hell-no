<template>
   <v-img :src="item.primaryImage.url" contain ref="fullscreenEle" @click="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useFullscreen } from '@vueuse/core'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ item: Object })
   const emit  = defineEmits([ Emit.DONE ])

   const fullscreenEle = ref(null)
   const { toggle: fullscreenToggle } = useFullscreen(fullscreenEle)  

   onMounted(async() => {
      fullscreenToggle()
   })

</script>

