import express from "express" 
import mongoos from "mongoose"
import dotenv from "dotenv"

dotenv.config()


const app =express ()
app.listen(3000,() =>{
    console.log("server is running on port 3000");
})