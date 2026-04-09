import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { Defaults, ItemOrigin, ThumbOptionsGallery, ThumbOptionsItem } from '@/utils/constants'

export const useViewStore = defineStore('view', () => {
   const userStore = useUserStore()
   
   const isInitialized = ref(false)
   function init() { 
      if (!isInitialized.value) {
         resetItemThumbOptions()
         isInitialized.value = true 
      }
   }

   const showSiteWall = ref(false)
   function setShowSiteWall(showWall) { showSiteWall.value = showWall }
   
   const baseSeconds = ref(0)
   function getSeconds() { 
      const secs = Math.floor((new Date()).getTime()/1000)
      if (!baseSeconds.value) { baseSeconds.value = secs }
      return secs - baseSeconds.value
   }

   const visibleItems = ref(new Map())
   function getVisibleItems(origin) { return visibleItems.value.get(origin) }
   function setVisibleItems(origin, linkName, linkUrl, items, linkId = null) {
      visibleItems.value.set(origin, { origin:origin, linkId:linkId, linkName:linkName, linkUrl:linkUrl, items:[...items] })
      return items
   }
   function updateVisibleItems(origin, items) {
      if (visibleItems.value.has(origin)) { visibleItems.value.get(origin).items = [...items] }
   }

   const defaultItemThumbOptions = [ ThumbOptionsItem.TITLE, ThumbOptionsItem.ARTIST, ThumbOptionsItem.UPDATED ]
   const itemThumbOptions = ref([ ...defaultItemThumbOptions ] )
   function setItemThumbOptions(options) { itemThumbOptions.value = [...options] }
   function resetItemThumbOptions() { setItemThumbOptions(defaultItemThumbOptions) }

   const galleryThumbOptions = ref([ ThumbOptionsGallery.SORT_BY_NAME ])
   function setGalleryThumbOptions(options) { galleryThumbOptions.value = [...options] }

   const xsThumbFieldsColors = [ "grey", "green-lighten-3", "green-lighten-1", "green-darken-1" ]
   const xsThumbFieldsIndex = ref(2)
   function incrementXsThumbFieldsIndex() { 
      xsThumbFieldsIndex.value = xsThumbFieldsIndex.value == xsThumbFieldsColors.length - 1 ? 0 : xsThumbFieldsIndex.value + 1

      const options = []
      if (xsThumbFieldsIndex.value > 0) { options.push( ...[ThumbOptionsItem.TITLE, ThumbOptionsItem.ARTIST] ) }
      if (xsThumbFieldsIndex.value > 1) { options.push(ThumbOptionsItem.UPDATED) }
      if (xsThumbFieldsIndex.value > 2) { options.push(ThumbOptionsItem.USER) }

      setItemThumbOptions(options)
   }

   const processedFeedItemIds = []
   function addProcessedFeedItemId(id) { processedFeedItemIds.push(id) }
 
   const pageName = ref("")
   function setPageName(name) { pageName.value = name }
   
   const editInPlace = ref(false)
   // function toggleEditInPlace() { editInPlace.value = !editInPlace.value } 
  
   const isMobileSwipe = ref(false)
   function toggleMobileSwipe() { isMobileSwipe.value = !isMobileSwipe.value }
   
   const accountGalleryId = ref(null)
   function setAccountGalleryId(id) { accountGalleryId.value = id }

   const objVisiblity = new Map()
   function resetVisiblity() { objVisiblity.clear() }
   function getVisiblity(obj) {
      const visiblity = objVisiblity.get(obj.id) 
      return (visiblity && visiblity.versionTag == obj.versionTag) ? visiblity : null
   }
   function getIdVisiblity(id) { 
      const visiblity = objVisiblity.get(id) 
      return visiblity ? visiblity : null
   }
   function setVisiblity(obj, isVisible) { 
      objVisiblity.set(obj.id, { versionTag:obj.versionTag, isVisible:isVisible }) 
      return isVisible
   }

   const adminSelectedUserId = ref(null)
   function setAdminSelectedUserId(id) { adminSelectedUserId.value = id }
   
   const adminItemHeaders = ref(null)
   function setAdminItemHeaders(headers) { adminItemHeaders.value = headers }
   const adminGalleryHeaders = ref(null)
   function setAdminGalleryHeaders(headers) { adminGalleryHeaders.value = headers }
   
   const showChildGalleries = ref(false)
   function setShowChildGalleries(showChild){ showChildGalleries.value = showChild }
   
   const addItemDefaults = ref(null)
   function setAddItemDefaults(defaults) { addItemDefaults.value = defaults }
   
   const showSavedFeedItems = ref(false)
   function setShowSavedFeedItems(showSaved) { showSavedFeedItems.value = showSaved }
   
   const previousWallOrder = ref({ itemIds: [], rows: [] })
   function setPreviousWallOrder(wallOrder) { previousWallOrder.value = wallOrder }

   const msgColors = ["indigo-lighten-5", "cyan-lighten-5", "teal-lighten-5", "deep-purple-lighten-5"]
   const colorIndex = ref(0)
   const userIdToMsgColor = ref(new Map())
   function getMsgColor(userId) { 
      if (userId == userStore.userId) { return "blue-lighten-5" }
      else if (userId == Defaults.DELETED_USER_ID) { return "grey-lighten-3" }
      else if (userIdToMsgColor.value.has(userId)) { return userIdToMsgColor.value.get(userId) }

      const color = msgColors[colorIndex.value]
      userIdToMsgColor.value.set(userId, color) 
      colorIndex.value = colorIndex.value == msgColors.length - 1 ? 0 : colorIndex.value + 1 
      return color
   }

   const selectedChatId = ref(null)
   function setSelectedChatId(id) { selectedChatId.value = id }
   
   const searchQuery = ref(null)
   function setSearchQuery(query) { searchQuery.value = query }
   
   const itemDescBesideImage = ref(true)
   function toggleItemDescBesideImage() { itemDescBesideImage.value = !itemDescBesideImage.value }
   
   const loadedImages = new Set()
   function loadImage(url) { 
      if (url && !loadedImages.has(url)) { 
         // console.log("Loading", url)
         const image = new Image()
         image.src = url
         loadedImages.add(url) 
      }
   }
  
   const emailContext = ref(null)
   function setEmailContext(user, item = null) { 
      emailContext.value = { toContact: { userId: user.id, username: user.username, email: user.email } }
      if (item) { emailContext.value.item = { id: item.id, name: item.name } }
   }
   function resetEmailContext() { emailContext.value = null } 
   
   const deviceId = ref(null)
   function setDeviceId(id) { deviceId.value = id }
   
   return { 
      isInitialized, init, getSeconds,
      showSiteWall, setShowSiteWall,
      getVisibleItems, setVisibleItems, updateVisibleItems, 
      itemThumbOptions, setItemThumbOptions,      
      galleryThumbOptions, setGalleryThumbOptions, 
      xsThumbFieldsColors, xsThumbFieldsIndex, incrementXsThumbFieldsIndex, 
      processedFeedItemIds, addProcessedFeedItemId,
      pageName, setPageName, 
      editInPlace, // toggleEditInPlace, 
      isMobileSwipe, toggleMobileSwipe,
      accountGalleryId, setAccountGalleryId, 
      adminSelectedUserId, setAdminSelectedUserId,
      adminItemHeaders, setAdminItemHeaders, adminGalleryHeaders, setAdminGalleryHeaders,
      showChildGalleries, setShowChildGalleries,
      getVisiblity, getIdVisiblity, setVisiblity, resetVisiblity,
      addItemDefaults, setAddItemDefaults,
      showSavedFeedItems, setShowSavedFeedItems,
      previousWallOrder, setPreviousWallOrder, 
      getMsgColor,
      selectedChatId, setSelectedChatId,
      searchQuery, setSearchQuery,
      itemDescBesideImage, toggleItemDescBesideImage,
      loadImage,
      emailContext, setEmailContext, resetEmailContext,
      deviceId, setDeviceId
   }
})
