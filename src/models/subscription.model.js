import mongoose, {Schema} from "mongoose";

const subscriptionSchema= new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, //one who is subscribed
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //one whom subscriber is subscribing
        ref:"User"
    }
},{timestamps: true})

export const SUbscription = mongoose.model("Subscription", subscriptionSchema)