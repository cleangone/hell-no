<template>
   <IconButton v-if="itemsExist" @click="showDialog=true" icon="mdi-arrow-expand"" class="px-0" :class="buttonClass"/> 
            
   <v-dialog v-model="showDialog" width="auto">
      <ExpandItemsDialog :items="props.items" :item="props.item" :fullscreen="props.fullscreen" @done="done()"/>
   </v-dialog>  
</template>

<script setup>
   import { computed, ref } from 'vue'
   import ExpandItemsDialog from '@/components/item/ExpandItemsDialog.vue'
   import IconButton        from '@/components/util/IconButton.vue'
   
   const props = defineProps({ items: Object, item: Object, fullscreen: Boolean, buttonClass: String })   
   const showDialog = ref(false)

   const itemsExist  = computed(() => props.items && props.items.length)
   const buttonClass = computed(() => props.buttonClass ? props.buttonClass : "")
   
   const done = () => { showDialog.value = false }
</script>

<style>
</style>
