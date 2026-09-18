<template>
   <v-card-item class="bg-blue-lighten-5 pr-0">
      <HorizontalDiv class="w-100">
         <div v-if="item" class="my-1 ml-n2">
            <ItemThumb :item="item" :size="ThumbSize.IMG" :origin="ItemOrigin.EXTERNAL"/>
         </div>
         <div class="w-100">
            <div>
               <span class="text-subtitle-1 mr-2"> {{ chat.name }}</span>
               <span class="text-overline mb-1">
                  {{ dateModified }}
                  <span v-if="isArchived"> (Archived)</span>   
               </span>   
               <TextButton v-if="!isArchived" @click="showAddPostDialog=true" text="Add Post"/>
               <span v-if="canUpdate" style="float:right">
                  <IconButton :icon="isArchived?'mdi-archive-remove':'mdi-archive'" color="blue-darken-2" @click="toggleArchive()"/>
                  <EditButton @click="editChat()" color="blue-darken-2" :disabled="isArchived"/>
                  <DeleteButton @click="deleteChat()" color="blue-darken-2" :disabled="!isArchived && postCount>0"/>
               </span>
            </div>
            <div class="mt-n2"> {{ chat.description }}</div>
            <div v-if="postCount"> {{ postCount }} {{ postCount == 1 ? 'Post' : 'Posts' }}</div>
         </div>
      </HorizontalDiv>
   </v-card-item>
  
   <v-dialog v-model="showAddPostDialog" width="auto">
      <AddPost :chatId="chat.id" :userId="userStore.userId" @done="showAddPostDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditChat :chat="chat" bypassState @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteChat :chat="chat" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useChatStore } from '@/stores/chatStore'
   import { useItemStore } from '@/stores/itemStore'
   import AddPost       from './post/AddPost.vue'
   import EditChat      from './crud/EditChat.vue'
   import DeleteChat    from './crud/DeleteChat.vue'
   import ItemThumb     from '@/components/item/thumb/ItemThumb.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import TextButton    from '@/components/util/TextButton.vue'
   import IconButton    from '@/components/util/IconButton.vue'
   import HorizontalDiv from '@/components/util/HorizontalDiv.vue'
   import { chatDate } from '@/utils/dateUtils'
   import { ChatStatus, ItemOrigin, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ chat: Object, postCount: Number })
   
   const userStore = useUserStore()
   const chatStore = useChatStore()
   const itemStore = useItemStore()   
   const showAddPostDialog = ref(false)
   const showEditDialog    = ref(false)
   const showDeleteDialog  = ref(false)
   
   const isArchived   = computed(() => props.chat.status == ChatStatus.ARCHIVED )
   const dateModified = computed(() => chatDate(props.chat.dateModified?.toDate()))
   const canUpdate    = computed(() => props.chat.userId == userStore.userId)
   const item         = computed(() => props.chat.itemId ? itemStore.getItem(props.chat.itemId) : null  )

   const toggleArchive = () => {
      chatStore.updateChat({ id: props.chat.id, status: isArchived.value ? ChatStatus.ACTIVE : ChatStatus.ARCHIVED })
   }

   const editChat   = ()  => { showEditDialog.value   = true }
   const deleteChat = ()  => { showDeleteDialog.value = true }
</script>

<style>
</style>
