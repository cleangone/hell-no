<template>
   <v-btn :icon="props.icon"  variant="text" :disabled="props.disabled" :color="color" :size="size" :density="density"></v-btn>
</template>

v-tooltip="'Your Text'"
<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ icon:String, disabled:Boolean, color:String, size:String, density:String })
   
   const color   = computed(() => props.color   ? props.color   : "blue-darken-2")
   const size    = computed(() => props.size    ? props.size    : "small")
   const density = computed(() => props.density ? props.density : "default")
</script>