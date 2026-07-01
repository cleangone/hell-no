<template>
   <IconButton :icon="sortIcon" @click="toggleSort()" size="med"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useViewStore } from '@/stores/viewStore'
   import IconButton from '@/components/util/IconButton.vue'
   
   const viewStore = useViewStore()

   const sortIcon = computed(() => viewStore.sortRecentViewed ? "mdi-sort-calendar-ascending" : "mdi-sort-calendar-descending")
   const toggleSort = () => { viewStore.toggleSortRecentViewed() } 
</script>