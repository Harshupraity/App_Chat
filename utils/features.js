import mongoose from "mongoose";
import jwt from "jsonwebtoken";
// import { JsonWebTokenError } from "jsonwebtoken";
const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const connectDB = (uri) => {
  mongoose
    .connect(uri, { dbName: "Inst@Book" })
    .then((data) => {
      console.log(`Connected to DB: ${data.connection.host}`);
    })
    .catch((err) => {
      // console.error("Connection to database failed:", err);
      throw err;
    });
};

const sendToken = (res, user, code, message) => {
   
  const token = jwt.sign({_id:user.id},process.env.JWT_SECRET);

  return res.status(code).cookie("Inst@Book-token", token, cookieOptions).json({
    success: true,
    message
    
     
  });
    
};

const emitEvent = (req,event,users,data) =>{
console.log("Emmiting event",event);
}

const deleteFilesFromCloudinary = async(public_ids)=>{

}
export { connectDB,sendToken,cookieOptions,emitEvent,deleteFilesFromCloudinary};
