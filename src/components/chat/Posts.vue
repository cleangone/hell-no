<template>
   <div v-if="viewMgr.isXs" class="w-100">
      <Post v-for="post in posts" :key="post.id" :post="post" @popup="onPopup" />          
   </div>
   <div v-else class="d-flex flex-column h-100 w-100" style="max-height: 400px;">
      <v-virtual-scroll :items="posts" height="auto" ref="virtualScrollRef">
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
   import { useViewMgr }   from '@/stores/viewMgr'
   import Post             from './Post.vue'
   import AddReply         from './crud/AddReply.vue'
   import EditPost         from './crud/EditPost.vue'
   import DeletePost       from './crud/DeletePost.vue'
   import { toSortedDateCreatedAsc } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ chatId: String })
   const emit  = defineEmits([ Emit.POPUP ])

   const postStore        = usePostStore()
   const viewMgr          = useViewMgr()
   const virtualScrollRef = ref(null)
   const selectedPost     = ref({})
   const showReplyDialog  = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   
   const posts = computed(() => toSortedDateCreatedAsc(postStore.getPosts(props.chatId)))
   
   onMounted(() => {
      if (!viewMgr.isMobile && posts.value?.length) { scrollToBottom() }
   })

   watch(
      () => posts.value, 
      () => { if (!viewMgr.isMobile) { scrollToBottom() }}, 
      { deep: true }
   )
   
   const scrollToBottom = async () => {
      await nextTick()  // wait for vue dependencies 
      await nextTick()  // wait for vuetify DOM dimensions 
      
      if (virtualScrollRef.value && posts.value?.length) {
         // 'end' aligns item at viewport bottom
         virtualScrollRef.value.scrollToIndex(posts.value.length - 1, 'end')
      }
   }

   const onPopup = (popup) => { emit(Emit.POPUP, popup) }
</script>

<style>
</style>
