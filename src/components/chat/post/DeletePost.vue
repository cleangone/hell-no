<template>
   <DeleteConfirm type="Post" :name="text" @delete="deletePost()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { computed } from 'vue'
   import { useChatMgr } from '@/stores/chatMgr'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ post: Object })
   const emit = defineEmits([Emit.DONE])
   const chatMgr = useChatMgr()
   
   const text = computed(() => 
      "the Post '" + 
      (props.post.text.length > 7 ? props.post.text.substring(0, 7) + "..." : props.post.text) +
      "'"
   )

   const deletePost = () => {
      chatMgr.deletePost(props.post)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
