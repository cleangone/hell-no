<template>
   <v-card>
      <div class="d-flex justify-space-between align-center px-3"> 
         <span class="font-weight-medium">Add Reply</span> 
         <span> 
            <IconButton @click="addReply()" icon="mdi-check-bold"  :disabled="!text" xs color="blue-darken-2"/>
            <IconButton @click="cancel()"   icon="mdi-close-thick" :disabled="!text" xs color="blue-darken-2"/>
         </span>
      </div>
      <v-form class="mx-3">
         <v-textarea v-model="text" auto-grow rows="1"/>
      </v-form>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useReplyStore } from '@/stores/chat/replyStore'
   import { useChatStore }  from '@/stores/chat/chatStore'
   import IconButton        from '@/components/util/IconButton.vue'

   const props = defineProps({ postId: String, chatId: String })

   const replyStore = useReplyStore()
   const chatStore  = useChatStore()
   const text       = ref(null)

   const addReply = () => {    
      replyStore.addReply({ postId: props.postId, text: text.value })
      chatStore.updateChatContentModified(props.chatId)
      text.value = null
   }

   const cancel = () => { text.value = null }
</script>

<style>
</style>
