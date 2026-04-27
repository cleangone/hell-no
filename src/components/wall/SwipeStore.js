import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useSwipeStore = defineStore('wall-popup', () => {
   const firstActiveSlide = ref(true)   
   const popupMouseover   = ref(false)
   const thumbMouseover   = ref(false)   
   const transitionPopup  = ref(false)

   function reset() { 
      firstActiveSlide.value = true
      popupMouseover.value   = false
      thumbMouseover.value   = false
      transitionPopup.value  = false
   }
 
   const firstActiveSlideDisplayed = computed(() => firstActiveSlide.value)
   function setFirstActiveSlideDisplayed(active) { firstActiveSlide.value = active }
  
   const popupMouseoverActive = computed(() => popupMouseover.value)
   function setPopupMouseoverActive(active) { 
      popupMouseover.value = active 
      if (!active) { transitionPopup.value = false } // user has moused off of popup - take it down
   }
  
   const thumbMouseoverActive = computed(() => thumbMouseover.value)
   function setThumbMouseoverActive(active) { thumbMouseover.value = active }
  
   const transitionPopupActive = computed(() => transitionPopup.value)
   function setTransitionPopupActive(active) { transitionPopup.value = active }
  
   
   return { reset, 
      firstActiveSlideDisplayed, setFirstActiveSlideDisplayed, 
      popupMouseoverActive, setPopupMouseoverActive,
      thumbMouseoverActive, setThumbMouseoverActive, 
      transitionPopupActive, setTransitionPopupActive 
   }
})
