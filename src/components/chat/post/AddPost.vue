<template>
   <v-card :title="title" class="add-post-dialog">
      <v-form v-model="dataValid">
         <div class="ma-3">
           <v-textarea v-model="text" label="Text" :rules="requiredRule"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="addPost()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useChatPostStore } from '@/stores/chatPostStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'

   const props = defineProps({ userId: String, chatId: String, replyToPostId: String })
   const emit  = defineEmits([Emit.DONE])
   const chatPostStore = useChatPostStore()
   const text = ref('')
   const dataValid = ref(true)

   const title = computed(() => props.replyToPostId ? "Add Reply" : "Add Post")
   
   const addPost = () => {    
      const post = { chatId: props.chatId, userId: props.userId, text: text.value }
      if (props.replyToPostId) { post.replyToPostId = props.replyToPostId }
      chatPostStore.addPost(post)
      emit(Emit.DONE)
   }
</script>

<style>
.add-post-dialog {
   min-width:  450px;
   min-height: 400px;
}
</style>
