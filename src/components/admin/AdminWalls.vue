<template>
   <div class="text-left">  
      <v-data-table :headers="headers" :items="displayWalls" :custom-key-sort="customKeySort" items-per-page="25" density="compact">
         <template v-slot:item.dateModified="{ item }">
            {{ item.dateModified ? item.dateModified.toDate().toLocaleDateString() : "" }}
         </template> 
         <template v-slot:item.addRecent="{ item }">
            <span class="ml-5">{{ item.addRecent ? "Yes" : "" }}</span>
         </template>
         <template v-slot:item.wallItems="{ item }">
            <span class="ml-3">{{ item.wallItems.length ? item.wallItems.length : "" }}</span>
         </template>
         <template v-slot:item.actions="{ item }">
            <EditButton @click="editWall(item)"></EditButton>
         </template>
      </v-data-table>
   </div>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditWall :wall="selectedWall" asAdmin @done="showEditDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useWallStore }  from '@/stores/wallStore'
   import { useWallMgr }    from '@/stores/wallMgr'
   import EditButton from '@/components/util/EditButton.vue'
   import EditWall   from '@/components/wall/EditWall.vue'
   
   const wallStore  = useWallStore()
   const wallMgr    = useWallMgr()
   const showEditDialog = ref(false)
   const selectedWall = ref({})
   
   const headers = [
      { title: 'Name',       key: 'name',        value: 'name' },
      { title: 'Add Recent', key: 'addRecent',   value: 'addRecent' },
      { title: 'Modified',   key:'dateModified', value: 'dateModified' },
      { title: 'Items',      key: 'wallItems',   value: 'firstName' },
      { title: '',           key: "actions" },
   ]

   const customKeySort = {
      name:         (a, b) => { return a.localeCompare(b) }, 
      dateModified: (a, b) => { return b - a }, 
   } 

   const displayWalls = computed(() => {
      const walls = []       
      for (const wall of wallStore.walls) {
         walls.push({ ...wall, name: wallMgr.name(wall) })
      }
      return walls
   })

   const editWall = (wall) => {
      selectedWall.value = wall
      showEditDialog.value = true
   }
</script>

<style>
</style>