<template>
   <v-row no-gutters class="flex-nowrap">
      <v-col cols="1" class="flex-grow-0 flex-shrink-0"/>
      <v-col cols="10" class="title flex-grow-1 flex-shrink-0">
         {{ groupName }} 
      </v-col>
      <v-col cols="1" class="d-flex flex-grow-0 flex-shrink-0 align-center justify-end">
         <div> <!-- in a div to minimize active button background -->
            <ItemThumbConfig :origin="ItemOrigin.GROUP" :additionalFields="ThumbConfigFields"/>
         </div>
      </v-col>
   </v-row>
   <v-container>
      <v-row justify="space-around" class="mb-4" >
         <ItemThumb v-for="item in viewItems" :key="item.id" :item="item" :origin="ItemOrigin.GROUP"/>
      </v-row>
   </v-container>
</template>

<script setup>
   import { computed } from 'vue'
   import { useRoute } from 'vue-router'
   import { useGroupStore } from '@/stores/groupStore'
   import { useUserStore }  from '@/stores/userStore'
   import { useFeedStore }  from '@/stores/feedStore'
   import { useViewStore }  from '@/stores/viewStore'
   import ItemThumb       from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig from '@/components/item/thumb/ItemThumbConfig.vue'
   import { ItemOrigin, URL } from '@/utils/constants'
    
   const SHOW_MY_ITEMS = "Show my items"
   const ThumbConfigFields = [{ title: SHOW_MY_ITEMS, value: true }]
   const route = useRoute()
   const groupStore = useGroupStore()
   const userStore  = useUserStore()
   const feedStore  = useFeedStore()
   const viewStore  = useViewStore()

   const group     = computed(() => groupStore.getMyGroup(route.params.id) )
   const groupName = computed(() => group.value ? group.value.name : "" )
   const groupFeed = computed(() => feedStore.getMyGroupFeed(route.params.id) )
   
   const viewItems = computed(() => { 
      const feedItems = groupFeed.value ? groupFeed.value.feedItems : []
      let items = feedItems
      if (!viewStore.visibleThumbFields.get(ItemOrigin.GROUP).includes(SHOW_MY_ITEMS)) {
         items = []
         for (const feedItem of feedItems) { 
            if (feedItem.userId != userStore.userId) { items.push(feedItem) }
         }
      }

      return viewStore.setVisibleItems(ItemOrigin.GROUP, group.value.name, URL.GROUP + route.params.id, items)
   })
</script>

<style>
</style>