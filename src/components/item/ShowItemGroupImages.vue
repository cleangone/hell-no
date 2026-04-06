<template>
   <v-card :style="cardStyle">
      <v-card-title>
         <v-row no-gutters class="flex-nowrap" style="white-space:nowrap">
            <v-col cols="5" class="flex-grow-0 flex-shrink-0 nav-left font-weight-medium">
               {{ itemToShow.name }}
            </v-col>
            <v-col class="d-flex flex-grow-1 flex-shrink-0 justify-center">
               <IconButton icon="mdi-chevron-left"  @click="prev()" size="med" />
               <IconButton icon="mdi-chevron-right" @click="next()" size="med"/>
            </v-col>
            <v-col cols="5" class="flex-grow-0 flex-shrink-0 nav-right" >
               <IconButton icon="mdi-arrow-expand" @click="fullscreenToggle"/>
               <IconButton icon="mdi-close" @click="$emit(Emit.DONE)"/>
            </v-col>
         </v-row>
      </v-card-title>
      <div v-if="isItemGroup(itemToShow)" ref="fullscreenEle" @click="$emit(Emit.DONE)" class="center d-flex justify-center mx-3"  >
         <div class="d-flex align-center bg-black">
            <img v-if="itemToShow.childItems.length" :src="itemToShow.childItems[0].primaryImage.url" 
               :width="childItemTargetWidth(0)" class="first-image"/>
            <img v-if="itemToShow.childItems.length > 1" :src="itemToShow.childItems[1].primaryImage.url" 
               :width="childItemTargetWidth(1)" class="next-image"/> 
            <img v-if="itemToShow.childItems.length > 2" :src="itemToShow.childItems[2].primaryImage.url" 
               :width="childItemTargetWidth(2)" class="next-image"/>
         </div>
      </div>
      <v-img v-else-if="itemToShow.primaryImage" :src="itemToShow.primaryImage.url" contain ref="fullscreenEle" @click="$emit(Emit.DONE)" class="mx-3"/>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { onKeyStroke, useFullscreen, useWindowSize } from '@vueuse/core'
   import { useItemMgr } from '@/stores/itemMgr'
   import IconButton from '@/components/util/IconButton.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ initialItem: Object, parentItem: Object })
   const emit = defineEmits([Emit.DONE])

   const { width: windowWidth } = useWindowSize()
   const itemMgr = useItemMgr()
   const itemToShow = ref({})
   const navItems   = ref([])
   const fullscreenEle = ref(null)
   const { toggle: fullscreenToggle } = useFullscreen(fullscreenEle)  

   onMounted(async() => {
      itemToShow.value = props.initialItem
      navItems.value = [ props.parentItem, ...props.parentItem.childItems ]
   })

   const childItemsTotalWidth = computed(() => { 
      let totalWidth = 0
      if (isItemGroup(itemToShow.value)) {
         for (const childItem of itemToShow.value.childItems) {
            totalWidth += childItem.primaryImage.dimensions.width
         }
      }
      return totalWidth
   })

   const childItemTargetWidth = (index) => {
      const totalTargetWidth = windowWidth.value * .95 
      const childTargetWidth =  
         Math.round(totalTargetWidth * itemToShow.value.childItems[index].primaryImage.dimensions.width / childItemsTotalWidth.value)
      return childTargetWidth
   }

   const cardStyle = computed(() => "min-width:" + (windowWidth.value - 100) + "px")
   const isItemGroup = (item) => { return itemMgr.isItemGroup(item)  }
   
   const prev = () => { 
      let prevIndex = -1
      for (let [index, item] of navItems.value.entries()) {
         if (item.id == itemToShow.value.id) {
            prevIndex = index == 0 ? navItems.value.length - 1 : index - 1
         }
      }
      if (prevIndex != -1) { itemToShow.value = navItems.value[prevIndex] }
   }
   const next = () => { 
      let nextIndex = -1
      for (let [index, item] of navItems.value.entries()) {
         if (item.id == itemToShow.value.id) { 
            nextIndex = index == navItems.value.length - 1 ? 0 : index + 1
         }
      }
      if (nextIndex != -1) { itemToShow.value = navItems.value[nextIndex] }
   }

   // stopPropagation not working
   onKeyStroke('ArrowLeft', (e) => {
      prev()
      e.preventDefault()
      e.stopPropagation()
      return false
   })
   onKeyStroke('ArrowRight', (e) => {
      next()
      e.preventDefault()  
      e.stopPropagation()
      return false
   })
   onKeyStroke('ArrowUp', (e) => { emit(Emit.DONE) })
</script>

<style>
.first-image {
   border: 4px solid black; 
   float: left;
}
.next-image {
   border-top:    4px solid black; 
   border-bottom: 4px solid black; 
   border-right:  4px solid black; 
   float: left;
}
</style>
