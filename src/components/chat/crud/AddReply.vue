<template>
   <v-card title="Add Reply" class="add-post-dialog">
      <v-form v-model="dataValid">
         <div class="ma-3">
           <v-textarea v-model="text" label="Text" :rules="requiredRule"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="addReply()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useReplyStore } from '@/stores/chat/replyStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'

   const props = defineProps({ post: Object })
   const emit  = defineEmits([Emit.DONE])

   const replyStore = useReplyStore()
   const text = ref('')
   const dataValid = ref(true)

   const addReply = () => {    
      const reply = { postId: props.post.id, userId: props.post.userId, text: text.value }
      console.log("addReply", reply)
      replyStore.addReply(reply)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
