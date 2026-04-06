<template>
   <v-card title="Edit Group" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-text-field v-model="groupName" label="Group name" :rules="requiredRule" class="ma-3"></v-text-field>
            <v-text-field v-model="desc" label="Description" class="ma-3"></v-text-field>
            <v-select v-model="groupState" label="Group State" :items="GroupStates" class="mx-3"></v-select>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit, GroupStates } from '@/utils/constants'
   
   const props = defineProps({group: Object})
   const emit = defineEmits([Emit.DONE])

   const groupStore = useGroupStore()
   const groupName = ref('')
   const desc = ref('')
   const groupState = ref('')
   const dataValid = ref(true)
   
   onMounted(() => {
      groupName.value = props.group.name
      desc.value = props.group.desc ? props.group.desc : ""
      groupState.value = props.group.state
   })
   
   const save = () => {
      groupStore.updateGroup({
         id: props.group.id,
         name: groupName.value,
         desc: desc.value,
         state: groupState.value,
      })
     
      emit(Emit.DONE)
   }
</script>

<style>
</style>
