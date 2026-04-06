<template>
   <div class="wall-container">
      <RouterLink v-for="(wallItem, index) in activeWallItems" :key="wallItem.itemId" 
            :to="itemMgr.itemURL(wallItem.itemId, ItemOrigin.WALL)">
         <Transition>
            <!-- using v-show because intantiating based on visibility with v-if flashes -->
            <v-img v-show="wallItem.isVisible"
               :src="wallItem.thumbUrl" :width="wallItem.width" :style="position(wallItem)"
               @mouseover="mouseover(index)" @mouseleave="mouseleave(index)"></v-img>
         </Transition>
      </RouterLink>
      <div v-if="!allItemsVisible" style="position: absolute; right: 10px; bottom:10px">
         <IconButton v-if="isActive" icon="mdi-pause" @click="pause"/>
         <IconButton v-else icon="mdi-play" @click="resume"/>  
      </div>
      <div v-if="popupImage" class="image-popup text-center" :style="popupStyle">
         <v-img :src="popupImage.largeThumbUrl"></v-img>
         <div class="text-white"> {{ popupImage.name }} </div>
      </div>
  </div>
</template>

<script setup>
   import { computed, onMounted, ref, onUnmounted } from 'vue'
   import { useWindowSize } from '@vueuse/core'
   import { useIntervalFn } from '@vueuse/core'
   import { useUserStore }  from '@/stores/userStore'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import IconButton from '@/components/util/IconButton.vue'
   import { ItemOrigin, URL } from '@/utils/constants'
   
   const props = defineProps({ wallItems: Array })
   const { width: windowWidth } = useWindowSize()
   const userStore = useUserStore()
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const startVisibleIndex = ref(0)
   const popupImage = ref(null)
   
   onMounted(() => {
      console.log("onMounted")
      window.addEventListener('resize', onWWindowResize)
   })

   onUnmounted(() => {
      console.log("onUnmounted")
   })
   
   // wallItems that will be actively faded in & out
   const activeWallItems = computed(() => { 
      const wallItems = props.wallItems ? props.wallItems : [ ...userStore.myWallItems]
      
      const activeItems = []
      const navItems = []
      for (const wallItem of wallItems) { 
         activeItems.push({ ...wallItem, isVisible: false, mouseleaveTime: Date.now() })
         navItems.push({ id: wallItem.itemId, name:wallItem.name, 
            primaryImage:{ thumbUrl:wallItem.thumbUrl, url:wallItem.url, dimensions:wallItem.dimensions} })
      }
      viewStore.setVisibleItems(ItemOrigin.WALL, "Home Art Wall", URL.HOME, navItems) 

      console.log("activeWallItems: initial activeItems", activeItems)
      setVisibleItems(activeItems, 0)
      console.log("activeWallItems: final activeItems", activeItems)
      return activeItems
   }) 

   // problem with automation - new list will not repaint unless interval stopped
   const millis = ref(0)
   const { pause, resume, isActive } = useIntervalFn(() => { 
      const now = Date.now()
      if (millis.value == 0) { 
         console.log("useIntervalFn")
         millis.value = now 
      }
      else { console.log("useIntervalFn", Math.floor((now - millis.value)/1000)) }

      if (!allItemsVisible.value) { 
         advanceVisible() 
         pause()
      }
   }, 10000)

   const onWWindowResize = () => { resetVisible() }

   const allItemsVisible = computed(() => { 
      for (const wallItem of activeWallItems.value) { 
         if (!wallItem.isVisible) { return false } 
      }
      return true
   })  

   const advanceVisible = () => { 
      console.log("advanceVisible: startVisibleIndex", startVisibleIndex.value)
      startVisibleIndex.value = advanceIndex(startVisibleIndex.value)
      resetVisible()
   }

   const advanceIndex = (index) => { 
      console.log("advanceIndex", index)
      return index == activeWallItems.value.length - 1 ? 0 : index + 1
   }

   const setVisible = () => { 
      console.log("setVisible")
      setVisibleItems(activeWallItems.value, startVisibleIndex.value)
   }

   const setVisibleItems = (activeItems, startIndex) => { 
      console.log("setVisibleItems: activeItems.length, startIndex", activeItems.length, startIndex)
      
      let currX = 5
      let index = startIndex
      let wallItem = activeItems[index]
      currX = setItemVisible(wallItem, currX)
      console.log("setVisibleItems: wallItem", wallItem.name, wallItem.isVisible)
      
      if (activeItems.length == 1 ) { return }

      index = index == activeItems.length - 1 ? 0 : index + 1
      console.log("preloop", wallItem.name, wallItem.isVisible, index, startIndex)
      while (wallItem.isVisible && index != startIndex) { 
         
         wallItem = activeItems[index]
         currX = setItemVisible(wallItem, currX)
         
         
         index = index == activeItems.length - 1 ? 0 : index + 1
         console.log("loop end", wallItem.name, wallItem.isVisible, index, startIndex)
      
      }

      console.log("setVisibleItems done")
   }

   const setItemVisible = (wallItem, currX) => { 
      console.log("setItemVisible", wallItem.name)
      
      wallItem.x = currX
      if (wallItem.x + wallItem.width < windowWidth.value - 75) {
         wallItem.isVisible = true
         return currX + wallItem.width + 10
      }

      return currX
   }
   
   const resetVisible = () => { 
      console.log("resetVisible: startVisibleIndex", startVisibleIndex.value)
      for (const wallItem of activeWallItems.value) { 
         wallItem.isVisible = false
      }
      
      // wait for fade out then show next set
      setTimeout(function() { setVisible() }, 1000)
   }

   const position = (wallItem) => { return "position: absolute; left:" + wallItem.x + "px; top:" + wallItem.y + "px" }

   const popupStyle = computed(() => { 
      return  "position:absolute; z-index:10; " + 
              "left:" + popupImage.value.x + "px; top: " +  popupImage.value.y + "px; " +
              "width:" + popupImage.value.width + "px; height: " + popupImage.value.height + "px;"
   })  

   const mouseover = (index) => {
      const mouseoverTime = Date.now()
      setTimeout(() => {  // debounce mouseover 
         if (mouseoverTime > activeWallItems.value[index].mouseleaveTime ) { 
            const wallItem = activeWallItems.value[index]
            
            const offset = 25
            const aspectRatio = itemMgr.aspectRatio(wallItem.dimensions)
            const popupWidth = aspectRatio < 1 ? 300 : 500  
            const popupHeight = Math.round(popupWidth / aspectRatio) + 25
            
            const x = wallItem.x < windowWidth.value / 2 ? 
                  wallItem.x + wallItem.width + offset : 
                  wallItem.x - popupWidth - offset 
            const y = wallItem.y - offset 
            
            popupImage.value = { 
               name:wallItem.name, largeThumbUrl:wallItem.largeThumbUrl, thumbUrl:wallItem.thumbUrl, 
               x:x, y:y, width:popupWidth, height:popupHeight
            } 
            if (wallItem.artist) { popupImage.value.name += " - " + wallItem.artist.fullName }
         }
      }, 250)  
   }
   const mouseleave = (index) => {
      activeWallItems.value[index].mouseleaveTime = Date.now()
      popupImage.value = null 
   }
</script>

<style>
.wall-container {
   width: 100%;
   height: 100%;
   position: relative;
}

.wall-container .image-popup {
   background-color: black;
   border: 5px solid black; 
}

.v-enter-active, .v-leave-active {
  transition: opacity 1s ease;
}
.v-enter-from, .v-leave-to {
  opacity: 0;
}
</style>
