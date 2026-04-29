<template>
   <v-container class="mt-4 pa-0 pb-3 width-100">
      <v-row v-if="viewMgr.isDeskTop" no-gutters class="d-flex align-center flex-nowrap">
         <v-col cols="2" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isDeskTop" class="title">
               {{ artistFullName }} 
               <!-- <PlayItems :items="recentItems" buttonClass="mb-1"/> -->
            </div>
         </v-col>
         <v-col cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ItemThumbConfig/>
         </v-col>
      </v-row>
   </v-container>
   <v-container style="width: 100%">
      <v-row justify="space-around">
         <ItemThumb v-for="item in items" :key="item.id" :item="item" :origin="ItemOrigin.ARTIST" :tight="viewMgr.isMobile"/>
      </v-row>
   </v-container>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRoute } from 'vue-router'
   import { useArtistStore } from '@/stores/artistStore'
   import { useItemStore }   from '@/stores/itemStore'
   import { useViewStore }   from '@/stores/viewStore'
   import { useViewMgr }     from '@/stores/viewMgr'
   import PlayItems       from '@/components/item/PlayItems.vue'
   import ItemThumb       from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig from '@/components/item/thumb/ItemThumbConfig.vue'
   import { ItemOrigin, URL } from '@/utils/constants'
   
   const route = useRoute()
   const artistStore = useArtistStore()
   const itemStore   = useItemStore()
   const viewStore   = useViewStore()
   const viewMgr     = useViewMgr()
   
   const artistFullName = computed(() => artistStore.getFullName(route.params.id))
   
   const items = computed(() => {
      // todo - add my private and invisible items
      const allArtistIds = artistStore.getAllArtistIds(route.params.id) // all artists related by aka

      const items =  [ ...itemStore.getArtistPublicItems(allArtistIds) ]
      const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      ungroupedItems.sort((a, b) => a.name.localeCompare(b.name))
      return viewStore.setVisibleItems(ItemOrigin.ARTIST, "Artist", URL.ARTIST + route.params.id, ungroupedItems)
   })
</script>

<style>
</style>
