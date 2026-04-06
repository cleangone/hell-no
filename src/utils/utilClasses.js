// hold objects that will be displayed over a set of rows
export class ThumbRow {
   constructor(maxRows, maxWidth) {
      this.thumbs = []
      this.row = 0
      this.width = 0
      this.maxRows = maxRows
      this.maxWidth = maxWidth
   }

    addThumb(thumb, thumbWidth) { 
      if (this.width > 0 && this.width + thumbWidth > this.maxWidth) { 
         // console.log(thumb.name + " width " + thumbWidth + " + curr " + this.width + " exceeds max " + this.maxWidth)
         if (this.row == this.maxRows - 1) { return null }
         this.row++
         this.width = 0
      }
      this.thumbs.push(thumb) 
      this.width += thumbWidth 
      // console.log(thumb.name + " est row " + this.row + " new width " + this.width)
      return thumb
   }
 }
