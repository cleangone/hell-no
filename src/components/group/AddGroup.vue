<template>
   <v-card title="Add Group" class="edit-dialog">
      <v-form v-model="dataValid">
         <div>
            <v-text-field v-model="groupName" label="Group name" :rules="requiredRule" class="ma-3"></v-text-field>
            <v-text-field v-model="desc" label="Description" class="ma-3"></v-text-field>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { ref } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps(['userId'])
   const emit = defineEmits([Emit.DONE]);

   const groupStore = useGroupStore()
   const groupName = ref('')
   const desc = ref('')
   const dataValid = ref(true)
   
   const save = () => {
      groupStore.addGroup(groupName.value, desc.value, props.userId)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
