<template>
   <v-container>
      <v-row no-gutters class="flex-nowrap">
         <v-col cols="2" class="flex-grow-0 flex-shrink-0"></v-col>
         <v-col cols="1" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%;">
            <div v-if="viewMgr.isDeskTop" style="font-size: 40px;">Feed Swipe Demo</div>
         </v-col>
         <v-col cols="2" class="flex-grow-0 flex-shrink-0 align-self-end">
         </v-col>
      </v-row>
   </v-container>

   <div id="item-swipe" v-if="allSwipeItems.length" class="center d-flex justify-center">
      <ItemThumbSwipe v-for="item in currSwipeItems" :key="item.id" :item="item" :hasBottomItem="hasBottomItem"
         v-on:swipeLeft="onSwipeLeftStarted" v-on:swipeRight="onSwipeRightStarted" 
         v-on:swipeUp="onSwipeUpDownStarted" v-on:swipeDown="onSwipeUpDownStarted" 
         v-on:done="onSwipeDone"
         :style="{position: 'absolute', height: '400px', width: '250px', borderRadius: '8px' }" />
   </div> 
   <TextButton v-else @click="resetSwipeItems()" text="Reset Swipe"></TextButton>
   
   <!-- needed to drive computation of displayItems -->
   <div v-show="false">{{ displayItems.length }}</div>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useFeedStore } from '@/stores/feedStore'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemThumbSwipe from '@/components/item/ItemThumbSwipe.vue'
   import TextButton     from '@/components/util/TextButton.vue'
   import { Emit } from '@/utils/constants'
   
   const feedStore = useFeedStore()
   const itemMgr   = useItemMgr()
   const viewMgr   = useViewMgr()
   const allSwipeItems = ref([])
   const swipeTopIndex = ref(0)  // index of top card/curr on swipe
   const swipeBotIndex = ref(null) // index of bottom card - null/prev/next depending on swipe direction   
   
   const feedItems = computed(() => feedStore.myFeed ? itemMgr.ungroupItems(feedStore.myFeed.feedItems) : [])

   // for now, insulate allSwipeItems from changes when feed items saved/dismissed
   const displayItems = computed(() => { 
      const dispItems = [ ...feedItems.value ]
      allSwipeItems.value = [ ...dispItems ]    
      console.log("allSwipeItems", allSwipeItems.value)
      return dispItems
   })

   const hasBottomItem = computed(() => swipeBotIndex.value != null)
   
   const resetSwipeItems = () => {
      allSwipeItems.value = [ ...displayItems.value ] 
      swipeTopIndex.value = 0
      swipeBotIndex.value = null
   }

   const currSwipeItems = computed(() => {
      console.log("currSwipeItems", swipeBotIndex.value, swipeTopIndex.value)
      const swipeItems = []
      if ( allSwipeItems.value.length) {
         if (swipeBotIndex.value != null) { swipeItems.push(allSwipeItems.value[swipeBotIndex.value]) }
         if (swipeTopIndex.value != null) { swipeItems.push(allSwipeItems.value[swipeTopIndex.value]) }
      }
      // if (swipeItems[0]) { console.log("currSwipeItems[0]", swipeItems[0].name) }
      // if (swipeItems[1]) { console.log("currSwipeItems[1]", swipeItems[1].name) }
      return swipeItems
   })

   const onSwipeLeftStarted = (itemName) => {
      console.log("onSwipeLeftStarted", itemName)
      swipeBotIndex.value = swipeTopIndex.value < allSwipeItems.value.length - 1 ?  
         swipeTopIndex.value + 1 : null
   }
   
   const onSwipeRightStarted = (itemName) => {
      console.log("onSwipeRightStarted", itemName)
      swipeBotIndex.value = swipeTopIndex.value > 0 ? swipeTopIndex.value - 1 : null
   }
   
   const onSwipeUpDownStarted = (itemName) => {
      console.log("onSwipeUpDownStarted - " + allSwipeItems.value.length + " items")
      if (swipeTopIndex.value < allSwipeItems.value.length - 1) {
         swipeBotIndex.value = swipeTopIndex.value + 1
      }
      else if (swipeTopIndex.value > 0) {
         swipeBotIndex.value = swipeTopIndex.value - 1
      }
      else { swipeBotIndex.value = null }
   }

   const onSwipeDone = (swipeEmit, itemName) => {
      console.log("onSwipeDone", swipeEmit, itemName)
      // console.log("onSwipeDone: allSwipeItems.length", allSwipeItems.value.length )
      // console.log("onSwipeDone: botIndex, topIndex", swipeBotIndex.value, swipeTopIndex.value)
      
      // delay actions so swipe finishes smoothly 
      setTimeout(() => {
         if (swipeEmit == Emit.SWIPE_LEFT) {
            if (swipeTopIndex.value < allSwipeItems.value.length -1) { swipeTopIndex.value++ }   
         }
         else if (swipeEmit == Emit.SWIPE_RIGHT) {
            if (swipeTopIndex.value > 0) { swipeTopIndex.value-- }
         }
         else if (swipeEmit == Emit.SWIPE_UP || swipeEmit == Emit.SWIPE_DOWN) {
            allSwipeItems.value.splice(swipeTopIndex.value, 1)
            if (!allSwipeItems.value.length) { swipeTopIndex.value = null }  
            else if (swipeTopIndex.value == allSwipeItems.value.length) { swipeTopIndex.value-- }  
         }
         swipeBotIndex.value = null 
      }, 300)
   }
</script>

<style>
item-swipe {
   height: 100vh;
   width: 100vw;
}

</style>
