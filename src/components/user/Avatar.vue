<template>
   <img :src="image.thumbUrl" class="avatar" :style="style" />
</template>

<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ image: Object, size: Number })
   
   const size  = computed(() => props.size ?? 75)
   const style = computed(() =>  "width:" + size.value + "px; height:" + size.value + "px;")
</script>

<style>
.avatar {
   border-radius: 50%; 
   object-fit: cover;
}
</style>
