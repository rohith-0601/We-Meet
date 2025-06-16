import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema({
    name:{type:String,required:true},
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    token:{type:String},
});


const User = new mongoose.model("User",UserSchema);
export {User};