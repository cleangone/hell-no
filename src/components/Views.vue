<script setup>
   import { computed } from 'vue'
   import { useViewsStore } from '@/stores/viewsStore'

   const viewsStore = useViewsStore()
   const viewsDesc = computed(() => { return viewsStore.count == 1 ? 'View' : 'Views' })
</script>

<template>
   <span>{{ viewsStore.count }} {{ viewsDesc }}</span>       
</template>

