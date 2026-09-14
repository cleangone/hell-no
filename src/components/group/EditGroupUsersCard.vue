<template>
   <v-card title="Group Users" class="edit-group-dialog">
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)" class="admin-link"/>
      </template>
      <div class="mx-3">
         <EditGroupUsers :groupId="groupId"/>
      </div>
   </v-card>
</template>

<script setup>
   import { ref } from 'vue'
   import EditGroupUsers from './EditGroupUsers.vue'
   import IconButton     from '@/components/util/IconButton.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ groupId: Object })
   const emit  = defineEmits([Emit.DONE])
</script>

<style>
</style>