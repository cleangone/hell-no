<template>
   <div class="mt-5">
      <div class="my-5">
         <span class="font-weight-bold">{{ title }}</span> |
         <RouterLink :to="linkTo">View all</RouterLink>
      </div>
      <ItemThumbsSwiper :items="items" :showDateViewed="showDateViewed"/>
   </div>
</template>

<script setup>
   import ItemThumbsSwiper from './ItemThumbsSwiper.vue'
   
   const props = defineProps({ 
      title:  String, 
      items:  Array, 
      linkTo:  String, 
      showDateViewed: Boolean })
</script>

<style>
</style>
