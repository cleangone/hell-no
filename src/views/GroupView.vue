<template>
   <v-row v-if="!viewMgr.isXs" no-gutters class="flex-nowrap">
       <v-col cols="2" class="d-flex justify-start flex-grow-0 flex-shrink-0">
         <GroupImage v-if="groupImage" :src="groupImage.thumbUrl" :height="60" cardClass="pa-1 bg-black" class="mt-2"/>      
      </v-col>
      <v-col cols="8" class="title d-flex justify-center align-center flex-grow-1 flex-shrink-0">
         {{ groupName }} Group
      </v-col>
      <v-col cols="2" class="d-flex justify-end align-center flex-grow-0 flex-shrink-0">
         <ThumbSizeButton class="mr-2"/>
         <ItemThumbConfig :origin="ItemOrigin.GROUP"/> 
         <EditButton v-if="canEdit" @click="showEditGroupDialog=true" class="mr-n2"/>          
      </v-col>
   </v-row>
   <div class="mt-5 w-100">
      <div class="bg-shade border-md fill-height pa-3"> <!-- users -->
         <UserThumbSwiper :users="groupUsers" @userId="selectUser"/>
      </div>
      <div  class="mt-5">  <!-- chats -->
         <Chats :state="State.GROUP" :groupId="route.params.id" collapsible/>
      </div>
      <v-row v-if="!chatExpanded" class="mt-5"> <!-- items -->
         <div v-for="item in displayItems" :key="item.id" class="group-thumb">
            <ItemThumb :item="item" :origin="ItemOrigin.GROUP"/>
            <div class="group-thumb-icon" :class="thumbIconRight">
               <v-icon icon="mdi-message-image" @click="addChat(item)" color="blue-darken-2" class="hand"/> 
            </div>
         </div>
      </v-row>
   </div>

   <v-dialog v-model="showEditGroupDialog" width="75%" height="90%">
      <EditGroupCard :groupId="group.id" @done="showEditGroupDialog=false"/>
   </v-dialog>
    <v-dialog v-model="showAddChatDialog" width="auto">
      <AddChat :state="State.GROUP" :groupId="route.params.id" :item="selectedItem" @done="showAddChatDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useRoute } from 'vue-router'
   import { useUserStore }  from '@/stores/userStore'
   import { useGroupStore } from '@/stores/groupStore'
   import { useGroupMgr }   from '@/stores/groupMgr'
   import { useItemStore }  from '@/stores/itemStore'
   import { useViewStore }  from '@/stores/viewStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import EditGroupCard     from '@/components/group/EditGroupCard.vue'
   import GroupImage        from '@/components/group/thumb/GroupImage.vue'
   import ItemThumb         from '@/components/item/thumb/ItemThumb.vue'
   import ItemThumbConfig   from '@/components/item/thumb/ItemThumbConfig.vue'
   import UserThumbSwiper   from '@/components/user/thumb/UserThumbSwiper.vue'
   import Chats             from '@/components/chat/Chats.vue'
   import AddChat           from '@/components/chat/crud/AddChat.vue'
   import EditButton        from '@/components/util/EditButton.vue'
   import ThumbSizeButton   from '@/components/util/ThumbSizeButton.vue'
   import { ItemOrigin, Route, State } from '@/utils/constants'
    
   const route = useRoute()
   const userStore  = useUserStore()
   const groupStore = useGroupStore()
   const groupMgr   = useGroupMgr()
   const itemStore  = useItemStore()
   const viewStore  = useViewStore()
   const viewMgr    = useViewMgr()
   const userIdToNumItems  = ref(new Map())
   const selectedUserId    = ref(null)
   const selectedItem      = ref(null)
   const chatExpanded      = ref(false)
   const showEditGroupDialog = ref(false)
   const showAddChatDialog = ref(false)
   
   const group = computed(() => {
      const grp = groupStore.getMyGroup(route.params.id)
      viewStore.setPageName((grp ? grp.name  : "") + " Group")
      return grp
   })
   const groupName  = computed(() => group.value ? group.value.name : "")
   const groupImage = computed(() => groupMgr.getGroupImage(group.value))
   const canEdit    = computed(() => group.value && userStore.userId && group.value.ownerId == userStore.userId)
   
   const groupUsers = computed(() => {
      let users = group.value ? group.value.userIds.map(userId => userStore.getUser(userId)) : []

      users = users.map((user) => {
         const numItems = userIdToNumItems.value.get(user.id)
         return { ...user,
            displayInfo: numItems ? "(" + numItems + ")" : null,
            sort: numItems ?? 0 }
      })
      return users.toSorted(function(a, b) {return b.sort - a.sort}) 
   })

   const groupItems = computed(() => { 
      const items = itemStore.getGroupItems(route.params.id)

      const userIdToItems = new Map()
      for (const item of items) {
         let userItems = userIdToItems.get(item.userId)
         if (!userItems) {
            userItems = []
            userIdToItems.set(item.userId, userItems)
         }
         userItems.push(item)
      }

      userIdToNumItems.value = new Map(Array.from(userIdToItems, ([userId, items]) => [userId, items.length]))
      return items
   })

   const displayItems = computed(() => { 
      const items = groupItems.value.filter(item => !selectedUserId.value || item.userId == selectedUserId.value )
      return viewStore.setVisibleItems(ItemOrigin.GROUP, group.value.name, Route.GROUP.url + route.params.id, items) 
   })

   const selectUser = (userId) => { selectedUserId.value = userId }
   const addChat = (item) => { 
      selectedItem.value = item
      showAddChatDialog.value = true
   }
   
   const thumbIconRight = computed(() => viewMgr.isXs ? "group-thumb-icon-right-xs" : "group-thumb-icon-right")
</script>

<style>
.group-thumb {
   position: relative;
   display: inline-block; 
}
.group-thumb-icon {
  position: absolute;
  top: 0px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFF9C4;
  border-radius: 10%;
  padding: 4px;
}
.group-thumb-icon-right {
  right: 17px;
}
.group-thumb-icon-right-xs {
  right: 4px;
}
</style>