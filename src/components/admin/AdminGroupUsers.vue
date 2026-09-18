<template>
   <div class="text-left">
      <div class="text-left text-h6">
         <a @click="$emit(Emit.DONE)">Groups</a> > {{ group.name }}
         <TextButton @click="showAddDialog=true" text="Add User"/>
      </div>
      <EditGroupUsers :groupId="groupId"/>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddGroupUser :group="group" @done="showAddDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import EditGroupUsers    from '@/components/group/EditGroupUsers.vue'
   import AddGroupUser      from '@/components/group/AddGroupUser.vue'  
   import TextButton        from '@/components/util/TextButton.vue'
   
   import { Emit } from '@/utils/constants'
   
   const props = defineProps([ 'groupId' ])
   const emit  = defineEmits([ Emit.DONE ])
   
   const groupStore = useGroupStore()
   const showAddDialog = ref(false)
   
   const group = computed(() => { return groupStore.getGroup(props.groupId) })
</script>

<style>
</style>
