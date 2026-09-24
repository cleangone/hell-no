<template>
   <v-card class="text-left w-100 elevation-1">
      <div class="text-h6">
         <ExpandIcon v-if="collapsible && chatsExist" :isExpanded="isExpanded"
            @click="isExpanded=!isExpanded" large iconClass="icon-btn mr-n1"/>
         Chats
         <TextButton v-if="isExpanded && canUpdate" @click="showAddChatDialog=true" text="Add Chat"/>
         <span v-if="isExpanded && archivedChatsExist"> 
            <TextButton v-if="showArchived" @click="showArchived=false" text="Hide Archived"/>
            <TextButton v-else @click="showArchived=true" text="Show Archived"/>
         </span>
      </div>
      <div v-if="viewMgr.isXs && isExpanded" class="mx-2">
          <div v-for="chat in displayChats" :key="chat.id"  @click="selectChat(chat)" class="hand mb-2">
            <Chat :chat="chat" :postCount="postCount(chat)" :isSeleted="isSelected(chat)" :canUpdate="canUpdate"/> 
            <div v-if="selectedChatId == chat.id" class="mb-2 flex-grow-1">
               <div><Posts :chatId="chat.id" @popup="onPopup"/></div>
               <AddPost :chatId="chat.id" :userId="userStore.userId"/>
            </div> 
         </div>
      </div>
      <HorizontalDiv v-else-if="isExpanded" class="mx-2 d-flex">
         <div class="mr-3 flex-shrink-0">
            <div v-for="chat in displayChats" :key="chat.id"  @click="selectChat(chat)" class="hand mb-2">
               <Chat :chat="chat" :postCount="postCount(chat)" :isSeleted="isSelected(chat)" :canUpdate="canUpdate"/> 
            </div>
         </div>
         <div class="mb-2 flex-grow-1">
            <div><Posts :chatId="selectedChatId" @popup="onPopup"/></div>
            <AddPost :chatId="selectedChatId" :userId="userStore.userId"/>
         </div> 
      </HorizontalDiv>
    </v-card>

   <ItemPopup v-if="popupImage" :popupImage="popupImage"/>
   <v-dialog v-model="showAddChatDialog" width="auto">
      <AddChat :state="state" :groupId="groupId" @done="showAddChatDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useChatStore }  from '@/stores/chat/chatStore'
   import { useChatMgr }    from '@/stores/chat/chatMgr'
   import { useGroupStore } from '@/stores/groupStore'
   import { useAdminStore } from '@/stores/adminStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import Chat              from './Chat.vue'
   import AddChat           from './crud/AddChat.vue'
   import Posts             from './Posts.vue'
   import AddPost           from './crud/AddPost.vue'
   import ItemPopup         from '@/components/item/ItemPopup.vue'
   import TextButton        from '@/components/util/TextButton.vue'
   import ExpandIcon        from '../util/icon/ExpandIcon.vue'
   import HorizontalDiv     from '../util/HorizontalDiv.vue'
   import { toSortedNameAsc } from '@/utils/utils'
   import { ChatStatus, Emit, State } from '@/utils/constants'
   
   const props = defineProps({ state: String, groupId: String, collapsible: Boolean })
   const emit  = defineEmits([ Emit.SELECT ])

   const userStore      = useUserStore()
   const chatStore      = useChatStore()
   const chatMgr        = useChatMgr()
   const groupStore     = useGroupStore()
   const adminStore     = useAdminStore()
   const viewMgr        = useViewMgr()
   const showArchived   = ref(false)
   const popupImage     = ref(null)
   const selectedChatId = ref(null)
   const isExpanded     = ref(true)
   const showAddChatDialog = ref(false)
   
   const allChats = computed(() => {
      if (props.state == State.GROUP && props.groupId) { return chatStore.getGroupChats(props.groupId) }   
      return props.state == State.PUBLIC ? chatStore.publicChats : []
   })

   const chatsExist  = computed(() => allChats.value?.length)
   const activeChats = computed(() => allChats.value.filter(chat => chat.status == ChatStatus.ACTIVE))
   const archivedChatsExist = computed(() => allChats.value?.length > activeChats.value?.length)
   const displayChats = computed(() => {
      let chats = showArchived.value ? allChats.value : activeChats.value
     
      // always select a chat if not xs
      if (!viewMgr.isXs && !selectedChatId.value) {
         let chatToSelect = null
         for (const chat of chats) {
            if (postCount(chat) && (!chatToSelect || chat.dateContentModified > chatToSelect.dateContentModified)) {
               chatToSelect = chat
            }
         }
         if (chatToSelect) { selectChat(chatToSelect) }
      }
      return toSortedNameAsc(chats)
   })

   const group     = computed(() => props.groupId ? groupStore.getGroup(props.groupId) : null) 
   const canUpdate = computed(() => adminStore.isAdmin || group.value?.moderatorIds.includes(userStore.userId))
   
   const isSelected = (chat) => { return selectedChatId.value == chat.id }
   const postCount  = (chat) => { return chatMgr.getPostCount(chat.id) }   

   const selectChat  = (chat) => { 
      // xs toggles selectedChatId so user can see a view of just chats
      if (viewMgr.isXs && selectedChatId.value == chat.id) { selectedChatId.value = null }
      else { selectedChatId.value = chat.id }
      emit(Emit.SELECT, chat.id)
   }   
   
   const onPopup = (popup)  => { popupImage.value = popup }
</script>

<style>
</style>
