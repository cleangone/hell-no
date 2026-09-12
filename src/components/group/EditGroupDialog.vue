<template>
   <v-card v-if="edit==Edit.GROUP" title="Edit Group" class="edit-group-dialog">
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)" class="admin-link"/>
      </template>
      <div class="mt-n5">
         <TextButton text="Edit Images" @click="edit=Edit.IMAGE" class="mx-3"/>
         <TextButton text="Edit Users"  @click="edit=Edit.USER"  class="mx-3"/>
      </div>
      <EditGroup :group="group" @done="$emit(Emit.DONE)"/>
   </v-card>
   <EditGroupImages v-else-if="edit==Edit.IMAGE" :group="group" @done="edit=Edit.GROUP" class="edit-group-dialog"/>

   <!-- TODO - not implemented - can only edit users via Admin -->
   <!-- <EditGroupUsers  v-else-if="edit==Edit.USER"  :group="group" @done="edit=Edit.GROUP" class="edit-group-dialog"/> -->
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useGroupStore } from '@/stores/groupStore'
   import EditGroup         from './EditGroup.vue'
   import EditGroupImages   from './EditGroupImages.vue'
   import EditGroupUsers    from './EditGroupUsers.vue'
   import IconButton        from '@/components/util/IconButton.vue'
   import TextButton        from '@/components/util/TextButton.vue'
   import { Emit } from '@/utils/constants'
   
   const Edit = { GROUP: "group", IMAGE: "image", USER: "user" }

   const props = defineProps({ groupId: String })
   const emit  = defineEmits([ Emit.DONE ])

   const groupStore = useGroupStore()
   const edit       = ref(Edit.GROUP)
   
   const group = computed(() => groupStore.getMyGroup(props.groupId))
</script>

<style>
.edit-group-dialog {
   width: 900px;
   min-height: 500px;
}
</style>
