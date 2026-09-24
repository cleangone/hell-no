<template> 
   <v-card @click="toggleIfReplies(post.id)" class="mb-2"
         :class="getClass(post)" :style="{marginLeft: (post.level * 20)+'px'}">
      <v-card-item class="pr-0 pt-0">
         <HorizontalDiv class="w-100">
            <div v-if="item" class="my-1 ml-n2">
               <ItemThumb :item="item" :size="ThumbSize.IMG" :origin="ItemOrigin.EXTERNAL" emitPopup @popup="onPopup"/>
            </div>
            <div class="w-100">
               <RouterLink :to="Route.USER.url + post.userId" class="mr-2">{{ getUsername(post.userId) }}</RouterLink>
               <span class="text-overline"> 
                  {{ getDate(post) }}
                  <IconButton @click="reply(post)" icon="mdi-reply" />
                  <ExpandIcon v-if="hasReplies(post.id)" :isExpanded="isExpanded"
                     @click="isExpanded=!isExpanded" iconClass="icon-btn"/>
               </span>
               <span v-if="replyCount" class="text-label-small">{{ replyCountText }}</span>
               <span v-if="canUpdate(post.userId)" style="float:right"> 
                  <EditButton   @click="editPost(post)"   size="x-small"/>
                  <DeleteButton @click="deletePost(post)" size="x-small""/>
               </span>
               <div class="pr-2 mt-n2">{{ post.text }}</div>
            </div>
         </HorizontalDiv>
      </v-card-item>
   </v-card>

   <Replies v-if="isExpanded" :postId="props.post.id"/>

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
   import { computed, ref } from 'vue'
   import { useUserStore }  from '@/stores/userStore'
   import { useItemStore }  from '@/stores/itemStore'
   import { useReplyStore } from '@/stores/chat/replyStore'
   import { useViewStore }  from '@/stores/viewStore'
   import ItemThumb     from '@/components/item/thumb/ItemThumb.vue'
   import Replies       from './Replies.vue'
   import AddReply      from './crud/AddReply.vue'
   import EditPost      from './crud/EditPost.vue'
   import DeletePost    from './crud/DeletePost.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import IconButton    from '@/components/util/IconButton.vue'
   import ExpandIcon    from '../util/icon/ExpandIcon.vue'
   import HorizontalDiv from '@/components/util/HorizontalDiv.vue'
   import { chatDate } from '@/utils/dateUtils'
   import { Emit, ItemOrigin,  Route, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ post: Object })
   const emit  = defineEmits([ Emit.POPUP ])

   const userStore  = useUserStore()
   const itemStore  = useItemStore()   
   const replyStore = useReplyStore()
   const viewStore  = useViewStore()
   const selectedPost     = ref({})
   const collapsedPostIds = ref(new Set())
   const isExpanded       = ref(false)
   const showReplyDialog  = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)
   
   const item       = computed(() => props.post.itemId ? itemStore.getItem(props.post.itemId) : null)
   const replies    = computed(() => replyStore.getReplies(props.post.id))
   const replyCount = computed(() => replies.value?.length ?? 0)
   const replyCountText = computed(() => replyCount.value + (replyCount.value == 1 ? " Reply " : " Replies"))
   
   const getUsername = (userId) => { return userStore.getUsername(userId) }
   const getBgColor  = (userId) => { return "bg-" + viewStore.getMsgColor(userId) }
   const getClass    = (post)   => { return getBgColor(post.userId) }
   const getDate     = (post)   => { return post.dateModified ? chatDate(post.dateModified.toDate()) : "" }
   const hasReplies  = () => { return replies.value?.length }
   const canUpdate   = (userId) => { return userId == userStore.userId }
   
   const toggleIfReplies = (postId) => { if (hasReplies(postId)) togglePost(postId) }
   const togglePost = (postId) => { 
      const ids = new Set(collapsedPostIds.value)
      ids.has(postId) ? ids.delete(postId) : ids.add(postId) 
      collapsedPostIds.value = ids // drives display update
   }
   
   const reply      = (post)   => { showDialog(showReplyDialog,  post) }
   const editPost   = (post)   => { showDialog(showEditDialog,   post) }
   const deletePost = (post)   => { showDialog(showDeleteDialog, post) }
   const showDialog = (showDialog, post ) => {
      selectedPost.value = post
      showDialog.value = true
   }

   const onPopup = (popup) => { emit(Emit.POPUP, popup) }
</script>

<style>
</style>
