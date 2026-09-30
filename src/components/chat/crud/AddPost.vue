<template>
   <v-card>
      <div @click.stop="isExpanded=!isExpanded" class="d-flex justify-space-between hand align-center mx-2"> 
         <span class="d-inline-flex font-weight-medium align-center">
            <ExpandIcon :isExpanded="isExpanded" iconClass="icon-btn"/>
            <span class="font-weight-medium admin-link my-1">Add Post</span>
         </span>
         <span v-if="isExpanded"> 
            <IconButton @click.stop="addPost()" icon="mdi-check-bold"  :disabled="!text" xs color="blue-darken-2"/>
            <IconButton @click.stop="cancel()"  icon="mdi-close-thick" :disabled="!text && !item" xs color="blue-darken-2"/>
         </span>
      </div>
      <HorizontalDiv v-if="isExpanded" class="w-100 mb-2 d-flex">
         <div v-if="item" class="me-n4">
            <ItemThumb :item="item" :size="ThumbSize.IMG" :origin="ItemOrigin.EXTERNAL"/>
         </div>
         <div class="flex-grow-1 mx-2">
             <v-textarea v-model="text" auto-grow rows="1"/>
         </div>
      </HorizontalDiv>
   </v-card>
</template>

<script setup>
   import { computed, ref, watch } from 'vue'
   import { usePostStore } from '@/stores/chat/postStore'
   import { useChatStore } from '@/stores/chat/chatStore'
   import { useNotificationMgr } from '@/stores/notificationMgr'
   import ItemThumb        from '@/components/item/thumb/ItemThumb.vue'
   import ExpandIcon       from '@/components/util/icon/ExpandIcon.vue'
   import IconButton       from '@/components/util/IconButton.vue'
   import HorizontalDiv    from '@/components/util/HorizontalDiv.vue'
   
   const props = defineProps({ chat: Object, group: Object })

   const postStore   = usePostStore()
   const chatStore   = useChatStore()
   const notificationMgr = useNotificationMgr()
   const isExpanded  = ref(false)
   const text        = ref(null)

   const item = computed(() => postStore.postItem)
   watch (() => postStore.postItem, (newItem, oldItem) => { // doesn't work to watch item
      if (newItem) { isExpanded.value = true }
   })

   const addPost = () => {    
      postStore.addPost({ 
         chatId: props.chat.id, 
         itemId: item.value ? item.value.id : null, 
         text: text.value })
      chatStore.updateChatContentModified(props.chat.id)
      text.value = null
      postStore.clearPostItem()
      if (props.group) { notificationMgr.addGroupChatNotification(props.group, props.chat) }
   }

   const cancel = () => { 
      text.value = null 
      postStore.clearPostItem()
   }
</script>

<style>
</style>
