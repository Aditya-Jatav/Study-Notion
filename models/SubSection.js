const mongoose = require("mongoose");

const subSection = new mongoose.Schema({
  title:{
    type : String,
  },
  timeDuration:{
    type:String,
  },
  desciption:{
    type : String,
  },
  videoUrl:{
    type: String,
  }
,
});

module.exports  = mongoose.model("SubSection",subSection);