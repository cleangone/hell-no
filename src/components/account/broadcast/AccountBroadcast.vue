<template>
   <AccountBroadcasts v-if="viewMgr.isMobile"/>
   <v-card v-else>
         <div>
         <v-tabs v-model="tab" color="primary" class="text-h6">
            <v-tab :value="tabs.broadcast">{{ tabs.broadcast }}</v-tab>
            <v-tab :value="tabs.channels">{{ tabs.channels }}</v-tab>
            <v-tab :value="tabs.devices">{{ tabs.devices }}</v-tab>
         </v-tabs>
      </div>
      <v-window v-model="tab" class="mt-3">
         <v-window-item :value="tabs.broadcast"><AccountBroadcasts/></v-window-item>
         <v-window-item :value="tabs.channels"><AccountChannels/></v-window-item>
         <v-window-item :value="tabs.devices"><AccountDevices/></v-window-item>
      </v-window>
   </v-card>
</template>

<script setup>
   import { ref } from 'vue'
   import { useViewMgr } from '@/stores/viewMgr'
   import AccountBroadcasts from './AccountBroadcasts.vue'
   import AccountChannels   from './AccountChannels.vue'
   import AccountDevices    from './AccountDevices.vue'
   
   const viewMgr = useViewMgr()
   const tabs = { broadcast: "Broadcast", channels: "Channels", devices: "Devices" }
   const tab = ref(tabs.broadcast)
</script>

<style>
</style>
