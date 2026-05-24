<template>
   <img :src="image.thumbUrl" class="avatar" />
</template>

<script setup>
   const props = defineProps({ image: Object })
</script>

<style>
.avatar {
   border-radius: 50%; 
   object-fit: cover;
   width: 50px;
   height: 50px;
}
</style>
