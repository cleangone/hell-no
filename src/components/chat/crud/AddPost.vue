<template>
   <v-card>
      <div class="d-flex justify-space-between align-center px-3"> 
         <span class="font-weight-medium">Add Post</span> 
         <span> 
            <IconButton @click="addPost()" icon="mdi-check-bold"  :disabled="!text" xs color="blue-darken-2"/>
            <IconButton @click="cancel()"  icon="mdi-close-thick" :disabled="!text" xs color="blue-darken-2"/>
         </span>
      </div>
      <v-form v-model="dataValid" class="mx-3">
         <v-textarea v-model="text" auto-grow rows="1"/>
      </v-form>
   </v-card>
</template>

<script setup>
   import { ref } from 'vue'
   import { usePostStore } from '@/stores/chat/postStore'
   import { useChatStore } from '@/stores/chat/chatStore'
   import IconButton       from '@/components/util/IconButton.vue'
   
   const props = defineProps({ chatId: String })

   const postStore = usePostStore()
   const chatStore = useChatStore()
   const text = ref(null)
   const dataValid = ref(true)

   const addPost = () => {    
      postStore.addPost({ chatId: props.chatId, text: text.value })
      chatStore.updateChatContentModified(props.chatId)
      text.value = null
   }

   const cancel = () => { text.value = null }
</script>

<style>
.add-post-dialog {
   min-width:  450px;
   min-height: 400px;
}
</style>
