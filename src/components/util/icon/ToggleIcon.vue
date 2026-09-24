<template>
   <v-icon :icon="props.icon" :color="color" class="pointer"/>            
</template>

<script setup>
   import { computed } from 'vue'
   
   const props = defineProps({ icon: String, state: Boolean })

   const color = computed(() => props.state ? "green-darken-2" : "grey")
</script>