import  { Schema } from "mongoose";


const MeetingSchema = new Schema({
    user_id:{type:String},
    meetingCode:{type:String,required:true},
    date:{type:Date,default: Date.now,required:true}
});


const Meeting = new mongoose.model("Meeting",MeetingSchema);
export {Meeting};