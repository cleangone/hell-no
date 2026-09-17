<template>
   <div class="text-left w-100">
      <div class="text-h6">
         Chats
         <TextButton @click="showAddDialog=true" text="Add Chat"/>
         <TextButton v-if="archivedChatsExist && showArchived" @click="showArchived=false" text="Hide Archived"/>
         <TextButton v-else-if="archivedChatsExist" @click="showArchived=true" text="Show Archived"/>
         <IconButton v-if="expandCollapse" :icon="isExpanded?'mdi-arrow-collapse-horizontal':'mdi-arrow-expand-horizontal'" 
            @click="toggleExpand()" style="float:right"/>
      </div>
      <v-card v-for="chat in displayChats" :key="chat.id" class="mb-2 w-100">
         <div @click="toggleChat(chat)" :class="chatClass(chat)"> 
            <Chat :chat="chat" :postCount="postCount(chat)" />
         </div>
         <div v-if="isSelected(chat) && postCount(chat)" class="mt-2">
            <Posts :chatId="chat.id"/>
         </div>
      </v-card>
   </div> 
   <v-dialog v-model="showAddDialog" width="auto">
      <AddChat :state="state" :groupId="groupId" @done="showAddDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useChatStore } from '@/stores/chatStore'
   import { useChatMgr }   from '@/stores/chatMgr'
   import Chat             from './Chat.vue'
   import AddChat          from './crud/AddChat.vue'
   import Posts            from './post/Posts.vue'
   import TextButton       from '@/components/util/TextButton.vue'
   import IconButton       from '@/components/util/IconButton.vue'
   import { ChatStatus, Emit, State } from '@/utils/constants'
   
   const props = defineProps({ state: String, groupId: String, expandCollapse: Boolean })
   const emit = defineEmits([Emit.TOGGLE])
   
   const chatStore     = useChatStore()
   const chatMgr       = useChatMgr()
   const isExpanded    = ref(false)
   const showArchived  = ref(false)
   const showAddDialog = ref(false)
   const selectedChatIds = ref(new Set())
   
   const allChats = computed(() => {
      let chats = props.state == State.PUBLIC ? chatStore.publicChats : []
      if (props.state == State.GROUP && props.groupId) { chats = chatStore.getGroupChats(props.groupId) }
      
      return chats.toSorted(function(a, b) { return b.dateModified - a.dateModified })
   })
   const activeChats = computed(() => allChats.value.filter(chat => chat.status == ChatStatus.ACTIVE))
   const displayChats = computed(() => showArchived.value ? allChats.value : activeChats.value)
   const archivedChatsExist = computed(() => allChats.value?.length > activeChats.value?.length)

   // todo - postCount called 3 times
   const chatClass  = (chat) => { return postCount(chat) ? "pointer" : "" }   
   const isSelected = (chat) => { return selectedChatIds.value.has(chat.id) }   
   const postCount  = (chat) => { return chatMgr.getPostCount(chat.id) }   
   const toggleChat = (chat) => { 
      if (isSelected(chat)) { selectedChatIds.value.delete(chat.id) }
      else { selectedChatIds.value.add(chat.id) }
   }

   const toggleExpand = () => { 
      isExpanded.value = !isExpanded.value
      emit (Emit.TOGGLE, isExpanded.value)
   }   
</script>

<style>
</style>
