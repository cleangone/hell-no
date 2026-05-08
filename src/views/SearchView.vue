<template>
   <v-container v-if="viewMgr.isDeskTop" class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="2" class="flex-grow-0 flex-shrink-0"/>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div class="title">Search</div>
         </v-col>
         <v-col cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ItemThumbConfig showSort/>
         </v-col>
      </v-row>
   </v-container>
   <v-row class="d-flex justify-start align-center mx-1">
      <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" placeholder="Search" density="compact" @keyup.enter="search()" class="search"/>
      <BlueBtn text="Search" @click="search()" :disabled="!validQuery" class="ml-2 mb-4"/>
   </v-row>
   <!-- <div v-if="userStore.userExists" class="text-left mb-4">
      <BlueBtn v-if="showSave" text="Save Search" @click="saveQuery()"/>
      <BlueBtn v-if="isSavedQuery" text="Remove Saved" @click="removeSavedQuery()"/>
      <TextButton v-for="query in savedQueries" @click="useQuery(query)" :text="query"/>
   </div> -->
   <v-container class="mt-4">
      <v-row justify="space-around">
         <ItemThumb v-for="item in sortedItems" :key="item.id" :item="item" :origin="ItemOrigin.SEARCH"/>
      </v-row>
   </v-container>
 </template>
 
<script setup>
   import { computed, onMounted, ref } from 'vue'
   // import { useUserStore } from '@/stores/userStore'
   import { useSearchMgr } from '@/stores/searchMgr'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemThumb       from '@/components/item/thumb/ItemThumb.vue'
   import BlueBtn         from '@/components/util/BlueBtn.vue'
   // import TextButton      from '@/components/util/TextButton.vue'
   import ItemThumbConfig from '@/components/item/thumb/ItemThumbConfig.vue'
   import { ItemOrigin, ItemThumbOptions, Route } from '@/utils/constants'
   
   // const userStore = useUserStore()
   const searchMgr = useSearchMgr()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   // const savedQueries = ref([])

   // onMounted(() => {
   //    // console.log("onMounted")
   //    if (userStore.userExists && userStore.mySettings.searches) { 
   //       savedQueries.value = [ ...userStore.mySettings.searches ] 
   //    } 
   // })

   const searchQuery = computed({ 
      get() { return viewStore.searchQuery },
      set(query) { viewStore.setSearchQuery(query) }
   })

   const validQuery = computed(() => searchQuery.value?.length > 1)
   // const isSavedQuery = computed(() => savedQueries.value.includes(searchQuery.value))
   // const showSave = computed(() => validQuery.value && !isSavedQuery.value)

   // const saveQuery = () => { 
   //    const sortedQueries = [ ...savedQueries.value, searchQuery.value ] 
   //    sortedQueries.sort((a, b) => a.localeCompare(b))
   //    savedQueries.value = [ ...sortedQueries ]
      
   //    updateSettings()
   // } 

   // const removeSavedQuery = () => { 
   //    const index = savedQueries.value.indexOf(searchQuery.value)
   //    if (index != -1) { 
   //       savedQueries.value.splice(index, 1) 
   //       updateSettings()
   //    }
   // } 

   // const updateSettings = () => { 
   //    if (userStore.userExists) {
   //       const mySettings = { ...userStore.mySettings }
   //       mySettings.searches = [ ...savedQueries.value ]
   //       userStore.updateSettings(mySettings) 
   //    }
   // } 

   // const useQuery = (query) => { 
   //    searchQuery.value = query
   //    search()
   // }

   const search = () => { if (validQuery.value) { searchMgr.search(searchQuery.value) }}

   const sortByName = computed(() => viewStore.itemThumbOptions.includes(ItemThumbOptions.SORT_BY_NAME))
   const sortByDate = computed(() => viewStore.itemThumbOptions.includes(ItemThumbOptions.SORT_BY_DATE))
   const sortedItems = computed(() => {
      const items = [ ...viewStore.searchItems ]    
      if (items.length) {
         if (sortByName.value)      { items.sort((a, b) => a.name.localeCompare(b.name)) }
         else if (sortByDate.value) { items.sort((a, b) => b.dateModified - a.dateModified) }
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
