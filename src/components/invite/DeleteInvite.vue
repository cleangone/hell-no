<template>
   <DeleteConfirm type="Invite" :name="inviteDesc" @delete="deleteInvite()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { computed } from 'vue'
   import { useInviteStore } from '@/stores/inviteStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({invite: Object})
   const emit = defineEmits([Emit.DONE])
   const inviteStore = useInviteStore()
       
   const inviteDesc = computed(() => props.invite.toFirstName + "'s " + props.invite.type + " invite")
   const deleteInvite = () => {
      inviteStore.deleteInvite(props.invite.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
