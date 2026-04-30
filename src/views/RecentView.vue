<template>
   <v-container class="mt-4 pa-0 pb-3 width-100">
      <v-row no-gutters class="d-flex align-center flex-nowrap">
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isDeskTop" class="title">Recent Updates</div>
            <RouterLink v-if="username" :to="URL.USER + route.params.id">{{ username }}</RouterLink>
         </v-col>
         <v-col v-if="viewMgr.isDeskTop" cols="2" class="d-flex flex-grow-0 flex-shrink-0 justify-end">
            <ExpandItems :items="recentItems" buttonClass="mb-1"/>
            <ItemThumbConfig/>
         </v-col>
      </v-row>
   </v-container>
   <v-container style="width: 100%">
      <v-row justify="space-around">
         <ItemThumb v-for="item in recentItems" :key="item.id" :item="item" :origin="ItemOrigin.RECENT" 
            :bypassShowUser="bypassShowUser" :tight="viewMgr.isMobile"/>
      </v-row>
   </v-container>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRoute } from 'vue-router'
   import { useUserStore }    from '@/stores/userStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useProfileStore } from '@/stores/profileStore'
   import { useViewStore }    from '@/stores/viewStore'
   import { useViewMgr }      from '@/stores/viewMgr'
   import ExpandItems     from '@/components/item/ExpandItems.vue'
   import ItemThumb       from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig from '@/components/item/thumb/ItemThumbConfig.vue'
   import { Defaults, ItemOrigin, URL } from '@/utils/constants'
   
   const route = useRoute()
   const userStore    = useUserStore()
   const itemMgr      = useItemMgr()
   const profileStore = useProfileStore()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   
   // id param can be a userId, profileId or the siteId
   const rawUser    = computed(() => userStore.getUser(route.params.id) )
   const rawProfile = computed(() => profileStore.getProfile(route.params.id)) 
   const username   = computed(() => { 
      if (route.params.id == Defaults.SITE_ID) { return null } 
      else if (rawUser.value) { return rawUser.value.username }
      else if (rawProfile.value) { return rawProfile.value.username }
      return null
   })

   const recentItems = computed(() => {
      const items = [] 
      if (username.value) { 
         const userId = rawUser.value ? rawUser.value.id : rawProfile.value.userId
         for (const item of itemMgr.getRecentItems(userId)) {
            if (rawUser.value && !item.profileId || rawProfile.value && item.profileId == rawProfile.value.id) { items.push(item) }
         }
      }
      else { items.push(...itemMgr.recentPublicItems) }

      items.sort(function(a, b){return b.dateContentModified - a.dateContentModified})    

      const displayItems = viewMgr.isMobile ? itemMgr.ungroupAndExtractItems(items) : items
      const visibleItems = []
      for (const item of displayItems) {
         if (viewMgr.itemThumbVisibleToUser(item)) { visibleItems.push(item) }
      }

      return viewStore.setVisibleItems(ItemOrigin.RECENT, "Recent Updates", URL.RECENT + route.params.id, visibleItems)
   })

   const bypassShowUser = computed(() => username.value ? true : false)
</script>

<style>
</style>
