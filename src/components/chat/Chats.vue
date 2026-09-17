<template>
   <div class="text-left">
      <div class="text-h6">
         Chats
         <TextButton v-if="showArchived" @click="showArchived=false" text="Hide Archived"/>
         <TextButton v-else @click="showArchived=true" text="Show Archived"/>
      </div>
      <v-card v-for="chat in displayChats" :key="chat.id" class="mb-2">
         <div @click="toggleChat(chat)" :class="chatClass(chat)"> 
            <Chat :chat="chat" :postCount="postCount(chat)" />
         </div>
         <div v-if="isSelected(chat) && postCount(chat)" class="mt-2">
            <Posts :chatId="chat.id"/>
         </div>
      </v-card>
   </div> 
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useChatStore } from '@/stores/chatStore'
   import { useChatMgr }   from '@/stores/chatMgr'
   import Chat       from './Chat.vue'
   import Posts      from './post/Posts.vue'
   import TextButton from '@/components/util/TextButton.vue'
   import { ChatStatus }  from '@/utils/constants'
   
   const chatStore = useChatStore()
   const chatMgr = useChatMgr()
   const selectedChatIds = ref(new Set())
   const showArchived = ref(false)
   
   const chats = computed(() => chatStore.publicChats.toSorted(function(a, b) { return b.dateModified - a.dateModified }))
   const displayChats = computed(() => showArchived.value ? chats.value : chats.value.filter(chat => chat.status == ChatStatus.ACTIVE))

   // todo - postCount called 3 times
   const chatClass  = (chat) => { return postCount(chat) ? "pointer" : "" }   
   const isSelected = (chat) => { return selectedChatIds.value.has(chat.id) }   
   const postCount  = (chat) => { return chatMgr.getPostCount(chat.id) }   
   const toggleChat = (chat) => { 
      if (isSelected(chat)) { selectedChatIds.value.delete(chat.id) }
      else { selectedChatIds.value.add(chat.id) }
   }
</script>

<style>
</style>
