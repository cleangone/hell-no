<template>
   <v-card title="Add Group Member" class="edit-dialog">
      <v-form v-model="dataValid" class="mx-3">
         <v-select v-model="userId" label="User" :items="potentialUsers" 
            item-title="username" item-value="id" :rules="requiredRule"/>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useGroupStore } from '@/stores/groupStore'
   import { requiredRule, toSortedUsernameAsc } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ group: Object })
   const emit  = defineEmits([Emit.DONE])

   const userStore  = useUserStore()
   const groupStore = useGroupStore()
   const userId     = ref(null)
   const dataValid  = ref(true)
   
   const potentialUsers = computed(() => toSortedUsernameAsc(userStore.users.filter(user => !props.group.userIds.includes(user.id))))

   const save = () => {
      groupStore.addUserId(props.group.id, userId.value)    
      emit(Emit.DONE)
   }
</script>

<style>
</style>
