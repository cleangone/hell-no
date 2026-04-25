import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useSwipeStore = defineStore('wall-popup', () => {
   const mouseoverActiveLocal  = ref(false)   
   const transitionPopupActiveLocal = ref(false)

   const mouseoverActive = computed(() => mouseoverActiveLocal.value)
   function setMouseoverActive(active) { mouseoverActiveLocal.value = active }
  
   const transitionPopupActive = computed(() => transitionPopupActiveLocal.value)
   function setTransitionPopupActive(active) { transitionPopupActiveLocal.value = active }
  
   return { mouseoverActive, setMouseoverActive, transitionPopupActive, setTransitionPopupActive }
})
