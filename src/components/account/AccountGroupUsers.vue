<template>
   <div class="text-left">
      <div class="text-left text-h6">
         <a @click="$emit(Emit.DONE)">Groups</a> > {{ group.name }}
         <TextButton @click="showInviteDialog=true" text="Invite User"/>
         <TextButton @click="showInviteOtherGroupDialog=true" text="Invite Other Group's Users"/>
      </div>
      <EditGroupUsers :groupId="groupId"/>
   </div>

   <v-dialog v-model="showInviteDialog" width="auto">
      <AddGroupInvite :group="group" @done="showInviteDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showInviteOtherGroupDialog" width="auto">
      <InviteOtherGroup :group="group" @done="showInviteOtherGroupDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import InviteOtherGroup  from '@/components/group/InviteOtherGroup.vue'
   import EditGroupUsers    from '@/components/group/EditGroupUsers.vue'
   import AddGroupInvite    from '@/components/invite/AddGroupInvite.vue'  
   import TextButton        from '@/components/util/TextButton.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps(['groupId'])
   const emit = defineEmits([Emit.DONE])
   
   const groupStore = useGroupStore()
   const showInviteDialog  = ref(false)
   const showInviteOtherGroupDialog = ref(false)
   
   const group = computed(() => { return groupStore.getGroup(props.groupId) })
</script>

<style>
</style>
