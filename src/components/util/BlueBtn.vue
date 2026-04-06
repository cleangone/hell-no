<template>
   <v-btn color="blue-darken-2" flat size="small">{{ props.text }}</v-btn>
</template>

<script setup>
   const props = defineProps({ text: String })
</script>
