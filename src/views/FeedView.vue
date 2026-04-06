<template>
   <v-container>
      <v-row no-gutters class="flex-nowrap">
         <v-col cols="2" class="flex-grow-0 flex-shrink-0  align-self-end">
            <div v-if="savedFeedItemsExist">
               <TextButton v-if="showSavedFeedItems" @click="setShowSavedFeedItems(false)" text="Show Incoming"></TextButton>
               <TextButton v-else @click="setShowSavedFeedItems(true)" text="Show Saved"></TextButton>
            </div>
         </v-col>
         <v-col cols="8" class="flex-grow-1 flex-shrink-0">
            <div v-if="viewMgr.isDeskTop" class="title"> 
               {{ showSavedFeedItems ? "Saved Feed Items" : "Feed" }}
            </div>
         </v-col>
         <v-col cols="2" class="flex-grow-0 flex-shrink-0 align-self-end">
            <TextButton v-if="showMyItems" @click="showMyItems=false" text="Hide my items"></TextButton>
            <TextButton v-else @click="showMyItems=true" text="Show my items"></TextButton>
         </v-col>
      </v-row>
   </v-container>

   <v-container>
      <v-row justify="space-around" class="mb-md-4 mt-4" >
         <ItemThumb v-for="item in displayItems" :key="item.id" :item="item" :origin="ItemOrigin.FEED"/>
      </v-row>
   </v-container>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { useUserStore }  from '@/stores/userStore'
   import { useFeedMgr }    from '@/stores/feedMgr'
   import { useViewStore }  from '@/stores/viewStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import ItemThumb  from '@/components/item/thumb/ItemThumb.vue'
   import TextButton from '@/components/util/TextButton.vue'
   import { ItemOrigin, URL } from '@/utils/constants'
  
   const userStore = useUserStore()
   const feedMgr   = useFeedMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const showMyItems = ref(true)

   const savedFeedItemsExist = computed(() => feedMgr.myFeed?.savedItems?.length ? true : false)
   const showSavedFeedItems = computed(() => savedFeedItemsExist.value && viewStore.showSavedFeedItems)
   const setShowSavedFeedItems = (showSaved) => { viewStore.setShowSavedFeedItems(showSaved) }
   
   const feedItems = computed(() => {
      let items = []
      if (feedMgr.myFeed) { items = showSavedFeedItems.value ? feedMgr.myFeed.savedItems : feedMgr.myFeed.feedItems }
      return items ? items : []
   })

   const displayItems = computed(() => { 
      const dispItems = []
      if (showMyItems.value) { dispItems.push( ...feedItems.value)  }
      else {
         for (const item of feedItems.value) {
            if (item.userId != userStore.userId) { dispItems.push(item) }
         } 
      }
      return viewStore.setVisibleItems(ItemOrigin.FEED, "Feed", URL.FEED, dispItems)
   })
</script>

<style>
</style>
