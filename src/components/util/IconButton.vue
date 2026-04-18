<template>
   <v-btn :icon="props.icon"  variant="text" :disabled="props.disabled" :size="size" :density="density" class="icon-btn"></v-btn>
</template>

v-tooltip="'Your Text'"
<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ icon:String, disabled:Boolean, size:String, density:String })
   
   const size    = computed(() => props.size    ? props.size    : "small")
   const density = computed(() => props.density ? props.density : "default")
</script>