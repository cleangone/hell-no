<template>
   <v-container class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isDeskTop" class="title">
               Recent Updates <PlayItems :items="recentItems" buttonClass="mb-1"/>
            </div>
            <RouterLink v-if="username" :to="URL.USER + route.params.id">{{ username }}</RouterLink>
         </v-col>
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ItemThumbConfig :origin="ItemOrigin.RECENT"/>
         </v-col>
      </v-row>
   </v-container>
   <v-container style="width: 100%">
      <v-row justify="space-around">
         <ItemThumb v-for="item in recentItems" :key="item.id" :item="item" :origin="ItemOrigin.RECENT"/>
      </v-row>
   </v-container>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRoute } from 'vue-router'
   import { useUserStore } from '@/stores/userStore'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import PlayItems       from '@/components/item/PlayItems.vue'
   import ItemThumb       from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig from '@/components/item/thumb/ItemThumbConfig.vue'
   import { Defaults, ItemOrigin, URL } from '@/utils/constants'
   
   const route = useRoute()
   const userStore = useUserStore()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const username = computed(() => route.params.id == Defaults.SITE_ID ? null : userStore.getUsername(route.params.id))
   
   const recentItems = computed(() => {
      let items = [] 
      if (viewMgr.solo) { items = [ ...itemMgr.myRecentItems ] }
      else if (username.value) { items = [ ...itemMgr.getRecentItems(route.params.id) ] }
      else { items = [ ...itemMgr.recentPublicItems, ...itemMgr.recentGroupMemberItems ] }

      items.sort(function(a, b){return b.dateContentModified - a.dateContentModified})    

      const displayItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      const visibleItems = []
      for (const item of displayItems) {
         if (viewMgr.itemIsVisibleToUser(item)) { visibleItems.push(item) }
      }

      return viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates", URL.RECENT + route.params.id, visibleItems)
   })
</script>

<style>
</style>
