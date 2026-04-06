<template>
   <div v-if="showFeeds" class="text-left">
      <div class="text-h5">
         Feeds
      </div>
      <v-data-table :headers="headers" :items="feeds" :custom-key-sort="customKeySort" density="compact">
         <template v-slot:item.items="{ item }">
            <a @click="showFeedItems(item)" class="hand">{{ item.items }}</a>
         </template>
         <template v-slot:item.dateCreated="{ item }"> {{ defaultDateString(item.dateCreated) }}</template>
         <template v-slot:item.dateModified="{ item }">{{ defaultDateString(item.dateModified)}}</template>
      </v-data-table>
   </div>
   <div v-else class="text-left">
      <AdminFeedItems :feedId="selectedFeed.id" :name="selectedFeed.name" @done="showFeeds=true"/>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useFeedStore }  from '@/stores/feedStore'
   import { useUserStore }  from '@/stores/userStore'
   import { useUserMgr }    from '@/stores/userMgr'
   import { useGroupStore } from '@/stores/groupStore'
   import AdminFeedItems from './AdminFeedItems.vue'
   import { defaultDateString } from '@/utils/dateUtils'
   import { FeedType } from '@/utils/constants'
   
   const feedStore = useFeedStore()
   const userStore = useUserStore()
   const userMgr   = useUserMgr()
   const groupStore = useGroupStore()
   const showFeeds = ref(true)
   const selectedFeed = ref({})
   
   const headers = [
      { title: 'User',     key: 'user',         value: 'user' },
      { title: 'Group',    key: 'group',        value: 'group' },
      { title: 'Items',    key: 'items',                               align: 'center' },
      { title: 'Created',  key: 'dateCreated',  value: 'dateCreated',  align: 'center' },
      { title: 'Modified', key: 'dateModified', value: 'dateModified', align: 'center' },
   ]

   const customKeySort = {
      // user:         (a, b) => { return a.localeCompare(b) }, 
      // dateModified: (a, b) => { return b - a },    
   } 

   const feeds = computed(() => { 
      const displayFeeds = []       
      for (const feed of feedStore.feeds) {
         const displayFeed = { ...feed }
         if (feed.type == FeedType.GROUP) { 
            const group = groupStore.groupIdToGroup.get(feed.id) 
            displayFeed.name = group ? group.name : "Group"
            displayFeed.group = displayFeed.name
         }
         else if (feed.type == FeedType.USER) { 
            const user = userStore.userIdToUser.get(feed.id) 
            const fullName = userMgr.getFullName(user)
            displayFeed.name = fullName ? fullName : "User"
            displayFeed.user = displayFeed.name 
         }
        
         displayFeed.items = feed.feedItems.length

         displayFeeds.push(displayFeed)
      }
      return displayFeeds
   })

   const showFeedItems = (feed) => {
      selectedFeed.value = feed
      showFeeds.value = false
   }
</script>

<style>
</style>
