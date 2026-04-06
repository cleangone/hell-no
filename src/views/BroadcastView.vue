<template>
   <div v-if="viewMgr.isDeskTop" class="title">Broadcast</div>
   <div class="text-left">
      <span v-if="broadcasting">
         <TextButton @click="stopBroadcast()" text="Stop Broadcast"/>
         <IconButton icon="mdi-chevron-left" @click="prev()" size="med"/>
         <IconButton v-if="broadcastPlaying" icon="mdi-pause" @click="pause()"/>
         <IconButton v-else icon="mdi-play" @click="play()"/>
         <IconButton icon="mdi-chevron-right" @click="next()" size="med"/>  
         <v-text-field v-model="broadcastRefreshSeconds" label="Refresh (Seconds)" type="number"
         style="max-width: 200px"/>
      </span>
      <div v-else> 
         <TextButton @click="broadcastPublic()" text="Broadcast Public Items"/>
         <v-menu>
            <template v-slot:activator="{ props }">
               <TextButton v-bind="props" text="Broadcast Gallery"/>
            </template>
            <v-list>
               <v-list-item v-for="gallery in populatedGalleries" @click="broadcastGallery(gallery)">
                  <v-list-item-title>{{ gallery.name }}</v-list-item-title>
               </v-list-item>
            </v-list>
         </v-menu>
      </div>
   </div>

   <!-- need 2 fluid containers to span full width -->
   <v-container v-if="viewMgr.isDeskTop" fluid>
      <v-container fluid> 
         <v-row justify="space-around">
            <div v-for="channel in channelMgr.myActiveChannels" :key="channel.id">
               <div v-if="channel.broadcastItem">
                  <div class="text-subtitle-1 mb-2">{{ channel.name }}</div>
                  <BroadcastItem :broadcastItem="channel.broadcastItem"/>
               </div>
            </div>
         </v-row>
      </v-container>
   </v-container>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemStore }    from '@/stores/itemStore'
   import { useItemMgr }      from '@/stores/itemMgr'
   import { useGalleryStore } from '@/stores/galleryStore'
   import { useChannelMgr }   from '@/stores/channelMgr'
   import { useViewMgr }      from '@/stores/viewMgr'
   import BroadcastItem from '@/components/account/broadcast/BroadcastItem.vue'
   import IconButton    from '@/components/util/IconButton.vue'
   import TextButton    from '@/components/util/TextButton.vue'
   import { isHidden } from '@/utils/utils'
   
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const galleryStore = useGalleryStore()
   const channelMgr   = useChannelMgr()
   const viewMgr      = useViewMgr()
   const broadcasting = ref(false)
   const broadcastPlaying = ref(false)
   const broadcastRefreshSeconds = ref(5) 
   const broadcastItems = ref({ 
         items:[], currItems:[], datePopulated:Date.now(), datePlayed:Date.now() })

   const channels = computed(() => channelMgr.myActiveChannels )

   const populatedGalleries = computed(() => { 
      const galleries = []
      for (const gallery of galleryStore.myGalleries) {
         if (gallery.itemIds?.length) { galleries.push(gallery) }
      }
      return galleries
   })

   const broadcastPublic = () => { 
      broadcastItems.value.items = itemMgr.ungroupAndExtractItems(itemStore.publicItems)
      startBroadcast()
   }
   
    const broadcastGallery = (gallery) => { 
      const galleryItems = []
      const galleryItemIds = gallery.itemIds ? gallery.itemIds : []
      for (const item of itemStore.getGalleryItems(gallery.id)) {
         const galleryItem = { ...item, position: galleryItemIds.indexOf(item.id) + 1 }     
         galleryItems.push(galleryItem) 
      }
      galleryItems.sort(function(a, b) {return a.position - b.position}) 
      
      broadcastItems.value.items = []
      for (const item of itemMgr.ungroupAndExtractItems(galleryItems)) {
         if (!isHidden(item)) { broadcastItems.value.items.push(item) + 1 }     
      }
      
      startBroadcast() 
   }

   const startBroadcast = () => { 
      broadcasting.value     = true
      broadcastPlaying.value = true

      broadcastItems.value.currItems = []
      broadcastItems.value.datePlayed = Date.now()
      for (const channel of channels.value) {
         populateBroadcastItem()
      }
      broadcastContent()
   }

   const stopBroadcast = () => { broadcasting.value = false }

   const pause = () => { broadcastPlaying.value = false }
   const play = () => { 
      broadcastPlaying.value = true
      setBroadcastTimeout()
   }

   const prev = () => { 
      decrementBroadcastItems()
      populateChannels() }
   const next = () => { 
      incrementBroadcastItems()
      populateChannels() 
   }

   const broadcastContent = () => { 
      populateChannels()
      setBroadcastTimeout()
   }

   const populateChannels = () => { 
      let currBroadcastItemIndex = 0
      for (const channel of channels.value) {
         const item = broadcastItems.value.currItems[currBroadcastItemIndex++]
         console.log(item.name + " - " + item.state)
         const artistName = item.primaryArtist?.fullName ? item.primaryArtist.fullName  : null
         const name = item.name + (artistName ? " - " + artistName : "")
         
         const broadcastItem = { id:item.id, name:name, primaryImage:item.primaryImage }
         channelMgr.updateChannel({ id:channel.id, broadcastItem:broadcastItem })
      }
      broadcastItems.value.datePlayed = new Date()
   }

   const setBroadcastTimeout = () => { 
      setTimeout(() => { 
         if (broadcasting.value && broadcastPlaying.value && broadcastItems.value.datePlayed > broadcastItems.value.datePopulated) {
            for (const channel of channels.value) {
               incrementBroadcastItems()
            }
            broadcastContent() 
         }
      }, broadcastRefreshSeconds.value * 1000) 
   }

   const populateBroadcastItem = () => { 
      const currLastIndex = broadcastItems.value.currItems.length ? 
         broadcastItems.value.currItems[broadcastItems.value.currItems.length-1].index : -1
      const nextIndex = currLastIndex == broadcastItems.value.items.length - 1 ? 0 : currLastIndex + 1 

      const nextItem = { ...(broadcastItems.value.items[nextIndex]), index: nextIndex }
      broadcastItems.value.currItems.push(nextItem)
      broadcastItems.value.datePopulated = Date.now()
   }

   const incrementBroadcastItems = () => { 
      populateBroadcastItem()
      broadcastItems.value.currItems.shift()
   }

   const decrementBroadcastItems = () => { 
      const currFirstIndex = broadcastItems.value.currItems[0].index
      const prevIndex = currFirstIndex == 0 ? broadcastItems.value.items.length - 1 : currFirstIndex - 1 
      
      const prevItem = { ...(broadcastItems.value.items[prevIndex]), index: prevIndex }
      broadcastItems.value.currItems.unshift(prevItem)
      broadcastItems.value.currItems.pop()
      broadcastItems.value.datePopulated = Date.now()
   }

   function getRandomItemIndex(max) { return Math.floor(Math.random() * (max + 1)) }
</script>

<style>
</style>
