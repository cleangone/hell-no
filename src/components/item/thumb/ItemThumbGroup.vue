<template>
   <v-card :width="groupWidth.cardWidth" ref="cardRef" style="z-index: 1"
         class="mb-5 d-flex flex-column text-center thumb-container thumb-link" >
      <RouterLink :to="itemMgr.itemURL(item.id, origin)" class="d-flex justify-center">
         <v-img v-for="(childItem, index) in childItems" :key="childItem.id" 
            :src="childItem.primaryImage.thumbUrl" :width="thumbWidth(childItem)"
            @mouseover="mouseover(childItem)" @mouseleave="mouseleave()" 
            :class="index==0 ? 'first-image' : 'next-image'"></v-img>
      </RouterLink>
      <ItemThumbText :item="item" :origin="origin" 
         :useAltName="useAltName" :useLocalName="useLocalName" :bypassShowUser="bypassShowUser"/>
   </v-card>

   <ItemPopup v-if="popup" :popupImage="popup"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemMgr } from '@/stores/itemMgr'
   import { useViewMgr } from '@/stores/viewMgr'
   import ItemPopup     from '@/components/item/ItemPopup.vue'
   import ItemThumbText from './ItemThumbText.vue'
   import { backgroundColorStyle } from '@/utils/utils'
   
   const props = defineProps({ item:Object, origin:String, 
      useAltName: Boolean, useLocalName: Boolean, bypassShowUser:Boolean
   })

   const itemMgr = useItemMgr()
   const viewMgr = useViewMgr()
   const cardRef = ref(null)
   const popup = ref(null)
   const mouseleaveTime = ref(Date.now())
   
   const childItems = computed(() => { return props.item.childItems })

   const groupWidth = computed(() => { 
      let totalWidth = 0
      let totalHeight = 0
      for (const childItem of childItems.value) {
         totalWidth += childItem.primaryImage.dimensions.width
         totalHeight += childItem.primaryImage.dimensions.height
      }
      const avghHeight = totalHeight/props.item.childItems.length
      const targetHeight = viewMgr.targetThumbHeight
      const aspectRatio = totalWidth / avghHeight
      const targetWidth = Math.round(targetHeight * aspectRatio)
      return { totalWidth: totalWidth, targetWidth: targetWidth, cardWidth: targetWidth.toString()}
   })

   const thumbWidth = (childItem) => {
      // subtract to account for borders
      return (groupWidth.value.targetWidth * childItem.primaryImage.dimensions.width / groupWidth.value.totalWidth) - 5
   }

   const mouseover = (childItem) => {
      const mouseoverTime = Date.now()     
      setTimeout(() => {  // debounce mouseover 
         if (mouseoverTime > mouseleaveTime.value ) { 
            const boundingRect = cardRef.value.$el.getBoundingClientRect() // rect of card holding all thumbs
            const aspectRatio = itemMgr.itemAspectRatio(childItem)
            popup.value = itemMgr.getPopupImage(
               childItem.name,
               childItem.primaryArtist ? childItem.primaryArtist.fullName : null,
               childItem.primaryImage.largeThumbUrl, 
               boundingRect, aspectRatio)
         }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      popup.value = null 
   }
</script>

<style>
.thumb-container {
   position: relative;
}
.first-image {
   border: 3px solid black; 
   float: left;
}
.next-image {
   border-top:    3px solid black; 
   border-bottom: 3px solid black; 
   border-right:  3px solid black; 
   float: left;
}
</style>
