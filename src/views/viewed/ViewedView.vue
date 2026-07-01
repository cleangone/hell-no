<template>
   <v-container class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isDeskTop" class="title">{{ title }}</div>
         </v-col>
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ViewedSortButton class="mr-2"/>
            <ThumbSizeButton class="mr-2"/>
            <ItemThumbConfig/>
         </v-col>
      </v-row>
   </v-container>
   <v-container style="width: 100%">
      <v-row justify="space-around">
         <ItemThumb v-for="item in displayItems" :key="item.id" :item="item" :origin="ItemOrigin.VIEWED" 
            showDateViewed :tight="viewMgr.isMobile"/>
      </v-row>
   </v-container>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemThumb        from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig  from '@/components/item/thumb/ItemThumbConfig.vue'
   import ThumbSizeButton  from '@/components/util/ThumbSizeButton.vue'  
   import ViewedSortButton from './ViewedSortButton.vue'  
   import { ItemOrigin, Route } from '@/utils/constants'
   
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const title        = computed(() => viewStore.sortRecentViewed ? "Recent Viewed" : "Least Recent Viewed")
   const displayItems = computed(() => viewStore.sortRecentViewed ? recentViewedItems.value : oldestViewedItems.value)
   
   const recentViewedItems = computed(() => {
      const items = itemMgr.recentViewedPublicItems
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      return viewStore.setVisibleItems(ItemOrigin.VIEWED, "Recent Viewed", Route.VIEWED.url, ungroupedItems)
   })

   const oldestViewedItems = computed(() => recentViewedItems.value.toSorted(function(a, b) {return a.dateViewed - b.dateViewed}))
</script>

<style>
</style>
