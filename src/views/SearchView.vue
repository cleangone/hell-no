<template>
   <div v-if="viewMgr.isDeskTop" class="title">Search</div>
   <!-- <v-row class="d-flex justify-start align-center mx-1">
      <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" placeholder="Search" density="compact" @keyup.enter="search()" class="search"/>
      <BlueBtn text="Search" @click="search()" :disabled="!validQuery" class="ml-2 mb-4"/>
   </v-row>
   <div v-if="userStore.userExists " class="text-left">
      <BlueBtn v-if="showSave" text="Save Search" @click="saveQuery()"/>
      <BlueBtn v-if="isSavedQuery" text="Remove Saved" @click="removeSavedQuery()"/>
      <TextButton v-for="query in savedQueries" @click="useQuery(query)" :text="query"/>
   </div>
   <div v-if="searchItems.length" class="text-left">
      Sort by
      <v-btn-toggle v-model="sortBy" color="blue-darken-2" group style="height: 30px" class="my-3">
          <v-btn :value="SortOptions.NAME" size="small">{{ SortOptions.NAME }}</v-btn>
          <v-btn :value="SortOptions.DATE" size="small">{{ SortOptions.DATE }}</v-btn>
      </v-btn-toggle>
   </div> -->
   <!-- <v-container>
      <v-row justify="space-around">
         <ItemThumb v-for="item in sortedItems" :key="item.id" :item="item" :origin="ItemOrigin.SEARCH"/>
      </v-row>
   </v-container> -->
 </template>
 
<script setup>
   import { computed, onMounted, ref } from 'vue'
   // import algoliasearch from 'algoliasearch/lite'
   // import { AlgoliaConfig } from '@/config/config'
   // import { useUserStore } from '@/stores/userStore'
   // import { useItemStore } from '@/stores/itemStore'
   // import { useViewStore } from '@/stores/viewStore'
   // import { useViewMgr }   from '@/stores/viewMgr'
   // import ItemThumb  from '@/components/item/thumb/ItemThumb.vue'
   // import BlueBtn    from '@/components/util/BlueBtn.vue'
   // import TextButton from '@/components/util/TextButton.vue'
   // import { ItemOrigin, URL } from '@/utils/constants'
   
   // const SortOptions = { NAME: "Name",  DATE: "Date" }
   // const userStore = useUserStore()
   // const itemStore = useItemStore()
   // const viewStore = useViewStore()
   // const viewMgr   = useViewMgr()
   // const searchClient = algoliasearch(AlgoliaConfig.applicationId, AlgoliaConfig.searchApiKey)
   // const searchIndex  = searchClient.initIndex(AlgoliaConfig.indexName)
   // const searchQuery = ref("")
   // const savedQueries = ref([])
   // const searchItems = ref([])
   // const sortBy = ref(SortOptions.NAME)

   // onMounted(() => {
   //    // console.log("onMounted")
   //    if (userStore.userExists && userStore.mySettings.searches) { 
   //       savedQueries.value = [ ...userStore.mySettings.searches ] 
   //    } 

   //    const visibleItems = viewStore.getVisibleItems(ItemOrigin.SEARCH)
   //    // console.log("visibleItems", visibleItems)
   //    if (visibleItems) { 
   //       searchItems.value = [ ...visibleItems.items ] 
   //       if (viewStore.searchQuery) { searchQuery.value = viewStore.searchQuery }
   //    }
   // })

   // const validQuery = computed(() => searchQuery.value.length && searchQuery.value.length > 1)
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

   // const search = () => { 
   //    // console.log("search", searchQuery.value)
   //    if (validQuery.value) {
   //       searchIndex.search(searchQuery.value, {hitsPerPage: 250}).then(({ hits }) => {
   //          // console.log("hits", hits)
   //          const items = []
   //          for (const hit of hits) {
   //             const item = itemStore.itemIdToItem.get(hit.objectID)
   //             if ((viewMgr.solo && item.userId == userStore.userId) || !viewMgr.solo && viewMgr.itemIsVisibleToUser(item)) {
   //                items.push(item)
   //             }
   //          }
   //          searchItems.value = [ ...items ]
   //       })
   //    }
   // }

   // const sortedItems = computed(() => {
   //    // console.log("sortedItems - searchItems", searchItems.value)
   //    const items = [ ...searchItems.value ]
   //    if (items.length) {
   //       if (sortBy.value == SortOptions.NAME)      { items.sort((a, b) => a.name.localeCompare(b.name)) }
   //       else if (sortBy.value == SortOptions.DATE) { items.sort((a, b) => b.dateModified - a.dateModified) }
         
   //       viewStore.setVisibleItems(ItemOrigin.SEARCH, "Search Results", URL.SEARCH, items)
   //       viewStore.setSearchQuery(searchQuery.value)
   //    }
   //    return items
   // })
</script>

<style>
.search {
   max-width: 400px;
}
</style>
