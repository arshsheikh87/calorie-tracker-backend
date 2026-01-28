import mongoose from "mongoose";

const entrySchema=new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    type:{
        type: String,
        enum: ["meal", "exercise"],
        required: true,
    },
   history:[
   {
      snapshot: mongoose.Schema.Types.Mixed,
      updatedAt: Date,
   },
  ],
  calories:{
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
    // required: true,
  },
  carbs: {
    type: Number,
    // required: true,
  },
  fats:{
    type: Number,
    // required: true,
  },
  duration:{
    type: Number,
    required: function(){
        return this.type==="exercise";
    }
  },
  date:{
    type: String,
    required: true,
  },
  updatedAt:{
    type: Date,
    default: Date.now,
  },
  createdAt:{
    type: Date,
    default: Date.now,
  }
});
export const entries=mongoose.models.entries||mongoose.model("entries",entrySchema);