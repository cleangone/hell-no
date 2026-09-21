<template>
   <v-card title="Edit Post" class="edit-dialog">
      <v-form v-model="dataValid">
         <div class="ma-3">
            <v-textarea v-model="text" label="Text" :rules="requiredRule"/>
         </div>
      </v-form>
      <v-card-actions class="justify-end">
         <v-btn color="primary" @click="save()" :disabled="!dataValid">save</v-btn>
         <v-btn color="primary" @click="$emit(Emit.DONE)">cancel</v-btn>
      </v-card-actions>
   </v-card>
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import { usePostStore } from '@/stores/chat/postStore'
   import { requiredRule } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ post: Object })
   const emit  = defineEmits([Emit.DONE])

   const postStore = usePostStore()
   const text = ref('')
   const dataValid = ref(true)

   onMounted(() => {
      text.value = props.post.text
   })
   
   const save = () => {
      postStore.updatePost({ id: props.post.id, text: text.value })
      emit(Emit.DONE)
   }
</script>

<style>
</style>
