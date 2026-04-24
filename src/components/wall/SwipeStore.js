import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useSwipeStore = defineStore('wall-popup', () => {
   const mouseoverActiveLocal  = ref(false)   
   const transitionPopupActiveLocal = ref(false)
   const previousRow = ref(-1)

   const mouseoverActive = computed(() => mouseoverActiveLocal.value)
   function setMouseoverActive(active) { 
      console.log("mouseoverActive", active)
      mouseoverActiveLocal.value = active }
  
   const transitionPopupActive = computed(() => transitionPopupActiveLocal.value)
   function setTransitionPopupActive(active, row) { 
      transitionPopupActiveLocal.value = active 
      
      previousRow.value = row 
   }
  
   return { mouseoverActive, setMouseoverActive, transitionPopupActive, setTransitionPopupActive, previousRow }
})
