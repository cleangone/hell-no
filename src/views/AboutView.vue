<template>
   <div v-if="viewMgr.isDeskTop" class="title">About</div>
   <div class="text-left">
      <div class="mt-4">
         <div class="text-h5">Why should I care about another site to view and manage art?</div>
         <div class="mt-1 ml-4">
            <div>The Hell-No Gallery is built around the concept of <b>flexible visibility.</b></div>
            <ul class="ml-3">
               <li><b>Who</b> can see a piece of art? In addition to the standard Public and Private visibility of items, 
                  a Group option is added.  This allows people to share art just within a specified group.
               </li>
               <li><b>Where</b> is a piece of art located? It can be put in multiple Galleries, or no Gallery at all. 
               </li>
               <li><b>How</b> can the app be viewed? Hell-No is a progressive web app, which means it acts like a 
                  website when viewed on a computer browser and an app on a phone. When behaving as a website on 
                  a browser, it uses links, with the arrow keys for shortcuts. On a phone, the arrow keys are replaced by swiping.  It 
                  can also be installed on a phone and function much like a native app, with notifications other features.
                  <v-container>
                     <v-row>
                        <v-col cols="8" class="px-3 pb-3 pt-2 mr-2 text-center bg-shade">
                           <div class="pb-2"><b>Computer Browser</b> </div>
                           <v-img :src="BROWSER"/>
                        </v-col>
                        <v-col class="px-3 pb-3 pt-2 mr-2 text-center bg-shade">
                           <div class="pb-2"><b>Installed on Phone</b></div>
                           <v-img :src="PHONE"/>
                        </v-col>
                     </v-row>
                  </v-container>
               </li>
            </ul>
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Items</div>
         <div class="mt-1 ml-4">
            <div>An item can hold either a single piece of art or collection of other items that are managed as group. 
            </div>
            <v-container>
               <v-row>
                  <v-col class="pb-3 pt-2 mr-2 text-center bg-shade">
                     <div class="pb-2"><b>Single Item</b></div>
                     <v-img :src="SINGLE_ITEM" :height="300"/>
                  </v-col>
                  <v-col cols="7" class="pb-3 pt-2 mr-2 text-center bg-shade">
                     <div class="pb-2"><b>Grouped Item</b></div>
                     <v-img :src="ITEM_GROUP" :height="300"/>
                  </v-col>
               </v-row>
            </v-container>

            <div class="text-h6 mt-2">Visibility</div> 
            <div>Visibility controls who can see an Item almost everywhere it qppears, incuding Galleries, Search Results and 
                  Recent Updates.  As discussed later, the Art Wall is an exception, and all items on a Wall are publicly visible.</div> 
            <ul class="ml-3">
               <li><b>Public</b>: the item can be seen by anyone.</li>
               <!-- <li><b>Gallery</b>: an item must be put into a Gallery to be seen, and then can only be seen by people with 
                  visibility to that gallery.  It will not be seen in Search Results and Recent Updates.
               </li> -->
               <li><b>Group</b>: the item can only be seen by people in one of its configured groups. 
               </li>
               <li><b>Private</b>: the item can only be seen by the owner.</li>
               <li><b>Hidden</b>: the item will not be seen by anyone, including the owner, in Galleries, Search Results and 
                  Recent Updates.  When multiple items, (ie. a run of pages) are grouped, the individual items 
                  are set to the Hidden visibiilty. They will still appear in the Item administration, and can be 
                  changed back to other states if desired.
               </li>
            </ul>
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Groups</div>
         <div class="mt-1 ml-4">
            <div>A user can be a member of a Group.  Group members may invite other users to be a member.
            </div>
            <div class="text-h6 mt-2">Visibility</div> 
            <ul class="ml-3">
               <li><b>Group</b>: the group can be seen by its owner and all members</li>
               <li><b>Private</b>: the group can only be seen by its owner</li>
               <li><b>Public <i>(Future)</i></b>: the group can be seen and discovered by anyone.  Non-members can request membership</li>
            </ul>
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Galleries</div>
         <div class="mt-1 ml-4">
            <div>
               Items can be put in multiple Galleries.  When viewing a Gallery, logged in users may see different 
               items depending on what groups they are a part of.  Viewers that are not logged in will only see the 
               gallery's pulic items.
            </div>
            <div class="text-h6 mt-2">Visibility</div> 
            <ul class="ml-3">
               <li><b>Public</b>: the gallery can be seen and discovered by anyone as long as it contains at
                  least one Item that is visible to the user.</li>
               <li><b>Private</b>: the gallery can only be seen by its owner</li>
            </ul>
            <div class="text-h6 mt-2">Navigation</div> 
            <ul class="ml-3">
               <li>When viewing on a computer browser, the left/right arrow keys can be used for navigation in 
                    addition to the links.</li>
               <li>On a mobile device, the user can navigate to the previous/next Item by swiping left or right.</li>
            </ul>
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">User Page</div>
         <div class="mt-1 ml-4">
            A user's page displays their individual Art Wall, Groups (public and any group ones that are visible) and 
            Recent Updates.
            <br><br>
            When logged in, a user can navigate to their Account page by clicking on their name.
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">My Account - Update user profile, Add/update/delete Items, Galleries, etc</div>
         <div class="mt-1 ml-4">
            When logged in, a user's Account page can be accessed via the drop down menu next to their name
            on a browser, or clicking on their Name a second time on their user page.  On a phone app, an
            Edit Account icon is displayed when the user is on their User page.
         </div>
      </div>
     
      <div class="mt-4">
         <div class="text-h5">Art Walls</div>
         <div class="mt-1 ml-4">
            The site and individual users each have an Art Wall.  Any item added to a user's wall is visible to all users and 
            non-logged-in browsers.
            <br><br>
            Once added to a user's Art Wall, an item is a candidate to be included in the Site Art Wall.
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Group Feeds</div>
         <div class="mt-1 ml-4">
            Group Feeds show items in the groups that have been updated.  A Feed Item can be Saved or Dismissed.  If Saved, 
            it can be viewed in the user's Saved Feed Items section of the Feed.
            <br><br>
            When using the app on a mobile device, Feed Save/Dismiss can be done by swiping the image up or down.
         </div>
      </div>
      <div class="mt-4">
         <div class="text-h5">Recent Updates</div>
         <div class="mt-1 ml-4">
            Recent Updates shows the most recently updated PUBLIC Items.
            <br><br>
            When viewing the Recent Items on a mobile device, the user can navigate to the previous/next Item by swiping left or right.
         </div>
      </div>

      <div class="mt-4">
         <div class="text-h5">Install</div> 
         <div class="mt-1 ml-4">
            The site can be installed on phones and laptop or desktop computers.  This is most useful on phones, 
            where it will then function as an app.
            <div class="text-h6 mt-1">Install Instructions</div>
            <ul class="ml-3">
               <li><b>iPhone</b>: tap the forward button, and then select the Add to Home Screen option.</li> 
            </ul>
         </div>
      </div>
   </div>
</template>

<script setup>
   import { useViewMgr } from '@/stores/viewMgr'
   
   const BROWSER = "https://firebasestorage.googleapis.com/v0/b/gallery-a1fcb.appspot.com/o/about%2Fbrowser.png?alt=media&token=da73b445-2aca-4aab-b401-9778315e1496"
   const PHONE   = "https://firebasestorage.googleapis.com/v0/b/gallery-a1fcb.appspot.com/o/about%2Fphone.png?alt=media&token=179bf82f-1e93-4424-8df4-5a2f728a5cba"
   const SINGLE_ITEM = "https://firebasestorage.googleapis.com/v0/b/gallery-a1fcb.appspot.com/o/about%2Fsingle-item.png?alt=media&token=821697dc-9e88-4c68-a26d-ca493ea66607"
   const ITEM_GROUP  = "https://firebasestorage.googleapis.com/v0/b/gallery-a1fcb.appspot.com/o/about%2Fitem-group.png?alt=media&token=eda029ed-176b-49ed-9c7c-130e8a3cdb80"

   const viewMgr = useViewMgr()
</script>

<style>
</style>
