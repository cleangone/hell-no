<template>
   <v-btn color="blue-darken-2" size="small" variant="text">{{ props.text }}</v-btn>
</template>

<script setup>
   const props = defineProps({ text: String })
</script>
