const Category = require("../models/category");

// create Category ki api or handler function
exports.createCategory = async (req,res)=>{
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
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log(categoryDetails);

        // return response
        return res.status(200).json({
            success: true,
            message: 'Category Created Succesfully',
        });

    }
    catch(error){
          return res.status(500).json({
            success: false,
            message: error.message,
          })  
    }

};

// getAllCategory handler function
exports.showAllcategory = async(res,req)=>{
    try{
        const allCategory = await Category.find({},{name: true, description: true} );
        // here no condition so fetch all data which contain name and description
        res.status(200).json({
            success: true,
            message: 'All tags return successfully',
            allCategory,
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
          })  
    }
}