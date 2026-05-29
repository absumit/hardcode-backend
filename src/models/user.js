const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstname:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
    },
    emailid:{
        type:String,
        required:true,
        unique:true,
        sparse:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved:{
        type:[Schema.Types.ObjectId],
        ref:'Problem',
        default:[]
    },
    password:{
        type:String,
        required:true
    }
},{
    timestamps:true
});


const User = mongoose.model("user",userSchema);

module.exports = User;
