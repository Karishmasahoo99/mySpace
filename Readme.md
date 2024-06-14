MERN project

If we want to pass empty folder in git, we have to use .gitkeep.

import express from "express";
const app=express();

;(
    async()=>{
        try{
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.on("error", (error)=>{
                console.log("Error while connecting to database. ERR:", error)
                throw error
            })

            app.listen(process.env.PORT, ()=>{
                console.log("App is running in port ",process.env.PORT)
            })
        }catch(err){
            console.error("ERROR:", err);
            throw err
        }
    }
)()

This is basic code which is messy and hence we have db folder, app folders and others.

In express, we mainly deal with request and response. Two main things in request is req.params and req.body.

Earlier we needed bodyParser package but nowadays it is by default included in express

We can extend the Error class and define our errors

Responses and status code:
Informational responses: 100-199
Successful responses: 200-299
Redirection responses: 300-399
Client error responses: 400-499
Server error responses: 500-599

The actual power of mongoose comes from npm library: mongoose-aggregrate-paginate-v2

Suppose we want to encrypt password before saving it.
userSchema.pre("save", callback function)

Don't use arrow function here in callback function because arrow function does not have access to this operator.