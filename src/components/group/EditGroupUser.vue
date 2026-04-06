<template>
   <v-card title="Edit Group User" class="edit-dialog">
      <v-form>
         <div>
            <v-select v-model="groupUserState" label="Status" :items="groupUserStates" class="mx-3"></v-select>
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
   import { Emit, GroupUserState } from '@/utils/constants'
   
   const props = defineProps({ groupUser: Object })
   const emit = defineEmits([Emit.DONE]);
   const groupStore = useGroupStore()
   const groupUserStates = [ GroupUserState.MEMBER, GroupUserState.MODERATOR ] //GroupUserState.VIEWER
   const groupUserState = ref('')
   
   onMounted(() => {
      console.log("EditGroupUser", props.groupUser)
      groupUserState.value = props.groupUser.state
   })
   
   const save = () => {
      if (stateChanged(GroupUserState.MEMBER, GroupUserState.MODERATOR)) { groupStore.addModeratorId(   props.groupUser.groupId, props.groupUser.id) }
      if (stateChanged(GroupUserState.MODERATOR, GroupUserState.MEMBER)) { groupStore.removeModeratorId(props.groupUser.groupId, props.groupUser.id) }
     
      emit(Emit.DONE)
   }

   const stateChanged = (prev, curr) => { return (props.groupUser.state == prev && groupUserState.value == curr) }

</script>

<style>
</style>
