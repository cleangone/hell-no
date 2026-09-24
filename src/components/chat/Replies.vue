<template>
   <div class="ml-10 mb-2">
      <Reply v-for="reply in replies" :key="reply.id" :reply="reply"/>
      <AddReply v-if="chatMgr.isActive(chat)" :postId="postId" :chatId="chat.id" />
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useReplyStore } from '@/stores/chat/replyStore'
   import { useChatMgr }    from '@/stores/chat/chatMgr'
   import Reply             from './Reply.vue'
   import AddReply          from './crud/AddReply.vue'
   
   const props = defineProps({ postId: String, chat: Object })

   const replyStore = useReplyStore()
   const chatMgr    = useChatMgr()
   
   const replies = computed(() => replyStore.getReplies(props.postId))
</script>

<style>
</style>
