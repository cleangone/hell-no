<template>
   <v-card :title="'Edit ' + group.name + ' Users'" class="edit-group-dialog">
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)" class="admin-link"/>
      </template>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import IconButton        from '@/components/util/IconButton.vue'
   import { Emit, GroupUserState } from '@/utils/constants'
   
   const props = defineProps({ group: Object })
   const emit  = defineEmits([Emit.DONE])

   const groupStore = useGroupStore()
   
   const groupUserStates = [ GroupUserState.MEMBER, GroupUserState.MODERATOR ] //GroupUserState.VIEWER
   const groupUserState = ref('')
   
   onMounted(() => {
      // console.log("EditGroupUser", props.groupUser)
      // groupUserState.value = props.groupUser.state
   })
   
   // const save = () => {
   //    if (stateChanged(GroupUserState.MEMBER, GroupUserState.MODERATOR)) { groupStore.addModeratorId(   props.groupUser.groupId, props.groupUser.id) }
   //    if (stateChanged(GroupUserState.MODERATOR, GroupUserState.MEMBER)) { groupStore.removeModeratorId(props.groupUser.groupId, props.groupUser.id) }
     
   //    emit(Emit.DONE)
   // }

   // const stateChanged = (prev, curr) => { return (props.groupUser.state == prev && groupUserState.value == curr) }

</script>

<style>
</style>
