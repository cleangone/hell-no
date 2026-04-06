<template>
   <v-icon :icon="props.icon" :color="color" class="pointer"/>    
</template>

<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ icon: String, stateColors: Array, stateIndex: Number })
   
   const color = computed(() => props.stateColors[props.stateIndex])
</script>