import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body;
    if(!content){
        throw new ApiError(400,"Content is required");
    }

    const newTweet=await Tweet.create({
        content,
        owner:req.user._id
    })

    const createdTweet=await Tweet.findById(newTweet._id).populate("owner","fullname username avatar")

    if(!createdTweet){
        throw new ApiError(500,"Something went wrong while creating the tweet");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdTweet,
            "Tweet created successfully"
        )
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params;
    const {page=1, limit=10}=req.query;

    if(!userId){
        throw new ApiError("User ID is required")
    }

    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400,"Invalid User ID");
    }

    const user=await User.findById(userId);

    if(!user){
        throw new ApiError(404,"User not found");
    }

    const skip=(page-1)*limit;

    const tweets=await Tweet.find({owner:userId})
    .skip(skip)
    .limit(parseInt(limit))
    .populate("owner","fullname username avatar")
    .exec();

    const totalTweets=await Tweet.countDocuments({owner:userId})

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                totalPages:Math.ceil(totalTweets/limit),
                currentPage:parseInt(page)
            },
            "User tweets fetched successfully."
        )
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params;
    const {content}=req.body;

    if(!tweetId || !mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid or missing tweet ID")
    }

    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet not found");
    }

    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You don't have the permission to update this tweet")
    }

    if(content){
        tweet.content=content;
    }
    else{
        throw new ApiError(400,"Content is required");
    }

    await tweet.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
     const {tweetId}=req.params;

    if(!tweetId || !mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid or missing tweet ID")
    }

    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet not found");
    }

    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You don't have the permission to delete this tweet")
    }

    await tweet.remove();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}