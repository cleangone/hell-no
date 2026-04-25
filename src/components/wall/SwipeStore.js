import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useSwipeStore = defineStore('wall-popup', () => {
   const firstActiveSlideLocal = ref(true)   
   const mouseoverActiveLocal = ref(false)   
   const transitionPopupActiveLocal = ref(false)

   
   const firstActiveSlide = computed(() => firstActiveSlideLocal.value)
   function setFirstActiveSlide(active) { firstActiveSlideLocal.value = active }
  
   const mouseoverActive = computed(() => mouseoverActiveLocal.value)
   function setMouseoverActive(active) { mouseoverActiveLocal.value = active }
  
   const transitionPopupActive = computed(() => transitionPopupActiveLocal.value)
   function setTransitionPopupActive(active) { transitionPopupActiveLocal.value = active }
  
   return { firstActiveSlide, setFirstActiveSlide, 
      mouseoverActive, setMouseoverActive, 
      transitionPopupActive, setTransitionPopupActive 
   }
})
