<template>
   <DeleteConfirm type="Chat" :name="props.chat.name" @delete="deleteChat()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useChatMgr } from '@/stores/chatMgr'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ chat: Object })
   const emit = defineEmits([Emit.DONE])
   const chatMgr = useChatMgr()
   
   const deleteChat = () => {
      chatMgr.deleteChat(props.chat.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
