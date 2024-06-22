const { validatePaymentVerification } = require("razorpay/dist/utils/razorpay-utils");
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
exports.showAllCategory = async(res,req)=>{
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

// category pageDetails
exports.categoryPageDetails = async (req, res)=>{
    try{
        // get category
        const {categoryId} = req.body;
        // get courses for specified categoryId
        const selectCategory = await Category.findById(categoryId)
                                            .populate("courses")
                                            .exec();
        
        // validatation
        if(!selectCategory){
            return res.status(404).json({
                success: false,
                message:'Data Not Found',
            });
        }  
        // get courses for different categories
        const differentCategories = await Category.find({
                                              _id:{$ne: categoryId},
                                             })   
                                             .populate("courses")
                                             .exec();
                                             
        // get top selling courses

        // return res
        return res.status(200).json({
            success: true,
            data:{
                selectCategory,
                differentCategories,
            },
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}