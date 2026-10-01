<template>
   <v-icon :icon="props.icon" :size="size" class="icon-shake-on-load icon-btn"/>            
</template>

<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ icon: String, size: String })

   const size = computed(() => props.size ?? "med")
</script>

<style>
@keyframes icon-shake {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-15deg); }
  30% { transform: rotate(12deg); }
  45% { transform: rotate(-10deg); }
  60% { transform: rotate(8deg); }
  75% { transform: rotate(-4deg); }
}
.icon-shake-on-load {
  animation: icon-shake 0.8s ease-in-out;
  animation-iteration-count: 3; 
  transform-origin: center; 
}
</style>