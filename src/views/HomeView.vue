<template>
  <main>
    <TheWelcome />
  </main>
   <div v-for="item in items">
      {{ item.name }}
   </div>
</template>

<script setup>
   import TheWelcome from '../components/TheWelcome.vue'
   import { computed, ref } from 'vue'
   import { useItemStore }    from '@/stores/itemStore'
   
   const itemStore    = useItemStore()
   
   const items = computed(() => { 
      return itemStore.items 
   })
</script>

<style>
</style>