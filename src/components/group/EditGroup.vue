<template>
   <v-form v-model="dataValid" class="mt-3">
      <v-row class="mx-3">
         <v-col cols="4"><v-text-field v-model="groupName" label="Group name" :rules="requiredRule"/></v-col> 
         <v-col><v-text-field v-model="desc" label="Description"/></v-col>
      </v-row>
      <v-row class="mt-n3 mx-3">
         <v-col cols="4"><v-select v-model="groupState" label="Group State" :items="GroupStates"/></v-col> 
      </v-row>
   </v-form>
   <v-card-actions class="justify-end">
      <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
      <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
   </v-card-actions>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit, GroupStates } from '@/utils/constants'
   
   const props = defineProps({group: Object})
   const emit  = defineEmits([Emit.DONE])

   const groupStore = useGroupStore()
   const groupName  = ref('')
   const desc       = ref('')
   const groupState = ref('')
   const dataValid  = ref(true)
   
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
         images: props.group.images ?? [],  // backward compatibility to add images[]
      })
     
      emit(Emit.DONE)
   }
</script>

<style>
</style>
