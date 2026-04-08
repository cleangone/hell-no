<template>
   <IconButton v-if="itemsExist" @click="showDialog=true" :icon="icon" class="px-0" :class="buttonClass"/> 
            
    <!-- icon="mdi-play"  -->
   <v-dialog v-model="showDialog" width="auto">
      <PlayItemsDialog :items="props.items" :item="props.item" :fullscreen="props.fullscreen" @done="done()"/>
   </v-dialog>  
</template>

<script setup>
   import { computed, ref } from 'vue'
   import PlayItemsDialog from '@/components/item/PlayItemsDialog.vue'
   import IconButton      from '@/components/util/IconButton.vue'
   
   const props = defineProps({ items: Object, item: Object, icon: String, fullscreen: Boolean, buttonClass: String })   
   const showDialog = ref(false)

   const itemsExist  = computed(() => props.items && props.items.length)
   const icon        = computed(() => props.icon ? props.icon : "mdi-play")
   const buttonClass = computed(() => props.buttonClass ? props.buttonClass : "")
   
   
   const done = () => { showDialog.value = false }
</script>

<style>
</style>
