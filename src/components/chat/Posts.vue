<template>
   <div class="d-flex flex-column h-100 w-100" style="height: 200px">
      <v-virtual-scroll :items="posts" height="400px" ref="virtualScrollRef">
         <template v-slot:default="{ item }">
            <Post :key="item.id" :post="item" @popup="onPopup" />
         </template>
      </v-virtual-scroll>
   </div>
   
   <v-dialog v-model="showReplyDialog" width="auto">
      <AddReply :post="selectedPost" @done="showReplyDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showEditDialog" width="auto">
      <EditPost :post="selectedPost" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeletePost :post="selectedPost" @done="showDeleteDialog=false"/>
   </v-dialog>
</template>

<script setup>
   import { computed, onMounted, nextTick, ref, watch } from 'vue'
   import { usePostStore } from '@/stores/chat/postStore'
   import Post       from './Post.vue'
   import AddReply   from './crud/AddReply.vue'
   import EditPost   from './crud/EditPost.vue'
   import DeletePost from './crud/DeletePost.vue'
   import { toSortedDateCreatedAsc } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ chatId: String })
   const emit  = defineEmits([ Emit.POPUP ])

   const postStore = usePostStore()
   const virtualScrollRef = ref(null)
   const selectedPost     = ref({})
   const showReplyDialog  = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   
   const posts = computed(() => toSortedDateCreatedAsc(postStore.getPosts(props.chatId)))
   onMounted(() => {
      if (posts.value?.length) { scrollToBottom() }
   })
   watch(
      () => posts.value, 
      () => { scrollToBottom() }, 
      { deep: true }
   )
   
   const scrollToBottom = async () => {
      await nextTick()  // wait for vue dependencies 
      await nextTick()  // wait for vuetify virtual DOM dimensions 
      
      // if (virtualScrollRef.value && posts.value.length > 0) {
      if (virtualScrollRef.value && posts.value?.length) {
         // Pass 'end' to align the item precisely at the bottom viewport threshold
         virtualScrollRef.value.scrollToIndex(posts.value.length - 1, 'end')
      }
   }

   const onPopup = (popup) => { emit(Emit.POPUP, popup) }
</script>

<style>
</style>
