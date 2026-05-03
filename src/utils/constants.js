
export const ActionStatus = {
   CREATED:   'Created',
   CHAINED:   'Chained',
   BYPASSED:  'Bypassed',  // set by backend
   PROCESSED: 'Processed', // set by backend
   PROCESSING:'Processing',// set by backend
   ERROR:     'Error'      // set by backend
}

export const ActionType = {
   FEED_UPDATE:   'FeedUpdate',
   ACCEPT_INVITE: 'AcceptInvite',
   ACCEPT_GROUP_INVITE:  'AcceptGroupInvite',
   DECLINE_GROUP_INVITE: 'DeclineGroupInvite',
   IMAGE:         'Image',
   PROCESS:       'Process',
   SEND_EMAIL:    'SendEmail', 
}

export const ArtistState = {
   PRIMARY:  'Primary',
   AKA:      'AKA',
}

export const ChatState = {
   ACTIVE:   'Active',
   ARCHIVED: 'Archived',
}

export const Defaults = {
   DELETED_USER_ID: "0",
   MAX_WALL_ITEMS:  20,
   SITE_ID:         "0",
   THUMB_HEIGHT:    200,
   SM_THUMB_HEIGHT: 150,
   LG_THUMB_HEIGHT: 250,
}
export const DefaultWall = { wallRows:0, wallItems:[] }    

export const EmailSourceState = {
   EMAIL_SENT: 'Email Sent', // set by backend
}
 
export const Emit = {
   CANCEL:      'cancel',
   CONFIRM:     'confirm',
   DELETE:      'delete',
   DONE:        'done',
   ITEM:        'item',
   LOADED:      'loaded',
   POPUP:       'popup',
   SELECT:      'select',
   STATE:       'state',
   SWIPE_LEFT:  'swipeLeft',
   SWIPE_RIGHT: 'swipeRight',
   SWIPE_UP:    'swipeUp',
   SWIPE_DOWN:  'swipeDown',
}

export const FeedAction = {
   PUBLISH:    'Publish',
   RETRACT:    'Retract',
}

export const GalleryThumbWidth = 250
export const GalleryThumbOptions = {
   SM_THUMB:     'Small Thumbnails',
   SHOW_CHILD:   'Show Child Galleries',
   SHOW_PRIVATE: 'Show My Private Galleries',
   USER:         'User',
   UPDATED:      'Date Updated',
   SORT_BY_NAME: 'Sort by Name',
   SORT_BY_DATE: 'Sort by Date',
}

export const ParentFeedType = {
   SAVED:    'Saved',
}

export const FeedType = {
   USER:    'User',
   GROUP:   'Group',
}

export const GroupUserState = {
   OWNER:      'Owner',
   MODERATOR:  'Moderator',
   MEMBER:     'Member',
   VIEWER:     'Viewer', // read-only
   INVITED:    'Invited',
}

export const ImageType = {
   PRIMARY:    'Primary',
   OTHER:      'Other',
   CROP:       'Crop',
   GALLERY:    'Gallery',
   HEADER:     'Header',
   BACKGROUND: 'Background',
}
export const GalleryImageTypes = [ ImageType.GALLERY, ImageType.HEADER, ImageType.BACKGROUND ]

export const InviteState = {
   CREATED:  'Created',
   SENT:     'Sent',
   ACCEPTED: 'Accepted',
   ARCHIVED: 'Archived',
}

export const InviteType = {
   SITE:  'Site',
   GROUP: 'Group',
}

export const ItemNavAction = {
   EXTERNAL: 'ext',
   NEXT:     'next',
   PREV:     'prev',
}

export const ItemOrigin = {
   WALL:      'wall',
   RECENT:    'recent',
   FAVORITES: 'favorites',
   RANDOM:    'random',
   SEARCH:    'search',
   GALLERY:   'gallery',
   ARTIST:    'artist',
   ADMIN:     'admin',
   EXTERNAL:  'ext',
}

