<template>
   <v-card title="Add Chat" class="add-chat-dialog">
      <v-form v-model="dataValid">
         <div class="ma-3">
            <v-text-field v-model="name"        label="Name"        :rules="requiredRule"/>
            <v-text-field v-model="description" label="Description" :rules="requiredRule"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="addChat()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { ref } from 'vue'
   import { useChatStore } from '@/stores/chatStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit }  from '@/utils/constants'

   const emit = defineEmits([Emit.DONE])

   const chatStore = useChatStore()
   const name = ref('')
   const description = ref('')
   const dataValid = ref(true)

   const addChat = () => {    
      chatStore.addChat({ name: name.value, description: description.value })
      emit(Emit.DONE)
   }
</script>

<style>
.add-chat-dialog {
   min-width:  450px;
   min-height: 350px;
}
.number-field {
   max-width:  150px;
}
</style>
