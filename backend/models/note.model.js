import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
   title:{
     type:String,
     required:true,
   },
   content:{
     type:String,
     required:true,
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
     required:true
   },
   collaborators: {
     type: [String],
     default: []
   },
   lastEditedBy: {
     type: String
   },
   
   // Voice Notes attachment support (base64 audio data URIs)
   // NOTE: In production with many users, these should move to proper file storage (e.g. Cloudinary)
   voiceNotes: {
     type: [String],
     default: []
   },

   // Sketches attachment support (base64 PNG data URIs)
   sketches: {
     type: [String],
     default: []
   },

   // PIN lock parameters
   isLocked: {
     type: Boolean,
     default: false
   },
   pinHash: {
     type: String,
     default: null
   },

   // Share Token support (unauthenticated read-only public links)
   shareToken: {
     type: String,
     default: null
   },

   createdAt:{
     type:Date,
     default: Date.now
   }
});

const Note = mongoose.model("Note", noteSchema);
export default Note;