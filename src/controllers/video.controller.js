import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
        //TODO: get all videos based on query, sort, pagination
        const filter={};
        if(query){
            filter.title={$regex:query, $options:"i"};//case insensitive search
        }
    
        if(userId){
            filter.owner=userId
        }
    
        const sortOrder=sortType==="desc"?-1:1;
        const sort={[sortBy]:sortOrder}
    
        const skip=(page-1)*limit;
    
        const videos=await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("owner", "fullname username avatar")
        .exec();
    
        const totalVideos=await Video.countDocuments(filter);
    
        return res.status(200).json(new ApiResponse(
            200,
            {
                videos,
                totalPages: Math.ceil(totalVideos/limit),
                currentPage:parseInt(page)
            },
            "Video fetched successfully"
        ))
    } catch (error) {
        console.log("Error while getting all videos")
        throw new ApiError(500,"Error while fetching all the videos")
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400,"Title and description are required");
    }

    if(!req.files || !req.files.videoFiles || !req.files.thumbnail){
        throw new ApiError(400,"Video file and thumbnail are required");
    }

    const videoFileLocalPath=req.files.videoFile[0].path;
    const thumbnailLocalPath=req.files.thumbnail[0].path;

    const videoFile=await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile.url || !thumbnail.url){
        throw new ApiError(500,"Failed to upload video or thumbnail");
    }

    const newVideo= await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration:videoFile.duration,
        owner:req.user._id
    })

    const createdVideo=await Video.findById(newVideo._id)
    if(!createdVideo){
        throw new ApiError(500,"Something went wrong while publishing the video")
    }

    return res.status(201).json(
        new ApiResponse(201, createdVideo,"Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video =await Video.findById(videoId).populate("owner","fullname username avatar");

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        video,
        "Video fetched successfully"
    ))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description}=req.body;
    let newThumbnail;

    const video=await Video.findById(videoId);

    if(!video){
        new ApiError(404,"Video not found");
    }

    if(title){
        video.title=title
    }

    if(description){
        video.description=description
    }

    if(req.file){
        newThumbnail=await uploadOnCloudinary(req.file.path)
        if(newThumbnail && newThumbnail.url){
            await deleteFromCloudinary(video.thumbnail)
            video.thumbnail=newThumbnail.url;
        }else{
            throw new ApiError(500,"Failed to upload new thumbnail.")
        }
    }

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "video updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    await deleteFromCloudinary(video.videoFile);
    await deleteFromCloudinary(video.thumbnail);

    await video.remove();
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found");
    }

    video.isPublished=!video.isPublished;

    await video.save();

    return res.status(200).json(
        new ApiResponse(200,
            video,
            "Video published status toggled successsfully"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}