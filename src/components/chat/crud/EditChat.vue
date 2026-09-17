<template>
   <v-card title="Edit Chat" class="edit-chat-dialog">
      <v-form v-model="dataValid" class="mx-3">
         <v-row>
            <v-col cols="6"><v-text-field v-model="name" label="Name" :rules="requiredRule"/></v-col>
            <v-col ><v-select v-model="status" label="Status" :items="ChatStatuses"/></v-col> 
         </v-row>
         <v-row v-if="!bypassState" class="mt-n5">
            <v-col cols="6"><v-select v-model="state" label="Visibility" :items="ChatStates"/></v-col> 
            <v-col v-if="isGroup">
               <v-select v-model="groupId" label="Group" :items="groups" item-title="name" item-value="id"/>
            </v-col>
         </v-row>
         <v-row class="mt-n7">
            <v-col><v-text-field v-model="description" label="Description"/></v-col>
         </v-row>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useChatStore }  from '@/stores/chatStore'
   import { useGroupStore } from '@/stores/groupStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit, ChatStates, ChatStatuses, State } from '@/utils/constants'
   
   const props = defineProps({ chat: Object, bypassState: Boolean })
   const emit = defineEmits([Emit.DONE])

   const chatStore   = useChatStore()
   const groupStore  = useGroupStore()
   const name        = ref('')
   const state       = ref('')
   const status      = ref('')
   const description = ref('')
   const groupId     = ref(null)
   const dataValid = ref(true)

   onMounted(() => {
      name.value        = props.chat.name
      state.value       = props.chat.state
      status.value      = props.chat.status
      description.value = props.chat.description
      groupId.value     = props.chat.groupId
   })

   const isGroup = computed(() => state.value == State.GROUP)
   const groups  = computed(() => groupStore.groups)
   
   const save = () => {
      chatStore.updateChat({
         id: props.chat.id,
         name:        name.value,
         state:       state.value,
         status:      status.value,
         description: description.value,
         groupId:     groupId.value ?? null
      })
     
      emit(Emit.DONE)
   }
</script>

<style>
.edit-chat-dialog {
   min-width:  500px;
   min-height: 450px;
}
</style>
