/*
   Post 1.0:
      
      - Add parallax to gallery header
      - Deleted status, trash
      - Add all metadata to mobile ItemView 
      - review/refactor stores, esp default returns of collection queries
      - finish wall automation - no more set random, auto figure out rows
      - add filter to RecentView
      - lazy loading in router - chunk retrieval errors with Admin, others
      - requiredRule does not invalidate "   "
*/
export const versions = [    
   ["v2.11.0", "5/3/26"],  // Add RandomView for mobile
   ["v2.10.5", "4/30/26"], // Larger mobile/xs Wallitem size - xs site wall has one row
   ["v2.10.4", "4/30/26"], // Refactor/combine ROUTE ahd URL constants
   ["v2.10.3", "4/30/26"], // Add ToolTip component
   ["v2.10.2", "4/30/26"], // Rename PlayItems to ExpandItems, integrate with Recent,FavoritesView
   ["v2.10.1", "4/30/26"], // Link ItemView artist to ArtistView
                           // Add large thumbnail option for desktop
   ["v2.10.0", "4/29/26"], // Add Artist page, link artists to it
                           // remove artist.visibility - artist edit controlled by userId and items referencing artist
   ["v2.9.0",  "4/28/26"], // Add dark mode
   ["v2.8.1",  "4/27/26"], // Add profileId to wallItem
   ["v2.8.0",  "4/26/26"], // Handle interaction between wall active popup and wallItem mouseover
                           // Fix issue with wall image that was different than item.primaryImage
                           // Initial version of profile's wall
   ["v2.7.1",  "4/24/26"], // Make popup image clickable - needed for active image popup
   ["v2.7.0",  "4/24/26"], // Popup Wall active image after transition if no other popup displayed
   ["v2.6.0",  "4/22/26"], // Add gallery.contributorIds, integrate with views, Gallery/Item crud 
                           // Replace AccountGalleryItems.deleteItem with removeItemFromGallery
   ["v2.5.3",  "4/20/26"], // Update views to handle param id possibly a profileId 
                           // UserView updated to show/not show galleries and items based on profiles
   ["v2.5.2",  "4/19/26"], // Integrate Profile with Galleries
                           // Add user to G
                           // alleryThumb
                           // Streamline user/dateModified in Item/GalleryThumb
   ["v2.5.1",  "4/18/26"], // Items with a profileId do not show on user's recentItems           
   ["v2.5.0",  "4/18/26"], // Add Profiles, integrate with Items
   ["v2.4.1",  "4/17/26"], // Update css styles to support browser dark mode
   ["v2.4.0",  "4/16/26"], // Add Favorites
                           // Make gallery desc position configurable
                           // Combine edit gallery item/images into one dialog
   ["v2.3.2",  "4/14/26"], // Sort Gallery thumbnails
                           // Delete Channel components, stores
   ["v2.3.1",  "4/13/26"], // Delete Broadcast views, components
   ["v2.3.0",  "4/13/26"], // Add some userWall items to siteWall
   ["v2.2.2",  "4/13/26"], // Add SeoMeta to Home/Galleries/Gallery/ItemView to update browser tab title
   ["v2.2.1",  "4/12/26"], // Move all gallery/item control icons to right side by title
                           // Add copy link back as icon
   ["v2.2.0",  "4/12/26"], // Add gallery.tag for readable URL
   ["v2.1.4",  "4/11/26"], // Clean up prev/next and repeated origin for mobile ItemView when scrolling 
   ["v2.1.3",  "4/10/26"], // Store user's gallery and item configs in settings
   ["v2.1.2",  "4/10/26"], // Add small item thumb option for xs
   ["v2.1.1",  "4/8/26"],  // Add gallery thumb background for private/invisible
                           // Consolidate gallery thumb display config in GalleryThumbsConfig
   ["v2.1.0",  "4/7/26"],  // Enable paste of direct link to gallery
                           // Initial removal of groups
                           // Add Item/Gallery state INVISIBLE 
                           // Add PlayItems fullscreen prop
   ["v2.0.1",  "4/6/26"],  // Remove db log table - became huge, impacted loading and login
                           // Comment out Broadcast in Header/Account, Feeds in HomeView
                           // Initial streamline of ItemView
   ["v2.0.0",  "4/6/26"],  // Relaunch in h2.hell-no.gallery in hell-no repository - will be slimmed down version
   ["v1.56.2", "2/23/25"], // Display site or user's wall based on soloMode 
                           // Filter search results by userId if soloMode
                           // Add soloMode to account icon dropdown, remove editInPlace
                           // Do not show user as Thumbnail option in soloMode
   ["v1.56.1", "2/22/25"], // Update localStore.soloMode when user updated
   ["v1.56.0", "2/22/25"], // Initial addition of solo mode - user only sees their art
   ["v1.55.1", "2/21/25"], // Fix mobile Emails bug
   ["v1.55.0", "2/21/25"], // Add device to log entry
   ["v1.54.0", "2/20/25"], // Store user images in userId subdir
                           // Add option to show only errors in AdminLog
   ["v1.53.0", "2/19/25"], // Rename Community to Messages
   ["v1.52.0", "2/17/25"], // Add BroadcastView 
                           // Fix top nav link bug - needed more room
                           // Add .title css
   ["v1.51.2", "2/16/25"], // Control Broadcast refresh timer
   ["v1.51.1", "2/14/25"], // Update BroadcastItem fullscreen mode
   ["v1.51.0", "2/14/25"], // Add Broadcast play/pause/prev/next
                           // Add Broadcast controls to mobile
   ["v1.50.8", "2/13/25"], // Fix Broadcasts layout
   ["v1.50.7", "2/13/25"], // Display full-screen image in channel
   ["v1.50.6", "2/12/25"], // Broadcast to channels
   ["v1.50.4", "2/10/25"], // Add AccountDevices, localStore.deviceId
   ["v1.50.3", "2/10/25"], // Broadcast gallery contents across channels
   ["v1.50.2", "2/10/25"], // Add channel.active, channelMgr
   ["v1.50.1", "2/9/25"],  // Rename Display to Channel
                           // Prototype initial broadcasts in AccountBroadcasts
   ["v1.50.0", "2/9/25"],  // Initial display infra for broadcast
   ["v1.49.2", "2/8/25"],  // Update chat/posts display to toggle in place
   ["v1.49.1", "2/8/25"],  // Refactor chat - remove unused comment/vote features
   ["v1.49.0", "2/7/25"],  // Fix chat bug with showing posts
   ["v1.48.0", "2/6/25"],  // Rename comms to emailThread
                           // Sort emails in emailThread with most recent at bottom
                           // Backend: rename emails, communications dbTables, processors
   ["v1.47.1", "2/4/25"],  // Refactor group names display in ItemThumb, ItemView
   ["v1.47.0", "2/2/25"],  // Add visible group items to recents
                           // Add groups to ItemView fields
   ["v1.46.0", "1/30/25"], // Add AdminItems add/edit/delete
   ["v1.45.0", "1/29/25"], // Add AdminGalleries add/edit
   ["v1.44.0", "1/29/25"], // Refactor BulkEdit ui
                           // Extract CheckboxExpansion component from EditItem
                           // Add components/item/thumb directory
   ["v1.43.0", "1/29/25"], // Add components/item/crud directory
                           // Add initial AdminItems add/edit infra
                           // Add parent gallery expand/collapse to AdminGalleries
   ["v1.42.0", "1/28/25"], // Expand/collapse child galleries in account galleries    
   ["v1.41.0", "1/27/25"], // Streamline EditItem artist functionality - can only choose from existing
                           // UI consistently refers to item.state as "visibility"
                           // Add max width to EditItem description
   ["v1.40.5", "1/26/25"], // Fix infinite scroll for mobile ungrouped items
   ["v1.40.4", "1/24/25"], // Fix HomeView updates mobile padding 
   ["v1.40.3", "1/24/25"], // Workaround for Wall item infinite scroll galleries
   ["v1.40.2", "1/23/25"], // Add origin page and galleries to ItemView infinite scroll headers
   ["v1.40.1", "1/23/25"], // ItemView mobile non-swipe has vertical infinite scroll
   ["v1.39.0", "1/21/25"], // Add AdminGalleries, refactor AdminContent, AdminItems
   ["v1.38.0", "1/18/25"], // Sort recent items by dateContentModified
   ["v1.37.1", "1/18/25"], // HomeView displays parent gallery if its dateContentModified differs fm children
   ["v1.37.0", "1/18/25"], // Sort gallaries by dateContentModified
                           // Don't show parent galleries on Home page
   ["v1.36.0", "1/17/25"], // Initial Admin Edit of items
   ["v1.35.0", "1/16/25"], // Revert a gallery's dateContentModified when an item is removed
   ["v1.34.0", "1/15/25"], // Don't update dateContentModified when cropping an image
                           // Add expandable sections for EditItem groups and galleries 
   ["v1.33.1", "1/10/25"], // Additional control of ItemThumb meta data display
   ["v1.32.0", "1/8/25"],  // ItemView does not display prev/next if mobile w/ horzontal aspect ratio
   ["v1.31.0", "1/7/25"],  // Add viewMgr.isMobile - handle wide/horizontal phone
                           // Log navigator state at startup
   ["v1.30.0", "1/2/25"],  // Extract dateUtils.js from utils.js
   ["v1.29.0", "1/2/25"],  // Streamline thread, email display layout, date format
   ["v1.28.0", "12/31/24"],// Add Settings to xs menu icon
   ["v1.27.0", "12/30/24"],// Add menu icon w/ Messages to xs Home top left
                           // Update Emails to display nicely on xs
                           // Renamed Community to Messages in titles
   ["v1.26.4", "12/28/24"],// Refactor localStore to handle date serialization issue
                           // Relaxed wall read rule to fix initial useFirestore error - doc'd in wallstore
   ["v1.26.3", "12/26/24"],// Show site wall background briefly on initial load, then fade out
   ["v1.26.2", "12/26/24"],// Handle site wall flashing when retrieved one replaces one from local storage  
   ["v1.26.1", "12/26/24"],// Remove commented out Landing infra
   ["v1.26.0", "12/26/24"],// Add local storage for recent items
                           // todo - local storage serializaiton causing issue with date object
   ["v1.25.0", "12/26/24"],// Add local storage for faster display of site wall
   ["v1.24.0", "12/25/24"],// Refactor Home with Landing image as Wall background
                           // Do not nav to Landing 
   ["v1.23.0", "12/23/24"],// Display item with comm email
   ["v1.22.0", "12/22/24"],// Add item to emailContext
   ["v1.21.0", "12/21/24"],// Update backend to send community emails
   ["v1.20.0", "12/21/24"],// Additional Community.Email CRUD
                           // Backend create of toContact counterpart comm, email
   ["v1.19.0", "12/20/24"],// Initial Community.Email infra for users to email each other
   ["v1.18.1", "12/15/24"],// Fix wall item delete so it updates item.onUserWall
                           // Fix addMyWallItem bug with undefined childNum
                           // Clean up old wall code from before it was only random
   ["v1.18.0", "12/14/24"],// Update search to return a max of 250 items instead of 20
                           // Backend deletes processed image actions
   ["v1.17.0", "12/14/24"],// Add chained actions
                           // Update addItem with backend thumb/largeThumb url population
   ["v1.16.0", "12/11/24"],// Update image popup to not start above screen
                           // Refactor itemImage.thumb/largeThumbUrl to be set by backend callback
   ["v1.15.0", "12/9/24"], // Fix xs gallery item thumbs name, year display bug                  
   ["v1.14.0", "12/8/24"], // Add TableThumb for account item/galleryItem popup image mouseover
                           // GalleryView sorts child galleries by name
                           // Add editGallery icon on AccountGalleryItems page
   ["v1.13.0", "12/7/24"], // Add item.size
                           // Fix ItemView bug where it was polluting itemStore items with childNum 
   ["v1.12.3", "12/6/24"], // Update EditGroupItems to allow the added item to be set to Hidden
   ["v1.12.2", "12/5/24"], // Fix AccountItems, AddGroupItem artist search, sort
   ["v1.12.1", "12/4/24"], // Fix AddGroupItem artist sort
   ["v1.12.0", "12/4/24"], // Add AddGroupItem for expanded item selection, better ux
   ["v1.11.0", "12/4/24"], // Edit contents of itemGroup
                           // Disable delete of an itemGroup child from account/gallery/items
   ["v1.10.0", "12/2/24"], // Item/Gallery thumbs show dateContentModified instead of dateModified
                           // Fix backend date comparison bug
   ["v1.9.1",  "12/1/24"], // Extract ItemThumbText functionality from ItemThumbSingle/Group
                           // Fixed EditItem bug setting yearCreated
   ["v1.9.0",  "11/30/24"],// Update localName with gallery.itemThumbPrefix, itemThumbPrefixReplace
   ["v1.8.0",  "11/27/24"],// Initial Google Analytics
                           // Fix xs itemView display of swipe icon in app when ungrouped
                           // Update PlayItems to not record hit for ex-... id
                           // Cancelled google workspace, shut down speakeasy.gallery email
   ["v1.7.0",  "11/25/24"],// Integrate ItemThumbConfig with GroupView  
   ["v1.6.2",  "11/24/24"],// Finish refactor of showFullThumbText to visibleThumbFields
                           // Move thumb.showGroup to visibleThumbFields
   ["v1.6.1",  "11/23/24"],// Consolidate thumbType usage with itemOrigin
                           // Display yearCreated on ItemThumb
   ["v1.6.0",  "11/21/24"],// Add ItemThumbConfig for initial config infra
                           // Add dateContentModified, yearCreated cols to AccountItems
   ["v1.5.0",  "11/19/24"],// Add optional item.yearCreated for year art was created
   ["v1.4.0",  "11/18/24"],// New sofia hell-no landing image with oz
   ["v1.3.0",  "11/17/24"],// Add Action admin
   ["v1.2.0",  "11/16/24"],// Fix gallery item count impact from ungroup update
   ["v1.1.0",  "11/15/24"],// Large refactor of item/itemGroup ungroup/childNum/extract/linkId - fix various xs display issues 
   ["v1.0.2",  "11/4/24"], // Delay display of artist on xs ItemView to prevent flashing
   ["v1.0.1",  "11/2/24"], // Control which item.otherImages are dispayed on ItemView
                           // Show other galleries when ItemView comes from gallery  
   ["v1.0.0",  "11/1/24"], // 1.0 version      
   ["v0.57.2", "10/31/24"],// Replace AboutView speakeasy images        
   ["v0.57.1", "10/29/24"],// FeedMgr.createFeedItem falls back to existingItem.name if not in updatedItem              
   ["v0.57.0", "10/29/24"],// Email extension config'd for titan email info@hell-no.gallery                         
                           // BulkEditItem updates feed if groups change
                           // Refactor createFeedItem in FeedMgr
   ["v0.56.1", "10/27/24"],// Fix EditItem background when called from AccountGalleryItems 
   ["v0.56.0", "10/26/24"],// Add X margin between thumbnails         
   ["v0.55.3", "10/25/24"],// AddGallery can specify parent gallery 
   ["v0.55.2", "10/24/24"],// Consolidate naming to "Hell-No", add Sofia Falcone landing image
   ["v0.55.1", "10/22/24"],// Ungrouped wall item links to the item it was ungrouped from
   ["v0.55.0", "10/21/24"],// Add delivery options to email settings
                           // EditItem can clear an item's artist 
   ["v0.54.0","10/20/24"], // Rebrand front-end to hell-no.gallery
   ["v0.53.6", "10/17/24"],// EditGalleryImages can elevate an image to parent gallery
                           // backend: fixed issue with link to a grouped items
   ["v0.53.5", "10/16/24"],// BulkEditItems adds/removes groups/galleries from each individual item
   ["v0.53.4", "10/16/24"],// Show ordered item names in GroupItems 
                           // Do not show walls in account galleries list
   ["v0.53.3", "10/16/24"],// Fix null alternateName issue in EditItem
   ["v0.53.2", "10/16/24"],// Add addItemImages to EditGalleryImages
                           // Add item.alternateName, gallery.useAltName
   ["v0.53.1", "10/14/24"],// Add Gallery link to ItemView with external origin
   ["v0.53.0", "10/13/24"],// Add to hits if item show in PlayItems
                           // Item thumbs in a gallery do not repeat title of gallery if it ends in a number (ie issue number)
                           // Change imageOnly (unused) to Show/Hide Dates (which may also not be used)
   ["v0.52.0", "10/12/24"],// Add PlayItems to RecentView, ItemView 
   ["v0.51.0", "10/11/24"],// Initial PlayItems slide show in GalleryView
                           // Gallery Item count ungroups items, takes duplicates into account
   ["v0.50.3", "10/9/24"], // Add Admin of walls
                           // Hardcode Walls to RANDOM displayOrder, remove set/edit of wallRow
                           // Refactor DEFAULT_* to Defaults
   ["v0.50.2", "10/9/24"], // Fix addSiteWallItem thumbDimensions issue 
   ["v0.50.1", "10/9/24"], // Fix ItemView nav thumb size issue with wall item crop images
   ["v0.50.0", "10/8/24"], // Initial Hits
   ["v0.49.1", "10/7/24"], // Refactor walls - HomeView only has site wall, remove group from WallStore
   ["v0.49.0", "10/6/24"], // Add random recent items to Wall
                           // Update ItemStore to only set dateContentModified if image or artist is updated
   ["v0.48.1", "10/3/24"], // Add groups to BulkEdit
                           // Make ItemView Feed and Link options same length
   ["v0.48.0", "10/2/24"], // Add "No content" message to UserView if no wall, galleries or items
   ["v0.47.5", "10/2/24"], // Fix EditItem feed publish bug - populate feedItem.state, primaryArtist
                           // Update ActionStore to only publish to new groups if content has not changed
   ["v0.47.4", "10/1/24"], // Update log display with red/blue flagged icon
   ["v0.47.3", "10/1/24"], // Do not delete flagged log entries
   ["v0.47.2", "10/1/24"], // Update user admin - dateCreeated, number of items
   ["v0.47.1", "10/1/24"], // Add About blurbs re the User and Account pages
   ["v0.47.0", "10/1/24"], // Add mouseover item popup to gallery header
                           // Standardize item popup with ItemPopup, ItemMgr.getPopupImage
   ["v0.46.0", "9/27/24"], // Gallery background image full page height
   ["v0.45.0", "9/22/24"], // Add XS settings icon with Admin link to App when on AccountView 
   ["v0.44.1", "9/21/24"], // ItemView fix for XS visibility issue with grouped items - race condition with computed items
   ["v0.44.0", "9/20/24"], // Expand logStore logging
                           // Fix external ItemView link issue - initially assume external link - onMounted not always called before methods
   ["v0.43.0", "9/19/24"], // Display gallery header, background images
                           // Add ImageType.BACKGROUND
   ["v0.42.0", "9/18/24"], // Remove image from gallery if imageType changed to not HEADER
                           // Rename ErrorStore to LogStore, add addInfo(...)
   ["v0.41.0", "9/17/24"], // Add/Manage gallery header image
   ["v0.40.0", "9/14/24"], // GalleryThumb can show child gallery images if child is visible to user
                           // Float action buttons at bottom of BulkEditItems, EditItems
                           // Add name Find/Replace to BulkEditItems
   ["v0.39.1", "9/13/24"], // Sort Galleries by name or date
   ["v0.39.0", "9/12/24"], // App firstName links to Admin if on user's page, user's page otherwise
                           // Xs App profile icon links to user's page if logged in, Login otherwise
                           // Display account-edit icon in xs UserView header if on user's page
                           // HomeView displays public galleries
                           // GalleriesView param determines public or user galleries
   ["v0.38.1", "9/11/24"], // Added single, grouped item images to About
   ["v0.38.0", "9/10/24"], // Default speakeasy.gallery URL expansion for all pages
                           // Add App default error handler 
                           // Item/Galleries/Gallery/UserView all handle direct link 
                           // Add "Why should I care" to Home/AboutView
   ["v0.37.0", "9/8/24"],  // HomeView galleries fill up two rows
                           // Home/UserView recent items fill up two rows
                           // UserView page title is username
   ["v0.36.1", "9/6/24"],  // Refactor UserView display of recent items   
                           // Update item.dateContentModified when state, images, artist updated
                           // Refactor gallery.dateContentAdded to dateContentModified, also updated by backend           
   ["v0.36.0", "9/4/24"],  // Item/GalleryView shows gallery hierarchy when not logged in 
   ["v0.35.1", "9/2/24"],  // ViewMgr galleryItemIsVisibleToUser not needed
   ["v0.35.0", "9/2/24"],  // Remove gallery.state GROUP option for more clear user experience
                           // Galleries only visible to the user if one of their items is visible
                           // GalleryThumb shows visible item count
   ["v0.34.1", "8/27/24"], // Refactor ItemView additionalImages row/col display
   ["v0.34.0", "8/25/24"], // ItemView - display text, other images beside or below main image
   ["v0.33.0", "8/21/24"], // ItemThumbSingle - add max width, add cardHeight when imageOnly so no whitespace
                           // Admin can flag, select, delete selected errors
   ["v0.32.1", "8/20/24"], // Continued tweak of ItemSwipe - remove quick bg flash
   ["v0.32.0", "8/18/24"], // Main error handler persists error, AdminErrors can view 
                           // Fix ItemSwipe image flash, bottom image peaking out under top 
   ["v0.31.1", "8/17/24"], // Swallow weird "X is null" errors that only occur when deployed
   ["v0.31.0", "8/17/24"], // Add gallery.desc, update GalleryView with better layout
   ["v0.30.1", "8/15/24"], // Rename toggle components/vars to ToggleIcon, viewstore.xsSwipeActive
                           // Fix ItemView bug where xsSwipeActive impacted !xs image size
   ["v0.30.0", "8/15/24"], // Add IconToggle for turning feature on/off
   ["v0.29.0", "8/14/24"], // Add EditItemView for xs edit
                           // Streamline xs EditItem - no image
   ["v0.28.2", "8/12/24"], // Make Search available when not logged in
   ["v0.28.1", "8/12/24"], // Populate search results when navigating back to SearchView
                           // Replace instantSeach infra with standard input for more control
   ["v0.28.0", "8/11/24"], // Sort search results by name, date
                           // Save search queries
   ["v0.27.0", "8/5/24"],  // Create backend hosted page to generate an item page with meta tags that is linked to corresponding ItemView
                           // Add ItemOrigin.EXTERNAL for direct pages that are not nav'd to from Home
                           // Update firebase.json to redirect /link urls to the link function
                           // Add username link to ItemView
                           // Experiment with head meta tags, but these only appear once page contents generated by client side script 
   ["v0.26.1", "7/31/24"], // Invoke EditImages from EditItem
                           // Publish to feed if EditImages updates primary image 
   ["v0.26.0", "7/30/24"], // Show otherImages in ItemView, ShowItemImages 
                           // Add otherImage.name
                           // Update EditImages to edit image.name, imageType
   ["v0.25.0", "7/29/24"], // Edit an item from ItemView
                           // Include images in email
   ["v0.24.1", "7/26/24"], // Send notification messages when item added to user's feed
   ["v0.24.0", "7/26/24"], // Send email when an item added to user's feed
   ["v0.23.4", "7/25/24"], // Add AddItemView for xs - modal doesn't fit on some phone screens and doesn't scroll
   ["v0.23.3", "7/23/24"], // Clean up Landing page routing/display and error handling
   ["v0.23.2", "7/23/24"], // Show feed savedItems if they exist and no feedItems 
                           // Add MessageSetup to App for further message integration
                           // Update search for active invites
   ["v0.23.1", "7/22/24"], // Integrate Item up/down swipe with Feed save/dismiss 
                           // Add L/R center nav to ShowItem when multiple images
   ["v0.23.0", "7/21/24"], // Handle Feed save/dismiss (not yet displayed on xs)
   ["v0.22.0", "7/18/24"], // Update Home recent items to always show recent public updates
                           // Fix User wall and add User recent items 
   ["v0.21.0", "7/15/24"], // Initial Community section, with chat
   ["v0.20.1", "7/9/24"],  // Integrate messages with group invite
                           // Update firebase.json to handle direct URLs - https://vue-land.github.io/faq/production-page-refresh
   ["v0.20.0", "7/6/24"],  // Wall image/text size adjusts to xs, preserves order during session
                           // Add knownContacts to group invite
                           // Split notification title/body
                           // Enable email, andy_robbins@yahoo.com override exists for emails < 12 char
                           // Admin can elevate user artist to site-wide visibiity
   ["v0.19.0", "6/29/24"], // Initial notification infrastructure
   ["v0.18.3", "6/25/24"], // Arrow through ShowItem items
   ["v0.18.2", "6/25/24"], // Make wall display order configurable/random
   ["v0.18.1", "6/24/24"], // Add popup large image to xs ItemView
                           // update xs ItemView nav to show item.name
   ["v0.18.0", "6/23/24"], // Update ItemView to show large image, child images if a parent, and meta data
                           // Fix crop by adding random url param to image and excluding it from workbox caching
                           // Add additional images to item
                           // Update ItemView to show all item's images
   ["v0.17.4", "6/19/24"], // Invite all members of a group to a different group
                           // Fix invite dynamic data issue in RegisterView
                           // Refactor invites to always send email
   ["v0.17.3", "6/4/24"],  // Update AddItem to include state, group, artist
                           // Add AddItem to HomeView, App(for xs) 
   ["v0.17.2", "6/2/24"],  // Fix FeedSwipeView itemGroup error
   ["v0.17.1", "6/2/24"],  // Refactor feed publish/retract
   ["v0.17.0", "5/27/24"], // Integrate speakeasy.gallery google workspace, info@speakeasy.gallery email 
   ["v0.16.3", "5/23/24"], // Revert to Item.state Group/Hidden - group item can be seen without being in a gallery
                           // Add feed processing of ItemGroups, feed admin
   ["v0.16.2", "5/20/24"], // Add Html editor for item.description
                           // New apple touch, favicon icons
   ["v0.16.1", "5/10/24"], // Streamline item, gallery visibility.  Renamed Hidden state to Grouped
                           // Determine visibility of search results, verify visibility of gallery 
                           // Add AboutView 
   ["v0.16.0", "5/5/24"],  // Flesh out user onboarding/startup experience - add multi-person invite
   ["v0.15.11","4/30/24"], // Add LandingView, HomeView w/o login shows Site Wall, register email links directly to Register
   ["v0.15.10","4/28/24"], // Display site wall if user's wall has no items
                           // Troubleshoot crop - doesn't work on localhost, but does when hosted
   ["v0.15.9", "4/27/24"], // Add site wall infrastructure - AdminWall, ManageWall, EditWallItem, EditImage...
   ["v0.15.8", "4/26/24"], // Refactor wall to first class entity, update login image 
   ["v0.15.7", "4/24/24"], // Wire in deleteUser, including function to delete auth user
   ["v0.15.6", "4/24/24"], // Add AdminUsers, admin navigation guards in prep for AdminWall
   ["v0.15.5", "4/20/24"], // Add fill space below shorter top swipe image so bot image doesn't show, delay bot image display
   ["v0.15.4", "4/19/24"], // Add group invtes to Home notification list, email user when invited to group
   ["v0.15.3", "4/18/24"], // Minor ItemView work around to display other user's items
   ["v0.15.2", "4/17/24"], // Populate user's feed with group feedItems when user joins
   ["v0.15.1", "4/16/24"], // Update RegisterView population of fields, error message
   ["v0.15.0", "4/16/24"], // Initial active home page work - Registration links to home, which will have a Registration ToDo
   ["v0.14.1", "4/15/24"], // Update RegisterView to be invite only, add initial group to invite
   ["v0.14.0", "4/13/24"], // Add email integration, user can invite someone by email. Remove registration link
   ["v0.13.2", "4/10/24"], // Add white background on SwipeItem so don't see bot image below shorter top image
                           // Set height of sm thumb nav to reduce image hop on nav
   ["v0.13.1", "4/10/24"], // Add xs back arrow, center ItemView top gallery links 
   ["v0.13.0", "4/9/24"],  // Fullscreen on xs - bottom nav bar, move some xs icon actions to top nav
   ["v0.12.5", "4/8/24"],  // PWA install, determine if installed on ios in prep for fullscreen usage
                           // Installed app caches db, auth and images when offline, but does not preserve auth 
                           // status when offline and restarted - user doesn't stay logged in
   ["v0.12.4", "4/6/24"],  // Drag & drop reorder of wallItems with.in a row
                           // Add gallery/galleries nav link and preload swipeBotItem in ItemView
   ["v0.12.3", "4/4/24"],  // Refactor wall row in SwipeWall, EditWallItem, user.wallItems, user.wallRows
   ["v0.12.2", "4/3/24"],  // Initial SwipeWall, including upper/lower home wall slides
   ["v0.12.1", "3/26/24"], // Add artist.allNames, item.primaryArtist.allNames for item searching
                           // Update Add/Update/DeleteArtist and functions to handle primary/AKA relationships
   ["v0.12.0", "3/25/24"], // Initial Algolia search
                           // ItemView minor clean-up
   ["v0.11.0", "3/19/24"], // Initial PWA using vite-plugin-pwa - caching works, but offline does not
                           // Add item.primaryImage.url to wallItem so wall item swipe has a bottom image 
                           // Update Wall to redisplay when edited
   ["v0.10.1", "3/15/24"], // Add gallery hierarchy
                           // Initial User.settings, utils.displayDate
   ["v0.10.0", "3/8/24"],  // Wall dynamically positions and fades-in/out items 
   ["v0.9.6",  "3/4/24"],  // Ungroup items and make small gallery thumbs on xs home page
                           // only display 3 galleries on xs Home (~same height as Feed item)
                           // Update xs Galleries to display 2 galleries/row
                           // Clear selected UserItems when action completes
                           // Add Show Hidden Items to UserItems
   ["v0.9.5", "2/27/24"],  // Fixed UserGalleryItems thumbnail width
                           // More work on GalleryView, ItemView subheaders
                           // Link first name to AccountView in nav
                           // Ungroup items in xs screen GalleryView, RecentView
                           // Preload next image in ItemView
   ["v0.9.4", "2/25/24"],  // swipe returns item to center if it's the first/last one
                           // Show/hide Thumbnails on xs ItemView
                           // Add item.state.HIDDEN
   ["v0.9.3", "2/24/24"],  // Github
                           // View itemGroup as individual items on small screen
                           // Clean up ItemView fullscreen, display entire itemGroup in fullscreen
                           // Refactor nav bar page titles
                           // Add small thumb for current item to ItemView nav
   ["v0.9.2", "2/18/24"],  // Update Items Admin to include Gallery filter
                           // Update gallery.images when item with gallery crop image is added/removed
                           // Can only crop primary image
                           // Implement image delete, with deletion of associated gallery and wall images
                           // Gallery thumb rotates multiple images
   ["v0.9.1", "2/12/24"],  // Improve top nav bar on mobile/xs screens
   ["v0.9.0", "2/10/24"],  // Add RecentItems to UserView
                           // Save/dismiss FeedItems
                           // Initial feed swipe prototype 
                           // Edit email, password
   ["v0.8.2", "2/5/24"],   // Fixed GroupView of group feed, fixed Home user feed, added FeedView 
                           // Initial UserView, with Wall.  Old UserView changed to AccountView
   ["v0.8.1", "2/2/24"],   // Update itemDelete function to reference primaryImage, otherImages
                           // add Action, intgerate feed CRUD functions
   ["v0.8.0", "1/30/24"],  // Initial ItemGroup to display runs of pages, add Item.primaryImage
   ["v0.7.1", "1/23/24"],  // Speakeasy image on home page when not logged it
                           // Bulk upload files sychronously, bulk upload to gallery
                           // Name prefix for Bulk Edit
   ["v0.7.0", "1/20/24"],  // Add Recent Items view, Gallery Thumb
   ["v0.6.1", "1/17/24"],  // Multiple images in item, add image crop
   ["v0.6.0", "1/14/24"],  // Bulk upload
                           // Add artist to Bulk Edit, update User/Admin display of Artists
                           // Fix thumbnail drag & drop ordering
                           // Function to update Wall if Item name/artist updated
                           // Add swipe to ItemView for small/mobile screens
   ["v0.5.0", "1/11/24"],  // Add Artists, Initial Admin
                           // Add updateItem function to update wall if necc 
   ["v0.4.3", "1/9/24"],   // Add 600x600 lg thumbnail
   ["v0.4.2", "1/8/24"],   // Add popup image to wall
   ["v0.4.1", "1/8/24"],   // Pop up larger image on thumbnaili mouseover
   ["v0.4.0", "1/5/24"],   // Add item - save image natural size
                           // Item thumb - all images same height based on aspect ratio
                           // Item View - display image as large as possible, nav with arrow keys 
   ["v0.3.3", "1/2/24"],   // Add configurable cols to UserItems
                           // Add email to User, invite group user via email
   ["v0.3.2", "1/1/24"],   // Update Wall to be aware of window width.
                           // Item view - fix title on small window, add fullscreen image
                           // Updated db rules via console
   ["v0.3.1", "1/1/24"],   // Add feedActions, integrate with feed prcessing function
                           // Initial Group view
   ["v0.3.0", "12/31/23"], // Items don't have to be in a gallery.  Item bulk edit
                           // Initial feed
                           // Initial functions - item delete triggers delete of images
   ["v0.2.2", "12/28/23"], // Consolidate item image, thumb into one struct
   ["v0.2.1", "12/27/23"], // Add GroupUser Invited status, accept/decline invite in Account
   ["v0.2.0", "12/26/23"], // Add User wall, with drag & drop editing
]
