const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
    problemid:{
          type: String,
          required: true,
          unique:true,
          minLength:2,
          maxLength:4   
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    constraints: {
        type: [String],
        required: false
    },
    examples: [{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        },
        explanation: {
            type: String,
            required: false
        }
    }],
    hiddentestcases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            }
        }
    ],
    refsolution: [
        {
            language:{type: String,required: true},
            solution:{type: String,required: true}
        }
    ],
    tags: [{
        type: String,
        required: false
    }],
    category: {
        type: String, 
        required: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }   
}, {
    timestamps: true
});

const Problem = mongoose.model('problem', problemSchema);

module.exports = Problem;
