<template>
   <v-card>
      <div @click="isExpanded=!isExpanded" class="d-flex justify-space-between hand align-center px-3"> 
         <span class="d-inline-flex align-center">
            <ExpandIcon :isExpanded="isExpanded" iconClass="icon-btn"/>
            <span class="font-weight-medium admin-link my-1">Add Reply</span>
         </span>
         <span v-if="isExpanded"> 
            <IconButton @click.stop="addReply()" icon="mdi-check-bold"  :disabled="!text" xs color="blue-darken-2"/>
            <IconButton @click.stop="cancel()"   icon="mdi-close-thick" :disabled="!text" xs color="blue-darken-2"/>
         </span>
      </div>
      <v-form v-if="isExpanded" class="mx-3">
         <v-textarea v-model="text" auto-grow rows="1"/>
      </v-form>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useReplyStore } from '@/stores/chat/replyStore'
   import { useChatStore }  from '@/stores/chat/chatStore'
   import ExpandIcon        from '@/components/util/icon/ExpandIcon.vue'
   import IconButton        from '@/components/util/IconButton.vue'

   const props = defineProps({ postId: String, chatId: String, expand: Boolean })

   const replyStore = useReplyStore()
   const chatStore  = useChatStore()
   const isExpanded = ref(props.expand)
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
