<template>
   <v-card title="Add Chat" class="add-chat-dialog">
      <HorizontalDiv class="w-100">
         <div v-if="item" class="pt-2 mb-2">
            <ItemThumb :item="item" :size="ThumbSize.IMG" :origin="ItemOrigin.EXTERNAL"/>
         </div>
         <v-form v-model="dataValid" class="mt-2 mr-3 w-100">
            <v-text-field v-model="name"        label="Name"  :rules="requiredRule"/>
            <v-text-field v-model="description" label="Description"/>
         </v-form>
      </HorizontalDiv>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="addChat()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">Cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { useChatStore } from '@/stores/chatStore'
   import { requiredRule } from '@/utils/utils'
   import ItemThumb     from '@/components/item/thumb/ItemThumb.vue'
   import HorizontalDiv from '@/components/util/HorizontalDiv.vue'
   import { Emit, ItemOrigin, State, ThumbSize }  from '@/utils/constants'
   
   const props = defineProps({ state: {type:String, default:State.PRIVATE}, groupId: String, item: Object })
   const emit = defineEmits([Emit.DONE])

   const chatStore = useChatStore()
   const name = ref('')
   const description = ref('')
   const dataValid = ref(true)

   onMounted(() => {
      if (props.item) { name.value = props.item.name }
   })

   const addChat = () => {    
      chatStore.addChat({ 
         name:    name.value, 
         state:   props.state, 
         description: description.value,
         groupId: props.groupId ?? null,
         itemId:  props.item?.id ?? null
      })
      emit(Emit.DONE)
   }
</script>

<style>
.add-chat-dialog {
   min-width:  450px;
   min-height: 350px;
}
.number-field {
   max-width:  150px;
}
</style>
