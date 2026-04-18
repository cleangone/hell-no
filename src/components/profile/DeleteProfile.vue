<template>
   <DeleteConfirm type="Profile" :name="props.profile.name" @delete="deleteProfile()" @cancel="$emit(Emit.DONE)"/>
</template>

<script setup>
   import { useProfileStore } from '@/stores/profileStore'
   import DeleteConfirm from '@/components/util/DeleteConfirm.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ profile: Object })
   const emit = defineEmits([Emit.DONE])
   const profileStore = useProfileStore()
   
   const deleteProfile = () => {
      profileStore.deleteProfile(props.profile.id)
      emit(Emit.DONE)
   }
</script>

<style>
</style>
