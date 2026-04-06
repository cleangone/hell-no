<template>
   <div class="text-left text-h5">
      My Wall
      <TextButton @click="showEditWallDialog=true" text="Edit Wall"></TextButton>  
   </div>
   <ManageWall :wallId="wallId"/>
   <v-dialog v-model="showEditWallDialog" width="auto">
      <EditWall :wall="wall" @done="showEditWallDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore } from '@/stores/userStore'
   import { useWallStore }  from '@/stores/wallStore'
   import EditWall   from '@/components/wall/EditWall.vue'
   import ManageWall from '@/components/wall/ManageWall.vue'
   import TextButton from '@/components/util/TextButton.vue'
   
   const userStore = useUserStore()
   const wallStore = useWallStore()
   const wallId = computed(() => userStore.userId)
   const wall   = computed(() => wallStore.getWall(wallId.value) )
   const showEditWallDialog = ref(false)
</script>

<style>
</style>
