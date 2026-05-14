<template>
   <div class="text-left mt-2">
      <AddItem @done="router.back()"/>
   </div>
</template>

<script setup>
   import { useRouter } from 'vue-router'
   import AddItem from '@/components/item/crud/AddItem.vue'
   
   const router = useRouter()
</script>

<style>
</style>
