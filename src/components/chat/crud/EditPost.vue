<template>
   <v-card>
      <div class="d-flex justify-space-between align-center mx-2"> 
         <span class="font-weight-medium admin-link my-1">Edit Post</span>
         <span>
            <IconButton @click.stop="save()"   icon="mdi-check-bold"  :disabled="!text" xs color="blue-darken-2"/>
            <IconButton @click.stop="cancel()" icon="mdi-close-thick" :disabled="!text && !item" xs color="blue-darken-2"/>
         </span>
      </div>
      <HorizontalDiv class="w-100 mb-2 d-flex">
         <div v-if="item" class="me-n4">
            <ItemThumb :item="item" :size="thumbSize.IMG" :origin="itemOrigin.EXTERNAL"/>
         </div>
         <div class="flex-grow-1 mx-2">
             <v-textarea v-model="text" auto-grow rows="1"/>
         </div>
      </HorizontalDiv>
   </v-card>
</template>

<script setup>
   import { computed, ref, onMounted } from 'vue'
   import { usePostStore } from '@/stores/chat/postStore'
   import { useItemStore } from '@/stores/itemStore'
   import ItemThumb        from '@/components/item/thumb/ItemThumb.vue'
   import IconButton       from '@/components/util/IconButton.vue'
   import HorizontalDiv    from '@/components/util/HorizontalDiv.vue'
   import { Emit, ItemOrigin, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ post: Object })
   const emit  = defineEmits([Emit.DONE])

   const postStore = usePostStore()
   const itemStore = useItemStore()
   const text = ref('')
   const itemOrigin = ItemOrigin
   const thumbSize  = ThumbSize

   onMounted(() => {
      text.value = props.post.text
   })
   
   const item = computed(() => props.post.itemId ? itemStore.getItem(props.post.itemId) : null)
   
   const save = () => {
      postStore.updatePost({ id: props.post.id, text: text.value })
      emit(Emit.DONE)
   }
   
   const cancel = () => { emit(Emit.DONE) }
</script>

<style>
</style>
