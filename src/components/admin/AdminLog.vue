<template>
   <div class="text-left">
      <div class="text-h5">
         Log Entries
         <TextButton v-if="selectedEntryIds.length" @click="deleteSelected()" text="Delete Selected"></TextButton>
         <span v-else>
            <TextButton v-if="showAll" @click="showAll=false" text="Show Errors"/>
            <TextButton v-else         @click="showAll=true"  text="Show All"/>
            <TextButton @click="deleteOld()" text="Delete Old"/>
            <TextButton @click="deleteAll()" text="Delete All"/>
         </span>
      </div>
      <v-data-table :headers="headers" :items="displayEntries" show-select v-model="selectedEntryIds" 
            items-per-page="50" density="compact">
         <template v-slot:item.dateCreated="{ item }">   
            <span style="white-space: nowrap">
               {{ dateTimeString(item.dateCreated) }}
            </span>      
         </template>
         <template v-slot:item.isFlagged="{ item }">
            <IconButton v-if="item.isFlagged" IconButton icon="mdi-flag" color="red" @click="flag(item)"></IconButton>
            <IconButton v-else icon="mdi-flag-outline" @click="flag(item)"></IconButton>
         </template>
         <template v-slot:item.actions="{ item }">
            <DeleteButton @click="deleteEntry(item)"></DeleteButton>
         </template>
      </v-data-table>
   </div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { useUserStore }   from '@/stores/userStore'
   import { useDeviceStore } from '@/stores/deviceStore'
   import { useLogStore }    from '@/stores/logStore'
   import DeleteButton from '@/components/util/DeleteButton.vue'
   import IconButton   from '@/components/util/IconButton.vue'
   import TextButton   from '@/components/util/TextButton.vue'
   import { dateTimeString } from '@/utils/dateUtils'
   import { LogEntryType } from '@/utils/constants'

   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const userStore   = useUserStore()
   const deviceStore = useDeviceStore()
   const logStore    = useLogStore()
   const showAll = ref(true)
   const selectedEntryIds = ref([])
   
   const Headers = {
      TYPE:   { title: 'Type',        value: 'entryType', sortable: true },
      MSG:    { title: 'Message',     value: 'msg',       sortable: true },
      STATUS: { title: 'Status',      value: 'isFlagged', sortable: true },
      DATE:   { title: 'Occurred', key: 'dateCreated', align: 'center' },
      USER:   { title: 'User',        value: 'username',  sortable: true },
      DEVICE: { title: 'Device',      value: 'device',    sortable: true },
      ACTION: { title: '',         key: "actions" },
   
   }
   const headers = xs.value ?  
      [ Headers.MSG, Headers.DATE, Headers.USER ] :
      [ Headers.TYPE, Headers.MSG, Headers.STATUS, Headers.DATE, Headers.USER, Headers.DEVICE, Headers.ACTION ]

   const displayEntries = computed(() => { 
      const entries = []
      for (const entry of logEntries.value) {
         if (showAll.value || entry.entryType == LogEntryType.ERROR) { entries.push(entry) }
      }
      return entries
   })

   const logEntries = computed(() => { 
      const entries = []
      for (const entry of logStore.logEntries) {
         let device = deviceStore.getDeviceName(entry.deviceId)
         if (!device) { device = entry.deviceId }
         const displayEntry = { ...entry, 
            username: entry.userId ? userStore.getUsername(entry.userId) : "",
            device:   device }
         entries.push(displayEntry)
      }
      entries.sort(function(a, b){return b.dateCreated - a.dateCreated}) 
      return entries
   })

   const nonFlaggedEntries = computed(() => { 
      const entries = []
      for (const entry of logEntries.value) {
         if (!entry.isFlagged) { entries.push(entry) }
      }
      return entries
   })

   const flag = (log) => { logStore.updateEntry({ id: log.id, isFlagged: !log.isFlagged }) }
   
   const deleteEntry = (entry) => { logStore.deleteEntry(entry.id) }

   const deleteOld = () => { 
      const midnight = new Date().setHours(0, 0, 0)
      const oldIds = []
      for (const entry of nonFlaggedEntries.value) {
         if (entry.dateCreated.toDate() < midnight) { oldIds.push(entry.id) }
      }
      logStore.deleteEntries(oldIds) 
   }
   
   const deleteAll = () => { 
      const ids = nonFlaggedEntries.value ? nonFlaggedEntries.value.map(a => a.id) : []
      logStore.deleteEntries(ids) 
   }
   
   const deleteSelected = () => { 
      logStore.deleteEntries(selectedEntryIds.value) 
      selectedEntryIds.value = []
   }
</script>

<style>
</style>
