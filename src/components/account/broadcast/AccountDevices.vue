<template>
   <div class="text-left">
      <div class="text-h5">
         <TextButton v-if="!currDeviceExists" @click="showAddDialog=true" text="Add This Device"/>
      </div>
      <v-data-table :headers="headers" :items="displayDevices" :custom-key-sort="customKeySort" density="compact" >
         <template v-slot:item.isCurrDevice="{ item }">
            {{ item.isCurrDevice ? "&nbsp; &nbsp; Yes" : "" }}
         </template>
        
         <template v-slot:item.dateCreated="{ item }">
            {{ item.dateCreated ? item.dateCreated.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.dateModified="{ item }">
            {{ item.dateModified ? item.dateModified.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.actions="{ item }">
            <EditButton   @click="editDevice(item)"/>
            <DeleteButton @click="deleteDevice(item)"/>
         </template>
      </v-data-table>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddDevice :userId="userStore.userId" @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditDevice :device="selectedDevice" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteDevice :device="selectedDevice" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }   from '@/stores/userStore'
   import { useDeviceStore } from '@/stores/deviceStore'
   import { useViewStore }   from '@/stores/viewStore'
   import AddDevice    from '@/components/device/AddDevice.vue'
   import EditDevice   from '@/components/device/EditDevice.vue'
   import DeleteDevice from '@/components/device/DeleteDevice.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import TextButton    from '@/components/util/TextButton.vue'

   const userStore   = useUserStore()
   const deviceStore = useDeviceStore()
   const viewStore   = useViewStore()
   const showAddDialog    = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   const currDeviceExists = ref(false)
   const selectedDevice = ref({})
   
   const headers = [
      { title: 'Name',        key: 'name',         value: 'name'},
      { title: 'This Device', key: 'isCurrDevice' },
      { title: 'Created',     key: 'dateCreated',  value: 'dateCreated',  align: 'center' },
      { title: 'Last Ping',   key: 'dateModified', value: 'dateModified', align: 'center' },
      { title: '',            key: "actions" },
   ]

   const customKeySort = {
      name:          (a, b) => { return a.localeCompare(b) }, 
      dateCreated:   (a, b) => { return b - a }, 
      dateModified:  (a, b) => { return b - a }
   } 

   const displayDevices = computed(() => {
      const devices = []
      currDeviceExists.value = false
      for (const device of deviceStore.myDevices) {
         const displayDevice = { ...device, isCurrDevice: viewStore.deviceId == device.id }
         devices.push(displayDevice)
         if (displayDevice.isCurrDevice) {  currDeviceExists.value = true }
      }
      return devices
   })
  
   const editDevice   = (device)  => { showDialog(showEditDialog,   device) }
   const deleteDevice = (device)  => { showDialog(showDeleteDialog, device) }
   const showDialog = (showDialog, device) => {
      selectedDevice.value = device
      showDialog.value = true
   }
</script>

<style>
</style>
