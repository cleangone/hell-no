<template>
   <div v-if="showChannels" class="text-left">
      <div class="text-h5">
         <TextButton @click="showAddDialog=true" text="Add Channel"/>
      </div>
      <v-data-table :headers="headers" :items="displayChannels" :custom-key-sort="customKeySort" density="compact" >
         <template v-slot:item.name="{ item }">
            <a @click="showChannel(item)">{{ item.name }}</a>
         </template> 
         <template v-slot:item.active="{ item }">
            {{ item.active ? "&nbsp; Yes" : "" }}
         </template>
         <template v-slot:item.dateCreated="{ item }">
            {{ item.dateCreated ? item.dateCreated.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.dateModified="{ item }">
            {{ item.dateModified ? item.dateModified.toDate().toLocaleDateString() : "" }}
         </template>
         <template v-slot:item.actions="{ item }">
            <EditButton   @click="editChannel(item)"/>
            <DeleteButton @click="deleteChannel(item)"/>
         </template>
      </v-data-table>
   </div>
   <div v-else class="text-left">
      <AccountChannel :channelId="selectedChannel.id" @done="showChannels=true"/>
   </div>

   <v-dialog v-model="showAddDialog" width="auto">
      <AddChannel :userId="userStore.userId" @done="showAddDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditChannel :channel="selectedChannel" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeleteChannel :channel="selectedChannel" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useUserStore }   from '@/stores/userStore'
   import { useChannelMgr }  from '@/stores/channelMgr'
   import { useDeviceStore } from '@/stores/deviceStore'
   import AccountChannel from './AccountChannel.vue'
   import AddChannel     from '@/components/channel/AddChannel.vue'
   import EditChannel    from '@/components/channel/EditChannel.vue'
   import DeleteChannel  from '@/components/channel/DeleteChannel.vue'
   import EditButton     from '@/components/util/EditButton.vue'
   import DeleteButton   from '@/components/util/DeleteButton.vue'
   import TextButton     from '@/components/util/TextButton.vue'
   const userStore    = useUserStore()
   const channelMgr   = useChannelMgr()
   const deviceStore  = useDeviceStore()
   const showAddDialog    = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   const showChannels = ref(true)
   const selectedChannel = ref({})
   
   const headers = [
      { title: 'Name',     key: 'name',         value: 'name'},
      { title: 'Active',   key: 'active' },
      // { title: 'Subscribed Devices', key: 'deviceNames'},
      { title: 'Created',  key: 'dateCreated',  value: 'dateCreated',  align: 'center' },
      { title: 'Modified', key: 'dateModified', value: 'dateModified', align: 'center' },
      { title: '',         key: "actions" },
   ]

   const customKeySort = {
      name:          (a, b) => { return a.localeCompare(b) }, 
      dateCreated:   (a, b) => { return b - a }, 
      dateModified:  (a, b) => { return b - a }
   } 

   const displayChannels = computed(() => channelMgr.myChannels)
   //    const channels = []
   //    for (const channel of channelMgr.myChannels) {
   //       // const deviceNames = []
   //       // for (const deviceId of channel.deviceIds) {
   //       //    const device = deviceStore.deviceIdToMyDevice.get(deviceId)
   //       //    if (device) { deviceNames.push(device.name) }
   //       // }
   //       // channels.push( { ...channel, deviceNames: deviceNames.join(', ') })
   //       channels.push(channel)
   //    }
   //    return channels
   // })
  
   const showChannel = (channel) => { 
      selectedChannel.value = channel
      showChannels.value = false
   }

   const editChannel   = (channel)  => { showDialog(showEditDialog,   channel) }
   const deleteChannel = (channel)  => { showDialog(showDeleteDialog, channel) }
   const showDialog = (showDialog, channel) => {
      selectedChannel.value = channel
      showDialog.value = true
   }
</script>

<style>
</style>
