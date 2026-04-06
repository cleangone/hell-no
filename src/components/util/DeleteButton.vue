<template>
   <IconButton icon="mdi-trash-can" :disabled="props.disabled"></IconButton>
</template>

<script setup>
   import IconButton from './IconButton.vue'
   const props = defineProps({disabled: Boolean})
</script>