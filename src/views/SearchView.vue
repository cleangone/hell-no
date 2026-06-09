<template>
   <v-container v-if="viewMgr.isDeskTop" class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="2" class="flex-grow-0 flex-shrink-0"/>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div class="title">Search</div>
         </v-col>
         <v-col cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <SortButton :sortByDate="sortByDate" @click="sortByDate=!sortByDate"/>
            &nbsp; <ItemThumbConfig/>
         </v-col>
      </v-row>
   </v-container>
   <v-row class="d-flex justify-start align-center mx-1">
      <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" placeholder="Search" density="compact" @keyup.enter="search()" class="search"/>
      <BlueBtn text="Search" @click="search()" :disabled="!validQuery" class="ml-2 mb-4"/>
   </v-row>
   <v-container class="mt-4">
      <v-row justify="space-around">
         <ItemThumb v-for="item in sortedItems" :key="item.id" :item="item" :origin="ItemOrigin.SEARCH"/>
      </v-row>
   </v-container>
 </template>
 
<script setup>
   import { computed, ref } from 'vue'
   import { useSearchMgr } from '@/stores/searchMgr'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemThumb        from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig  from '@/components/item/thumb/ItemThumbConfig.vue'
   import BlueBtn          from '@/components/util/BlueBtn.vue'
   import SortButton       from '@/components/util/SortButton.vue'
   import { ItemOrigin, Route } from '@/utils/constants'
   
   const searchMgr = useSearchMgr()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const sortByDate = ref(true)

   const searchQuery = computed({ 
      get() { return viewStore.searchQuery },
      set(query) { viewStore.setSearchQuery(query) }
   })

   const validQuery = computed(() => searchQuery.value?.length > 1)
  
   const search = () => { if (validQuery.value) { searchMgr.search(searchQuery.value) }}

   const sortedItems = computed(() => {
      const items = [ ...viewStore.searchItems ]    
      if (items.length) {
         if (sortByDate.value) { items.sort((a, b) => b.dateModified - a.dateModified) }
         else                  { items.sort((a, b) => a.name.localeCompare(b.name)) }
      }

      const itemViewItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      viewStore.setVisibleItems(ItemOrigin.SEARCH, "Search Results", Route.SEARCH.url, itemViewItems)
      return items
   })
</script>

<style>
.search {
   max-width: 400px;
}
</style>
