import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { dateUuid, isPublicOrGroup } from '@/utils/utils' 
import { ActionStatus, ActionType } from '@/utils/constants'

/*
   action:
      id
      actionStatus: ActionStatus: CREATED, CHAINED, BYPASSED, PROCESSED, PROCESSING, ERROR
      actionType: ActionType: FEED_UPDATE, IMAGE, ACCEPT_INVITE, PROCESS, SEND_EMAIL
      isScheduled: boolean - scheduled actions are not processed immmediately
      userId
      itemId 
      chainedActionId: id of next action in chain
      item (if feed action, inc standard item fields) 
         isFeedItem
         username
      inviteId (if invite action)
      imageAction: ( if image action)
         imageId 
         filePaths []
         downloadUrls: [ {filePath, url} ] - populated by backend
         thumbFilePath 
         largeThumbFilePath
      actionResults - populated by backend
      chainedActionResults -  populated by backend, results of previous action in chain
      dateCreated
      dateModified
*/

const TABLE = 'actions'

export const useActionStore = defineStore('action', () => {
   const actionCollection = collection(db, TABLE)
   function actionDoc(id) { return doc(db, TABLE, id) }

   const actions = useFirestore(actionCollection, [])      
   
   function addAction(action) {
      const actionToSet = { ...action, id:dateUuid(), dateCreated: serverTimestamp(), dateModified: serverTimestamp() }
      if (!actionToSet.actionStatus) { actionToSet.actionStatus = ActionStatus.CREATED }     
      setDoc(actionDoc(actionToSet.id), actionToSet)
      return actionToSet.id
   }

   function addChainedFeedAction(newItem) { return addFeedAction(newItem, null, ActionStatus.CHAINED) }
   function addFeedAction(newItem, oldItem = null, actionStatus = null) {
      const actionDetails = { publishToGroupIds: [], retractFromGroupIds: [] }
      if (isPublicOrGroup(newItem)) {
         const sameContent = (
               oldItem &&
               (newItem.name == oldItem.name) &&
               ((!newItem.primaryArtist && !oldItem.primaryArtist) || // both null
                (newItem?.primaryArtist?.id == oldItem?.primaryArtist?.id))) ? true : false
         if (sameContent) {  
             // publish item to the new groups
            for (const groupId of newItem.groupIds) { 
               if (!oldItem.groupIds.includes(groupId)) { actionDetails.publishToGroupIds.push(groupId) }
            }
         }
         else { 
            // publish updated item to all groups
            actionDetails.publishToGroupIds.push( ...newItem.groupIds) 
         }
         
         // retract from any old groups that were removed
         if (oldItem) {
            for (const groupId of oldItem.groupIds) { 
               if (!newItem.groupIds.includes(groupId)) { actionDetails.retractFromGroupIds.push(groupId) }
            }
         }
      } 
      else if (oldItem) {
         // retract from old groups
         actionDetails.retractFromGroupIds.push( ...oldItem.groupIds )
      }
      
      if (actionDetails.publishToGroupIds.length || actionDetails.retractFromGroupIds.length ) {
         const feedAction = { 
            actionType: ActionType.FEED_UPDATE, 
            actionDetails: actionDetails, 
            userId: newItem.userId, 
            item: newItem
         }
         if (actionStatus) { feedAction.actionStatus = actionStatus }
         return addAction(feedAction)
      }
      else { console.log("addFeedAction - feed update not needed") }
      return null
   }

   function addImageAction(itemId, userId, itemImage, chainedActionId = null) {
      console.log("addImageAction", itemId)
      return addAction({ 
         actionType: ActionType.IMAGE, 
         userId: userId, 
         itemId: itemId, 
         chainedActionId: chainedActionId,
         imageAction: {
            filePaths: [ itemImage.thumbFilePath, itemImage.largeThumbFilePath ],
            downloadUrls: [], // populated by backend
            thumbFilePath: itemImage.thumbFilePath,  
            largeThumbFilePath: itemImage.largeThumbFilePath
         }
      }) 
   }

   function deleteAction(id) { deleteDoc(doc(actionCollection, id)) }

   function deleteActions(ids) {
      const batch = writeBatch(db)
      for (const id of ids) {
         batch.delete(doc(actionCollection, id))
      }
      batch.commit()
   }

   return { actions, addAction, addFeedAction, addChainedFeedAction, addImageAction, deleteAction, deleteActions }
})
