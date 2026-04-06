<template>
   <IconButton v-if="itemsExist" @click="showDialog=true" icon="mdi-play" class="px-0" :class="buttonClass"/> 
            
   <v-dialog v-model="showDialog" width="auto">
      <PlayItemsDialog :items="props.items" :item="props.item" @done="done()"/>
   </v-dialog>  
</template>

<script setup>
   import { computed, ref } from 'vue'
   import PlayItemsDialog from '@/components/item/PlayItemsDialog.vue'
   import IconButton      from '@/components/util/IconButton.vue'
   
   const props = defineProps({ items: Object, item: Object, buttonClass: String })   
   const showDialog = ref(false)

   const itemsExist  = computed(() => props.items && props.items.length)
   const buttonClass = computed(() => props.buttonClass ? props.buttonClass : "")
   
   const done = () => { showDialog.value = false }
</script>

<style>
</style>
