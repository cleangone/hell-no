<template>
   <div class="text-left">
      <div class="text-h5">
         Chats
         <TextButton @click="showAddDialog=true"  text="Add Chat"/>
      </div>
      <v-data-table :headers="headers" :items="chats" density="compact">
         <template v-slot:item.dateCreated="{ item }"> {{ defaultDateString(item.dateCreated) }}</template>
         <template v-slot:item.dateModified="{ item }">{{ defaultDateString(item.dateModified)}}</template>
         <template v-slot:item.actions="{ item }">
            <EditButton   @click="editChat(item)"/>
            <DeleteButton @click="deleteChat(item)"/>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddChat @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditChat :chat="selectedChat" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteChat :chat="selectedChat" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useChatStore }  from '@/stores/chatStore'
   import AddChat      from '@/components/chat/AddChat.vue'
   import EditChat     from '@/components/chat/EditChat.vue'
   import DeleteChat   from '@/components/chat/DeleteChat.vue'
   import EditButton   from '@/components/util/EditButton.vue'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import { defaultDateString } from '@/utils/dateUtils'
   
   const chatStore = useChatStore()
   const showAddDialog   = ref(false)
   const showEditDialog  = ref(false)
   const showDeleteDialog = ref(false)
   const selectedChat = ref({})
   
   const headers = [
      { title: 'Name',     value: 'name' },
      { title: 'State',    value: 'state', align: 'center' },
      { title: 'Created',  key: 'dateCreated',   align: 'center' },
      { title: 'Modified', key: 'dateModified',  align: 'center' },
      { title: '',         key: "actions" },
   ]

   const chats = computed(() => chatStore.allChats)

   const editChat   = (chat)  => { showDialog(showEditDialog,   chat) }
   const deleteChat = (chat)  => { showDialog(showDeleteDialog, chat) }
   const showDialog = (showDialog, chat) => {
      selectedChat.value = chat
      showDialog.value = true
   }
</script>

<style>
</style>
