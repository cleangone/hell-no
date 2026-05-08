import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import algoliasearch     from 'algoliasearch/lite'
import { AlgoliaConfig } from '@/config/config'
import { useItemStore }  from '@/stores/itemStore'
import { useViewStore }  from '@/stores/viewStore'
import { isPublic }      from '@/utils/utils' 
import { ItemOrigin, Route } from '@/utils/constants'
   
export const useSearchMgr = defineStore('searchMgr', () => {   
   const searchClient = algoliasearch(AlgoliaConfig.applicationId, AlgoliaConfig.searchApiKey)
   const searchIndex  = searchClient.initIndex(AlgoliaConfig.indexName)
   const itemStore = useItemStore()
   const viewStore = useViewStore()
   
   function search(query) { 
      viewStore.setSearchQuery(query)
      searchIndex.search(query, {hitsPerPage: 250}).then(({ hits }) => {
         const items = []
         for (const hit of hits) {
            const item = itemStore.itemIdToItem.get(hit.objectID)
            if (isPublic(item)) { items.push(item) }
         }
         viewStore.setSearchItems(items)
      })
   }

   return { search }
})
