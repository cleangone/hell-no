<template> 
   <v-card class="mb-2" :class="bgClass">
      <v-card-item class="pr-0 pt-0">
         <HorizontalDiv class="w-100">
            <div v-if="item" class="my-1 ml-n2">
               <ItemThumb :item="item" :size="ThumbSize.IMG" :origin="ItemOrigin.EXTERNAL" emitPopup @popup="onPopup"/>
            </div>
            <div class="w-100">
               <!-- <Avatar v-if="user" :user="user" :size="40" class="mt-3 hand"/> -->
               <RouterLink :to="Route.USER.url + post.userId" class="mr-2">{{ username }}</RouterLink>
               <span class="text-overline">{{ postDate }}</span>
               <span @click="isExpanded=!isExpanded" class="hand admin-link">
                  <ExpandIcon :isExpanded="isExpanded" iconClass="icon-btn"/>
                  <span class="text-label-small">{{ replyText }}</span>
               </span>
               <span v-if="canUpdate" style="float:right"> 
                  <EditButton   @click="editPost()"   xs/>
                  <DeleteButton @click="deletePost()" xs/>
               </span>
               <div class="pr-2 mt-n2">{{ post.text }}</div>
            </div>
         </HorizontalDiv>
      </v-card-item>
   </v-card>

   <Replies v-if="isExpanded" :postId="props.post.id" :chat="chat"/>

   <v-dialog v-model="showEditDialog" width="auto">
      <EditPost :post="post" @done="showEditDialog=false"/>
   </v-dialog>
   <v-dialog v-model="showDeleteDialog" width="auto">
      <DeletePost :post="post" @done="showDeleteDialog=false"/>
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
   import EditPost      from './crud/EditPost.vue'
   import DeletePost    from './crud/DeletePost.vue'
   import Avatar        from '@/components/user/avatar/Avatar.vue'
   import UserLinkAvatar from '@/components/user/avatar/UserLinkAvatar.vue'
   import EditButton    from '@/components/util/EditButton.vue'
   import DeleteButton  from '@/components/util/DeleteButton.vue'
   import ExpandIcon    from '@/components/util/icon/ExpandIcon.vue'
   import HorizontalDiv from '@/components/util/HorizontalDiv.vue'
   import { chatDate } from '@/utils/dateUtils'
   import { Emit, ItemOrigin,  Route, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ post: Object, chat: Object })
   const emit  = defineEmits([ Emit.POPUP ])

   const userStore  = useUserStore()
   const itemStore  = useItemStore()   
   const replyStore = useReplyStore()
   const viewStore  = useViewStore()
   const isExpanded       = ref(false)
   const showEditDialog   = ref(false)
   const showDeleteDialog = ref(false)

   const item       = computed(() => props.post.itemId ? itemStore.getItem(props.post.itemId) : null)
   const user       = computed(() => userStore.getUser(props.post.userId))  
   const username   = computed(() => userStore.getUsername(props.post.userId))  
   const replies    = computed(() => replyStore.getReplies(props.post.id))
   const replyCount = computed(() => replies.value?.length ?? 0)
   const replyText  = computed(() => replyCount.value ? replyCount.value + (replyCount.value == 1 ? " Reply" : " Replies") : "Reply")
   const postDate   = computed(() => props.post.dateModified ? chatDate(props.post.dateModified.toDate()) : "")
   const bgClass    = computed(() =>  "bg-" + viewStore.getMsgColor(props.post.userId))
   const canUpdate  = computed(() => props.post.userId == userStore.userId )
   
   const editPost   = () => { showEditDialog.value = true }
   const deletePost = () => { showDeleteDialog.value = true }

   const onPopup = (popup) => { emit(Emit.POPUP, popup) }
</script>

<style>
</style>
