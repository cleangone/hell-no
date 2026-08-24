<template>
   <img v-if="url" :src="url" class="image-circle" :style="style"/>
</template>

<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ image: Object, size: Number })
   
   const url   = computed(() => props.image?.thumbUrl)
   const size  = computed(() => props.size ?? 50)
   const style = computed(() =>  "width:" + size.value + "px; height:" + size.value + "px;")
</script>

<style>
</style>
