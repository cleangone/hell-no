<template>
   <v-card :height="height" flat class="group-card">
      <v-img :src="src" :height="height" :width="width" class="image-tails"/>  
   </v-card>
</template>

<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ src: String, height: Number })
   const width = computed(() => props.height * 4 / 3) // todo - make constant shared by Cropper
</script>

<style>
</style>
