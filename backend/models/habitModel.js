const mongoose = require("mongoose");

const HabitSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    daysTarget:{
        type: Number,
        required: true,
    },
    startdate:{
        type: Date,
        default: Date.now
    },
    startdatestreak: {
        type: Date,
        default: Date.now
    },
    beststreak:{
        type: Number,
        default: 0 //se guarda en milisegundos
    },
    lastLossdate:{
        type: Date,
        default: null
    },
    asset:{
        type: Boolean,
        default: false
    }

});

export default mongoose.model("Habit", HabitSchema);