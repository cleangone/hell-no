<template>
   <v-icon :icon="props.icon" class="icon-btn"/>            
</template>

 <!-- color="blue-darken-2" -->
<script setup>
   const props = defineProps({icon: String})
</script>