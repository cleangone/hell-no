/*
   Post 1.0:
      - replace uuid with smaller
      - cut & opast item and gallery urls 
         - url will be the page (gallery, item)
         - context will be null 
            - what if there is an existing context?
        
      - AboutView FAQ 
         - walls       
      - Add parallax to gallery header
      - Eder-mode for wall
      - User can add to site art wall - would have to be via action because of edit rules
      - Deleted status, trash
      - Add Copy Link to GalleryView
      - Add all metadata to mobile ItemView 
      - Include Edit gallery images in EditGallery
      - review/refactor stores, esp default returns of collection queries
      - finish wall automation - no more set random, auto figure out rows
      - add filter to RecentView
      - broadcast control: pause/ff/rew
*/
export const versions = [     
   ["v2.0.0", "4/x/26"],   // Duplicate speakeasy codebase functionality 
]

/*

   Top
      - AboutView FAQ
      - ItemView
         - 90% width on swipeitem - cannot scroll on phone with full width
         - figure out min height for bottom cover
      - Wall background color
   Group

   Feed 
      
   Notifications
      - expand home page ToDo section
   Item
      - delete removes it from wall
   General
      - 600x600 thumb will enlarge small images
      - caching with workers
      - Better firestore, storage rules
   */
