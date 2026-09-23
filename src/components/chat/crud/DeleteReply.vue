<template>
   <DeleteConfirm type="Reply" :name="text" @delete="deleteReply()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { computed } from 'vue'
   import { useReplyStore } from '@/stores/chat/replyStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ reply: Object })
   const emit  = defineEmits([Emit.DONE])

   const replyStore = useReplyStore()
   
   const text = computed(() => 
      "'" + (props.reply.text.length > 7 ? props.reply.text.substring(0, 7) + "..." : props.reply.text) + "'")

   const deleteReply = () => {
      replyStore.deleteReply(props.post)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
