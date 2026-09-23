<template>
   <DeleteConfirm type="Post" :name="text" @delete="deletePost()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { computed } from 'vue'
   import { usePostStore } from '@/stores/chat/postStore'
   import DeleteConfirm    from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ post: Object })
   const emit  = defineEmits([Emit.DONE])
   
   const postStore = usePostStore()
   
   const text = computed(() => 
      "the Post '" + 
      (props.post.text.length > 7 ? props.post.text.substring(0, 7) + "..." : props.post.text) +
      "'"
   )

   const deletePost = () => {
      postStore.deletePost(props.post.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
