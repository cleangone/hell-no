<template>
   <v-container class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isDeskTop" class="title">My Favorites</div>
            <RouterLink v-if="username" :to="Route.USER.url + route.params.id">{{ username }}</RouterLink>
         </v-col>
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ExpandItems :items="favoriteItems" buttonClass="mb-1"/>
            <ItemThumbConfig/>
         </v-col>
      </v-row>
   </v-container>
   <v-container style="width: 100%">
      <v-row justify="space-around">
         <ItemThumb v-for="item in favoriteItems" :key="item.id" :item="item" :origin="ItemOrigin.FAVORITES" :tight="viewMgr.isMobile"/>
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
   import ExpandItems     from '@/components/item/ExpandItems.vue'
   import ItemThumb       from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig from '@/components/item/thumb/ItemThumbConfig.vue'
   import { Defaults, ItemOrigin, Route } from '@/utils/constants'
   
   const route = useRoute()
   const userStore = useUserStore()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const username = computed(() => route.params.id == Defaults.SITE_ID ? null : userStore.getUsername(route.params.id))
   
   const favoriteItems = computed(() => {
      const visibleItems = []
      if (userStore.userExists && userStore.user.favoriteItems) {
         const favoriteItemIds = userStore.user.favoriteItems
         const items = itemMgr.getItems(favoriteItemIds)
         const ungroupedItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
         for (const item of ungroupedItems) { 
            if (viewMgr.itemIsVisibleToUser(item)) { visibleItems.push(item) }
         }
      }
      return viewStore.setVisibleItems(ItemOrigin.FAVORITES, "My Favorites", Route.FAVORITES.url, visibleItems)
   })
</script>

<style>
</style>
