const Tag = require("../models/tag");

// create tag ki api or handler function
exports.createTag = async (req,res)=>{
    try{
        // fetch data
        const {name, description} = req.body;
        // validation 
        if(!name || ! description){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        // create entry in DB
        const tagDetails = await Tag.create({
            name: name,
            description: description,
        });
        console.log(tagDetails);

        // return response
        return res.status(200).json({
            success: true,
            message: 'Tag Created Succesfully',
        });

    }
    catch(error){
          return res.status(500).json({
            success: false,
            message: error.message,
          })  
    }

};

// getAllTags handler function
exports.showAlltags = async(res,req)=>{
    try{
        const allTags = await Tag.find({},{name: true, description: true} );
        // here no condition so fetch all data which contain name and description
        res.status(200).json({
            success: true,
            message: 'All tags return successfully',
            allTags,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
          })  
    }
}