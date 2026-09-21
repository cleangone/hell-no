<template>
   <div class="text-left w-100">
      <div class="text-h6">
         Chats
         <TextButton @click="showAddDialog=true" text="Add Chat"/>
         <span v-if="archivedChatsExist && showAllChats"> 
            <TextButton v-if="showArchived" @click="showArchived=false" text="Hide Archived"/>
            <TextButton v-else @click="showArchived=true" text="Show Archived"/>
         </span>
         <IconButton v-if="collapsible && chatsExist" :icon="showAllChats?'mdi-arrow-collapse-vertical':'mdi-arrow-expand-vertical'" 
            @click="showAllChats=!showAllChats" style="float:right"/>
      </div>
      <v-card v-if="allChats.length" v-for="chat in displayChats" :key="chat.id" class="mb-2 w-100 elevation-1">
         <div @click="toggleChat(chat)" :class="chatClass(chat)"> 
            <Chat :chat="chat" :postCount="postCount(chat)" @popup="onPopup"/>
         </div>
         <div v-if="isSelected(chat) && postCount(chat)" class="mt-2">
            <Posts :chatId="chat.id"/>
         </div>
      </v-card>
   </div> 
   <ItemPopup v-if="popupImage" :popupImage="popupImage"/>
   <v-dialog v-model="showAddDialog" width="auto">
      <AddChat :state="state" :groupId="groupId" @done="showAddDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useChatStore } from '@/stores/chat/chatStore'
   import { useChatMgr }   from '@/stores/chat/chatMgr'
   import Chat             from './Chat.vue'
   import AddChat          from './crud/AddChat.vue'
   import Posts            from './Posts.vue'
   import ItemPopup        from '@/components/item/ItemPopup.vue'
   import TextButton       from '@/components/util/TextButton.vue'
   import IconButton       from '@/components/util/IconButton.vue'
   import { ChatStatus, State } from '@/utils/constants'
   
   const props = defineProps({ state: String, groupId: String, collapsible: Boolean })
   
   const chatStore     = useChatStore()
   const chatMgr       = useChatMgr()
   const showAllChats  = ref(true)
   const showArchived  = ref(false)
   const showAddDialog = ref(false)
   const selectedChatIds = ref(new Set())
   const popupImage    = ref(null)
   
   const allChats = computed(() => {
      let chats = props.state == State.PUBLIC ? chatStore.publicChats : []
      if (props.state == State.GROUP && props.groupId) { chats = chatStore.getGroupChats(props.groupId) }
      
      return chats.toSorted(function(a, b) { return b.dateModified - a.dateModified })
   })
   const chatsExist  = computed(() => allChats.value?.length)
   const activeChats = computed(() => allChats.value.filter(chat => chat.status == ChatStatus.ACTIVE))
   const archivedChatsExist = computed(() => allChats.value?.length > activeChats.value?.length)
   const displayChats = computed(() => {
      const chats = showArchived.value ? allChats.value : activeChats.value
      const collapsedChat = activeChats.value.length ? activeChats.value[0] : allChats.value[0]
      return showAllChats.value ? chats : [ collapsedChat ]
   })
   
   // todo - postCount called 3 times
   const chatClass  = (chat) => { return postCount(chat) ? "pointer" : "" }   
   const isSelected = (chat) => { return selectedChatIds.value.has(chat.id) }   
   const postCount  = (chat) => { return chatMgr.getPostCount(chat.id) }   
   const toggleChat = (chat) => { 
      if (isSelected(chat)) { selectedChatIds.value.delete(chat.id) }
      else { selectedChatIds.value.add(chat.id) }
   }

   const onPopup = (popup)  => { popupImage.value = popup }
</script>

<style>
</style>
