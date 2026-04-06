import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useChannelStore } from '@/stores/channelStore'
   
export const useChannelMgr = defineStore('channelMgr', () => {
   const channelStore = useChannelStore()
   
   const myChannels = computed(() => { 
      const channels = [ ...channelStore.myChannels ]
      channels.sort(function(a, b) { return a.name.localeCompare(b.name) })    
      return channels
   })

   const myActiveChannels = computed(() => { 
      const activeChannels = []
      for (const channel of myChannels.value) {
         if (channel.active) { activeChannels.push(channel) }
      }
      return activeChannels
   })

   function updateChannel(channel) { channelStore.updateChannel(channel) }

   return { myChannels, myActiveChannels, updateChannel }
})
