import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import algoliasearch     from 'algoliasearch/lite'
import { AlgoliaConfig } from '@/config/config'
import { useItemStore }  from '@/stores/itemStore'
import { useViewStore }  from '@/stores/viewStore'
import { useViewMgr }    from '@/stores/viewMgr'
import { ItemOrigin, Route } from '@/utils/constants'
   
export const useSearchMgr = defineStore('searchMgr', () => {   
   const searchClient = algoliasearch(AlgoliaConfig.applicationId, AlgoliaConfig.searchApiKey)
   const searchIndex  = searchClient.initIndex(AlgoliaConfig.indexName)
   const itemStore = useItemStore()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   function search(query) { 
      viewStore.setSearchQuery(query)
      
      // async 
      searchIndex.search(query, {hitsPerPage: 250}).then(({ hits }) => {
         const items = []
         for (const hit of hits) {
            const item = itemStore.itemIdToItem.get(hit.objectID)
            if (viewMgr.itemIsVisibleToUser(item)) { items.push(item) }
         }
         viewStore.setVisibleItems(ItemOrigin.SEARCH, "Search Results", Route.SEARCH.url, items)
      })
   }

   return { search }
})
