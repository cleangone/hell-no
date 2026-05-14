<template>
   <div class="text-left mt-2">
      <EditItem :item="item" @done="router.back()"/>
   </div>
</template>

<script setup>
   import { computed } from 'vue'
   import { useRoute, useRouter } from 'vue-router'
   import { useItemStore } from '@/stores/itemStore'
   import EditItem from '@/components/item/crud/EditItem.vue'
   
   const route = useRoute()
   const router = useRouter()
   const itemStore = useItemStore()
   
   const item = computed(() => itemStore.getItem(route.params.id))
</script>

<style>
</style>
