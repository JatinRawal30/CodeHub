const mongoose = require('mongoose');
const {Schema } = mongoose;

const problemSchema = new Schema({
    problemID:{
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        // complete problem statement
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags:{
        type: [String],
        default: [],
        enum : ['arrays', 'strings', 'dynamic programming', 'trees', 'graphs', 'linked list', 'hash table', 'sorting', 'searching', 'recursion', 'backtracking', 'heaps', 'tries', 'geometry', 'math', 'two pointers', 'sliding window', 'stack', 'queue', 'special']
    },
    visibleTestCases : [
        {
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
                required: true
            }
        }
    ],
    hiddenTestCases : [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],
    constraints :{
        type : [String],
        default : [],
    },
    timeLimit:{
        type: Number,
        default: 1.0,  // in seconds
        required: true
    },
    memoryLimit:{
        type: Number,
        default : 256,  // in MB
        required: true
    },
    referenceSolution:{
        language: {
            type: String,
            required: true
        },
        completeCode: {
            type: String,
            required: true
        }
    },
    referenceSolutions: [
        {
            language: {
                type: String,
                required: true
            },
            completeCode: {
                type: String,
                required: true
            }
        }
    ],
    starterCode: {
        language: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true
        }
    },
    starterCodes: [
        {
            language: {
                type: String,
                required: true
            },
            code: {
                type: String,
                required: true
            }
        }
    ],
    problemCreator :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }

})

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;