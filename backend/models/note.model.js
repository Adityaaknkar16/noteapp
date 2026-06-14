import mongoose from "mongoose";


const noteSchema = new mongoose.Schema({
   title:{
     type:String,
    requried:true,
   },

   content:{
     type:String,
    requried:true,
   },

    tags:{
     type:[String],
   default:[]
   },

   isPinned:{
    type: Boolean,
    default: false
   },
   color:{
    type: String,
    default: "#ffffff"
   },
   paperType: {
     type: String,
     default: "plain"
   },
   fontFamily: {
     type: String,
     default: "Outfit"
   },
   penColor: {
     type: String,
     default: "#1e293b"
   },
   stickers: {
     type: [String],
     default: []
   },
   isArchived:{
    type: Boolean,
    default: false
   },
   isTrashed:{
    type: Boolean,
    default: false
   },
   userId :{
    type:String,
    requried:true

   },
   collaborators: {
    type: [String],
    default: []
   },
   lastEditedBy: {
    type: String
   },

   createdAt:{
    type:Date,
    default: Date.now()
   }
})

const Note =mongoose.model("Note",noteSchema)

export default Note