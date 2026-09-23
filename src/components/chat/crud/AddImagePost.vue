<template>
   <DefineTemplate>
      <v-form v-model="dataValid" class="w-100">
         <v-textarea v-model="text" label="Text" :rules="requiredRule"/>
      </v-form>
   </DefineTemplate>

   <v-card title="Add Post" class="add-chat-dialog">
      <div v-if="isItemGroup || isLandscape">
         <ItemThumb :item="item" :size="ThumbSize.IMG" :origin="ItemOrigin.EXTERNAL"/>
         <div class="mx-3"><ReuseTemplate/></div>
      </div>
      <HorizontalDiv v-else class="w-100 mx-2">
         <div class="pt-2 mb-2">
            <ItemThumb :item="item" :size="ThumbSize.IMG" :origin="ItemOrigin.EXTERNAL"/>
         </div>
         <div class="w-100 mr-5"><ReuseTemplate/></div>
      </HorizontalDiv>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="addPost()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { createReusableTemplate } from '@vueuse/core'
   import { usePostStore } from '@/stores/chat/postStore'
   import { useChatStore } from '@/stores/chat/chatStore'
   import { useItemMgr }   from '@/stores/itemMgr'
   import ItemThumb        from '@/components/item/thumb/ItemThumb.vue'
   import HorizontalDiv    from '@/components/util/HorizontalDiv.vue'
   import { requiredRule } from '@/utils/utils'
   import { Emit, ItemOrigin, ThumbSize }  from '@/utils/constants'
   
   const props = defineProps({ chatId: String, groupId: String, item: Object })
   const emit  = defineEmits([Emit.DONE])

   const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
   const postStore = usePostStore()
   const chatStore = useChatStore()
   const itemMgr = useItemMgr()
   const text = ref('')
   const dataValid = ref(true)

   const isItemGroup = computed(() => itemMgr.isItemGroup(props.item))
   const isLandscape = computed(() => itemMgr.itemAspectRatio(props.item) > 2)

   const addPost = () => {    
      const post = { 
         chatId: props.chatId, 
         text:   text.value,
         itemId: props.item.id, 
      }
      postStore.addPost(post)
      chatStore.updateChatContentModified(props.chatId)
      emit(Emit.DONE)
   }
</script>

<style>
.add-post-dialog {
   min-width:  450px;
   min-height: 400px;
}
</style>