export const ItemType = {
   SINGLE:  'Single',
   GROUP:   'Group',
}

export const ItemThumbOptions = { 
   SM_THUMB: 'Small Thumbnails',
   LG_THUMB: 'Large Thumbnails',
   TITLE:    'Title',
   ARTIST:   'Artist',
   UPDATED:  'Date Updated',
   USER:     'User',
} 

export const LogEntryType = {
   ERROR:   'Error',
   INFO:    'Info',
}

export const NotificationOptions = {
   IMMEDIATE: 'Immediate',
   DAILY:     'Daily', 
   NEVER:     'Never', 
}

export const Route = {
   HOME:      { name: 'home',      url: '/'           },
   GROUP:     { name: 'group',     url: '/group/'     },
   GALLERY:   { name: 'gallery',   url: '/gallery/'   },
   GALLERIES: { name: 'galleries', url: '/galleries/' },
   ARTIST:    { name: 'artist',    url: '/artist/'    },
   SEARCH:    { name: 'search',    url: '/search'     },
   FEED:      { name: 'feed',      url: '/feed'       },
   RECENT:    { name: 'recent',    url: '/recent/'    },
   ITEM:      { name: 'item',      url: '/item/'      },
   ITEM_CHILD:{ name: 'itemch',    url: '/item/'      },  // overload item with additional params
   USER:      { name: 'user',      url: '/user/'      },
   FAVORITES: { name: 'favorites', url: '/favorites'  },
   RANDOM:    { name: 'random',    url: '/random'     },
   LOGIN:     { name: 'login',     url: '/login'      },
   REGISTER:  { name: 'register',  url: '/register/'  },
   MESSAGE:   { name: 'message',   url: '/message'    },
   BROADCAST: { name: 'broadcast', url: '/broadcast'  },
   ABOUT:     { name: 'about',     url: '/about'      },
   ACCOUNT:   { name: 'account',   url: '/account'    },
   ADMIN:     { name: 'admin',     url: '/admin'      },
   ADD_ITEM:  { name: 'add-item',  url: '/add-item'   },
   EDIT_ITEM: { name: 'edit-item', url: '/edit-item/' },
    // FORGOT:    'Forgot Password',
}

export const State = {
   PUBLIC:    'Public',
   GROUP:     'Group', // todo - deprecated
   PRIVATE:   'Private',
   HIDDEN:    'Hidden',  
   INVISIBLE: 'Invisible',  
}
export const ItemStates    = [ State.PUBLIC, State.PRIVATE, State.INVISIBLE, State.HIDDEN ]
export const GalleryStates = [ State.PUBLIC, State.PRIVATE, State.INVISIBLE ]
export const GroupStates   = [ State.PUBLIC, State.GROUP, State.PRIVATE ]

export const ThumbType = {
   GALLERY:   'Gallery',
   RECENT:    'Recent',
   FEED:      'Feed',
}

export const TodoType = {
   INVITE:       'Invite',
   GROUP_INVITE: 'GroupInvite',
}
   
export const WallDisplayOrder = {
   USER_SET:  'User Set',
   RANDOM:    'Random',
}

export const WallRowHeight = {
   DEFAULT: 320,
   XS:      250,
}

export const WallType = {
   SITE:  'Site',
   USER:  'User',
}

export const BackgroundColors = {
   GREEN:   { name: "green-lighten-5",  code: "#E8F5E9"},
   YELLOW:  { name: "yellow-lighten-4", code: "#FFF9C4"},
   RED:     { name: "red-lighten-4",    code: "#FFCDD2"},
   GREY:    { name: "grey-lighten-3",   code: "#EEEEEE"},
   WHITE:   { name: "white",            code: "#FFFFFF"},
}

export const Colors = [ 'red', 'pink', 'orange', 'yellow', 'blue', 'green', 'indigo', 'purple' ]


