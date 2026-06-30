<template>
   <v-card :width="cardWidth" ref="cardRef" style="z-index: 1" :class="cardMargin"
         class="d-flex flex-column text-center thumb-container thumb-link">
      <RouterLink :to="itemURL">
         <v-img :src="thumbUrl" @mouseover="mouseover()" @mouseleave="mouseleave()"></v-img>
      </RouterLink>
      <ItemThumbText v-if="showText" :item="item" :origin="origin" :useAltName="useAltName" :useLocalName="useLocalName" 
         :bypassShowUser="bypassShowUser" :showDateViewed="showDateViewed"/>
   </v-card>
   
   <ItemPopup v-if="popup" :popupImage="popup"/>
</template>

<script setup>
   import { computed, onErrorCaptured, ref } from 'vue'
   import { useItemMgr }   from '@/stores/itemMgr'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import ItemPopup        from '@/components/item/ItemPopup.vue'
   import ItemThumbText    from './ItemThumbText.vue'
   import { handleError } from '@/utils/utils'
   import { Defaults, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ 
      item: Object, origin: String, useAltName: Boolean, useLocalName: Boolean, bypassShowUser:Boolean, showDateViewed:Boolean })

   const MaxLandscapeWidths = { 
      sizes:   new Map([ [ThumbSize.IMG, 200], [ThumbSize.SM, 200], [ThumbSize.MED, 250], [ThumbSize.LG, Defaults.MAX_THUMB_SIDE] ]),
      xsSizes: new Map([ [ThumbSize.IMG, 125], [ThumbSize.SM, 125], [ThumbSize.MED, 175], [ThumbSize.LG, Defaults.MAX_THUMB_SIDE] ]) }
      
   const itemMgr   = useItemMgr()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   const cardRef = ref(null)
   const popup = ref(null)
   const mouseleaveTime = ref(Date.now())
   
   onErrorCaptured((err) => { return handleError(err, "ItemThumbSingle") })

   const item    = computed(() => props.item)
   const itemURL = computed(() => {   
      const id = props.item.linkId ? props.item.linkId : props.item.id
      return itemMgr.itemURL(id, props.origin, props.item.childNum)
   })
   const thumbUrl    = computed(() => item.value.primaryImage.thumbUrl)
   const artist      = computed(() => item.value.primaryArtist ? item.value.primaryArtist.fullName : null)
   const thumbSize   = computed(() => viewMgr.isXs ? viewStore.thumbSize.xsSize : viewStore.thumbSize.size)
   const showText    = computed(() => thumbSize.value != ThumbSize.IMG)
   const aspectRatio = computed(() => itemMgr.itemAspectRatio(item.value))
   const cardMargin  = computed(() => showText.value ? "mb-5" : "mb-2")
   const cardWidth   = computed(() => { 
      const targetHeight = viewMgr.targetThumbHeight
      let targetWidth = Math.round(targetHeight * aspectRatio.value)
      if (targetWidth > Defaults.MAX_THUMB_SIDE) { targetWidth = Defaults.MAX_THUMB_SIDE}
      
      if (aspectRatio.value > 2 && targetWidth == Defaults.MAX_THUMB_SIDE) {
         targetWidth = viewMgr.isXs ? 
            MaxLandscapeWidths.xsSizes.get(thumbSize.value) :
            MaxLandscapeWidths.sizes.get(thumbSize.value)
      }
      return targetWidth
   })

   const mouseover = () => {
      if (viewMgr.isMobile) { return }

      const mouseoverTime = Date.now()     
      setTimeout(() => {  // debounce mouseover 
         if (mouseoverTime > mouseleaveTime.value ) { 
            const boundingRect = cardRef.value.$el.getBoundingClientRect()
            const aspectRatio = itemMgr.itemAspectRatio(item.value)
            popup.value = itemMgr.getPopupImage(
               item.value.name, artist.value, item.value.primaryImage.largeThumbUrl, boundingRect, aspectRatio)
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
</style>
