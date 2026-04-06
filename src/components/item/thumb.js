import { getDownloadURL } from 'firebase/storage'
   
export async function updateThumbUrl(thumbRef, itemId, image, itemStore) {
   console.log("Starting wait for thumbDownloadURL")
   await getDownloadURL(thumbRef).then((thumbDownloadURL) => {
      console.log("Got thumbDownloadURL " + thumbDownloadURL)
   
      image.thumbUrl = thumbDownloadURL
      itemStore.updateItem({
         id: itemId,
         image: image
      })
   })
}