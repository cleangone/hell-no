<template>
   <v-card v-if="edit==Edit.GROUP" title="Edit Group" class="edit-group-dialog">
      <template v-slot:append>
         <IconButton icon="mdi-close" @click="$emit(Emit.DONE)" class="admin-link"/>
      </template>
      <div class="mt-n5">
         <TextButton text="Edit Images" @click="edit=Edit.IMAGE" class="ml-3"/>
         <TextButton text="Edit Users"  @click="edit=Edit.USER"/>
      </div>
      <EditGroup :group="group" @done="$emit(Emit.DONE)"/>
   </v-card>
   <EditGroupImages    v-else-if="edit==Edit.IMAGE" :groupId="group.id" @done="edit=Edit.GROUP"/>
   <EditGroupUsersCard v-else-if="edit==Edit.USER"  :groupId="group.id" @done="edit=Edit.GROUP" class="edit-group-dialog"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useGroupStore }  from '@/stores/groupStore'
   import EditGroup          from './EditGroup.vue'
   import EditGroupImages    from './EditGroupImages.vue'
   import EditGroupUsersCard from './EditGroupUsersCard.vue'
   import IconButton         from '@/components/util/IconButton.vue'
   import TextButton         from '@/components/util/TextButton.vue'
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
   width: 700px;
   min-height: 500px;
}
</style>
