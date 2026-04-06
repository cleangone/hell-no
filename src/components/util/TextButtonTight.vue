<template>
   <TextButton :text="props.text" density="compact" class="pa-0" style="min-width:0" />
</template>

<script setup>
   import TextButton from './TextButton.vue'
   
   const props = defineProps({ text: String })
</script>
