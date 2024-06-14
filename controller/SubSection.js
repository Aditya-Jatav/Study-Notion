const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadToCloudinary, uploadImageCloudinary} = require("../utils/imageUploader");

// create SubSection

exports.createSubSection = async (req, res) =>{
    try{
        // fetch data from req body
        // sectionid already h hmare pass 
        const {sectionId, title, timeDuration, desciption} = req.body;
        // extract file/video
        const video = req.files.videoFile;
        // validation
        if(!sectionId  || !title || !timeDuration || !desciption){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        // upload video to cloudinary
        const uploadDetails = await uploadImageCloudinary(video, process.env.FOLDER_NAME);
        // create a sub-section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: desciption,
            videoUrl: uploadDetails.secure_url,
        })
        // update section with this sub section ObjectId
        const updateSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                {$push: {
                                                    subSection: SubSectionDetails._id,
                                                }},
                                                {new : true});
        // HW: log updated section here, after adding populate query
        //  return response
        return res.status(200).json({
            success: true,
            message: 'Sub Section Created Succefully',
            updateSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message:'Internal server error',
            error: error.message,
        })
    }
};

// HW: Update subsection

// HW: Delete subsection