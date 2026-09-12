<template>
   <v-row no-gutters class="flex-nowrap">
      <v-col cols="1" class="flex-grow-0 flex-shrink-0"/>
      <v-col cols="10" class="title flex-grow-1 flex-shrink-0">
         {{ groupName }} 
      </v-col>
      <v-col cols="1" class="d-flex justify-end align-center flex-grow-0 flex-shrink-0">
         <ItemThumbConfig :origin="ItemOrigin.GROUP" :additionalFields="ThumbConfigFields"/> 
         <EditButton v-if="canEdit" @click="showEditDialog=true" class="mr-n2"/>          
      </v-col>
   </v-row>

   <v-container>
      <v-row justify="space-around" class="mt-4">
         <UserThumb v-for="user in users" :key="user.id" :user="user" class="mr-5 mb-5"/>
      </v-row>
   </v-container>
   <v-container>
      <v-row justify="space-around" class="mb-4" >
         <!-- <ItemThumb v-for="item in viewItems" :key="item.id" :item="item" :origin="ItemOrigin.GROUP"/> -->
      </v-row>
   </v-container>

   <v-dialog v-model="showEditDialog" width="75%" height="90%">
      <EditGroupDialog :groupId="group.id" @done="showEditDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRoute } from 'vue-router'
   import { useGroupStore } from '@/stores/groupStore'
   import { useUserStore }  from '@/stores/userStore'
   // import { useFeedStore }  from '@/stores/feedStore'
   import { useViewStore }  from '@/stores/viewStore'
   import EditGroupDialog   from '@/components/group/EditGroupDialog.vue'
   import ItemThumb         from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig   from '@/components/item/thumb/ItemThumbConfig.vue'
   import UserThumb         from '@/components/user/UserThumb.vue'
   import EditButton        from '@/components/util/EditButton.vue'
   import { ItemOrigin, Route } from '@/utils/constants'
    
   const SHOW_MY_ITEMS = "Show my items"
   const ThumbConfigFields = [{ title: SHOW_MY_ITEMS, value: true }]
   const route = useRoute()
   const groupStore = useGroupStore()
   const userStore  = useUserStore()
   // const feedStore  = useFeedStore()
   const viewStore  = useViewStore()
   const showEditDialog = ref(false)
   
   const group     = computed(() => groupStore.getMyGroup(route.params.id) )
   const groupName = computed(() => group.value ? group.value.name : "" )
   // const groupFeed = computed(() => feedStore.getMyGroupFeed(route.params.id) )  
   const canEdit = computed(() => group.value && userStore.userId && group.value.ownerId == userStore.userId)
   const users   = computed(() => group.value ? group.value.userIds.map(userId => userStore.getUser(userId)) : [])

   // const viewItems = computed(() => { 
   //    const feedItems = groupFeed.value ? groupFeed.value.feedItems : []
   //    let items = feedItems
   //    if (!viewStore.visibleThumbFields.get(ItemOrigin.GROUP).includes(SHOW_MY_ITEMS)) {
   //       items = []
   //       for (const feedItem of feedItems) { 
   //          if (feedItem.userId != userStore.userId) { items.push(feedItem) }
   //       }
   //    }

   //    return viewStore.setVisibleItems(ItemOrigin.GROUP, group.value.name, Route.GROUP.url + route.params.id, items) 
   // })
</script>

<style>
</style>