<template>
   <v-card title="Edit Chat" class="edit-chat-dialog">
      <v-form v-model="dataValid">
         <div class="ma-3">
            <v-text-field v-model="name"        label="Name" :rules="requiredRule"/>
            <v-select     v-model="state"       label="State" :items="ChatStates"/>
            <v-text-field v-model="description" label="Description" :rules="requiredRule"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useChatStore } from '@/stores/chatStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit, ChatState } from '@/utils/constants'
   
   const props = defineProps({ chat: Object })
   const emit = defineEmits([Emit.DONE])

   const ChatStates = [ ChatState.ACTIVE, ChatState.ARCHIVED ]
   const chatStore = useChatStore()
   const name = ref('')
   const state = ref('')
   const description = ref('')
   const dataValid = ref(true)

   onMounted(() => {
      name.value        = props.chat.name
      state.value       = props.chat.state
      description.value = props.chat.description
   })
   
   const save = () => {
      chatStore.updateChat({
         id: props.chat.id,
         name: name.value,
         state: state.value,
         description: description.value,
      })
     
      emit(Emit.DONE)
   }
</script>

<style>
.edit-chat-dialog {
   min-width:  450px;
   min-height: 450px;
}
</style>
