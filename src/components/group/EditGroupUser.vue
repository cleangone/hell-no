<template>
   <v-card title="Edit Group User" class="edit-dialog">
      <v-form>
         <div>
            <v-select v-model="userState" label="Status" :items="USER_STATES" class="mx-3"></v-select>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import { Emit, GroupUserState as UserState } from '@/utils/constants'
   
   const props = defineProps({ groupUser: Object })
   const emit  = defineEmits([ Emit.DONE ])

   const USER_STATES = [ UserState.MEMBER, UserState.MODERATOR ] //GroupUserState.VIEWER
   const groupStore = useGroupStore()
   const userState = ref(null)
   
   onMounted(() => {
      userState.value = props.groupUser.state
   })
   
   const save = () => {
      if (stateChanged(UserState.MEMBER, UserState.MODERATOR)) { groupStore.addModeratorId(   props.groupUser.groupId, props.groupUser.id) }
      if (stateChanged(UserState.MODERATOR, UserState.MEMBER)) { groupStore.removeModeratorId(props.groupUser.groupId, props.groupUser.id) }
     
      emit(Emit.DONE)
   }

   const stateChanged = (prev, curr) => { return (props.groupUser.state == prev && userState.value == curr) }
</script>

<style>
</style>
