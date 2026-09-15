<template>
   <v-row v-if="!viewMgr.isXs" no-gutters class="flex-nowrap">
       <v-col cols="2" class="d-flex justify-start flex-grow-0 flex-shrink-0">
         <GroupImage v-if="groupImage" :src="groupImage.thumbUrl" :height="60" class="mt-2"/>      
      </v-col>
      <v-col cols="8" class="title d-flex justify-center align-center flex-grow-1 flex-shrink-0">
         {{ groupName }} Group
      </v-col>
      <v-col cols="2" class="d-flex justify-end align-center flex-grow-0 flex-shrink-0">
         <ThumbSizeButton class="mr-2"/>
         <ItemThumbConfig :origin="ItemOrigin.GROUP" :additionalFields="ThumbConfigFields"/> 
         <EditButton v-if="canEdit" @click="showEditDialog=true" class="mr-n2"/>          
      </v-col>
   </v-row>
   <!-- users -->
   <div class="bg-shade border-md fill-height mt-5 pa-3">
      <swiper slides-per-view="auto" :space-between="slideSpacing" loop>
         <swiper-slide v-for="user in groupUsers" :key="user.id" class="dynamic-slide-width mr-3">
            <UserThumb :user="user"/>
         </swiper-slide>
      </swiper>
   </div>
   <!-- items -->
   <v-container class="mt-5">
      <v-row justify="space-around" class="mb-4" >
         <ItemThumb v-for="item in groupItems" :key="item.id" :item="item" :origin="ItemOrigin.GROUP"/>
      </v-row>
   </v-container>

   <v-dialog v-model="showEditDialog" width="75%" height="90%">
      <EditGroupCard :groupId="group.id" @done="showEditDialog=false"/>
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
   import UserThumb         from '@/components/user/UserThumb.vue'
   import EditButton        from '@/components/util/EditButton.vue'
   import ThumbSizeButton   from '@/components/util/ThumbSizeButton.vue'
   import { ItemOrigin, Route } from '@/utils/constants'
    
   const SHOW_MY_ITEMS = "Show my items"
   const ThumbConfigFields = [{ title: SHOW_MY_ITEMS, value: true }]
   const route = useRoute()
   const userStore  = useUserStore()
   const groupStore = useGroupStore()
   const groupMgr   = useGroupMgr()
   const itemStore  = useItemStore()
   const viewStore  = useViewStore()
   const viewMgr    = useViewMgr()
   const showEditDialog = ref(false)
   
   const group = computed(() => {
      const grp = groupStore.getMyGroup(route.params.id)
      viewStore.setPageName((grp ? grp.name  : "") + " Group")
      return grp
   })
   const groupName    = computed(() => group.value ? group.value.name : "")
   const groupImage   = computed(() => groupMgr.getGroupImage(group.value))
   const canEdit      = computed(() => group.value && userStore.userId && group.value.ownerId == userStore.userId)
   const slideSpacing = computed(() => viewMgr.isXs ? 5 : 10)
   
   const groupUsers = computed(() => {
      const users = group.value ? group.value.userIds.map(userId => userStore.getUser(userId)) : []
      return users.toSorted((a, b) => a.username.localeCompare(b.username)) 
   })

   const groupItems = computed(() => { 
      const items = itemStore.getGroupItems(route.params.id)
      return viewStore.setVisibleItems(ItemOrigin.GROUP, group.value.name, Route.GROUP.url + route.params.id, items) 
   })
</script>

<style>
.dynamic-slide-width {
  width: max-content; /* Shrinks the slide to fit the inner UserThumb content */
  display: inline-block; /* Prevents block-level 100% width stretching */
}
</style>