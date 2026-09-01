<template>
   <v-card :width="groupWidth.cardWidth" ref="cardRef" style="z-index: 1"
         class="mb-5 d-flex flex-column text-center thumb-container thumb-link" >
      <RouterLink :to="itemMgr.itemURL(item.id, origin)" class="d-flex justify-center">
         <v-img v-for="(childItem, index) in childItems" :key="childItem.id" 
            :src="childItem.primaryImage.thumbUrl" :width="thumbWidth(childItem)"
            @mouseover="mouseover(childItem)" @mouseleave="mouseleave()" 
            :class="index?'next-image':'first-image'"/>
      </RouterLink>
      <ItemThumbText v-if="showText" :item="item" :origin="origin" :useAltName="useAltName" :useLocalName="useLocalName" 
         :bypassShowUser="bypassShowUser" :showDateViewed="showDateViewed"/>
   </v-card>

   <ItemPopup v-if="popup" :popupImage="popup"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemPopup     from '@/components/item/ItemPopup.vue'
   import ItemThumbText from './ItemThumbText.vue'
   import { Emit, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ 
      item:Object, origin:String, size: String, 
      useAltName: Boolean, useLocalName: Boolean, 
      bypassShowUser:Boolean, showDateViewed:Boolean, emitPopup: Boolean })
   const emit = defineEmits([ Emit.POPUP ])

   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const cardRef = ref(null)
   const popup = ref(null)
   const mouseleaveTime = ref(Date.now())
   
   const childItems = computed(() => props.item.childItems)
   const thumbSize  = computed(() => props.size ?? (viewMgr.isXs ? viewStore.thumbSize.xsSize : viewStore.thumbSize.size))
   const showText   = computed(() => thumbSize.value != ThumbSize.IMG)
   const groupWidth = computed(() => itemMgr.getGroupWidthObj(props.item, viewMgr.getTargetThumbHeight(thumbSize.value)))

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
            const popupImage = itemMgr.getPopupImage(
               childItem.name,
               childItem.primaryArtist ? childItem.primaryArtist.fullName : null,
               childItem.primaryImage.largeThumbUrl, 
               boundingRect, aspectRatio)

            if (props.emitPopup) { emit(Emit.POPUP, popupImage) }
            else { popup.value = popupImage }
         }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      if (props.emitPopup) { emit(Emit.POPUP, null) }
      else { popup.value = null }
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
