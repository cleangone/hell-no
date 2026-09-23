<template>
   <v-card-item class="pr-0 elevation-1">
      <div class="mr-3">
         <div class="text-no-wrap">
            <span :class="chatClass" class="text-subtitle-1 mr-2"> {{ chat.name }}</span>
            <span class="text-overline mb-1">
               {{ dateContentModified }}
               <span v-if="isArchived"> (Archived)</span>   
            </span>   
         </div>
         <div class="mt-n2"> {{ chat.description }}</div>
         <div v-if="postCount"> {{ postCount }} {{ postCount == 1 ? 'Post' : 'Posts' }}</div>
         <div v-if="canUpdate" style="float:right">
            <IconButton :icon="isArchived?'mdi-archive-remove':'mdi-archive'" color="blue-darken-2" @click="toggleArchive()" size="x-small"/>
            <EditButton @click="editChat()" color="blue-darken-2" :disabled="isArchived" size="x-small"/>
            <DeleteButton @click="deleteChat()" color="blue-darken-2" :disabled="!isArchived && postCount>0" size="x-small"/>
         </div>
      </div>
   </v-card-item>
  
   <v-dialog v-model="showEditDialog" width="auto">
      <EditChat :chat="chat" bypassState @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteChat :chat="chat" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useChatStore } from '@/stores/chat/chatStore'
   import EditChat      from './crud/EditChat.vue'
   import DeleteChat    from './crud/DeleteChat.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import IconButton    from '@/components/util/IconButton.vue'
   import { chatDate } from '@/utils/dateUtils'
   import { ChatStatus } from '@/utils/constants'
   
   const props = defineProps({ chat: Object, postCount: Number, isSeleted: Boolean, canUpdate: Boolean })

   const chatStore = useChatStore()
   const showEditDialog    = ref(false)
   const showDeleteDialog  = ref(false)
   
   const isArchived = computed(() => props.chat.status == ChatStatus.ARCHIVED )
   const chatClass  = computed(() => props.isSeleted ? "font-weight-bold" : "")
   const dateContentModified = computed(() => chatDate(props.chat?.dateContentModified?.toDate()))

   const toggleArchive = () => {
      chatStore.updateChat({ id: props.chat.id, status: isArchived.value ? ChatStatus.ACTIVE : ChatStatus.ARCHIVED })
   }

   const editChat   = ()  => { showEditDialog.value   = true }
   const deleteChat = ()  => { showDeleteDialog.value = true }
</script>

<style>
</style>
