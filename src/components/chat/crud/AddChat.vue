<template>
   <v-card title="Add Chat" class="add-chat-dialog">
      <v-form v-model="dataValid" class="mx-3">
         <v-text-field v-model="name"        label="Name"  :rules="requiredRule"/>
         <v-text-field v-model="description" label="Description"/>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="addChat()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'  
   import { useChatStore } from '@/stores/chat/chatStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit, State }  from '@/utils/constants'
   
   const props = defineProps({ state: {type:String, default:State.PRIVATE}, groupId: String })
   const emit  = defineEmits([Emit.DONE])

   const chatStore = useChatStore()
   const name = ref('')
   const description = ref('')
   const dataValid = ref(true)

   const addChat = () => {    
      chatStore.addChat({ 
         name:    name.value, 
         state:   props.state, 
         description: description.value,
         groupId: props.groupId ?? null
      })
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
