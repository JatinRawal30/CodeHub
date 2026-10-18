const mongoose = require('mongoose');
const { Schema } = mongoose;

// schema for the user collection of leetcode Db.

const userSchema =new Schema({
    firstName:{
        type: String,
        minLength: 3,
        maxLength: 20,
        required: true
    },
    lastName:{
        type: String,
        minLength: 3,
        maxLength: 20,
        optional: true
    },
    age:{
        type: Number,
        min: 6,
        max: 100
    },
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 20
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    password:{
        type: String,
        required: true,
        minLength: 8
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    problemsSolved:{        // we are storing the problem _id's in this array.
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Problem',
        }],
        default: []
    },
    profile:{
        avatar:{
            type: String,
            default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        },
        bio:{
            type: String,
            maxLength: 200,
            default: ''
        }
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    isActive:{
        type: Boolean,
        default: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    languagePreferences:{
        type : [String],
        default: []
    }
},{
    timestamps: true
});

const user= mongoose.model('user', userSchema);

module.exports={
    user
}