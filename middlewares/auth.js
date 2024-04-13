import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
import jwt from "jsonwebtoken";
import { adminSecretKey } from "../app.js";

const isAuthenticated = TryCatch(async(req,res,next)=>{
    const token = req.cookies["Inst@Book-token"];
    if(!token) return next(new ErrorHandler("please login to access this route",401))


    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

    req.user = decodedData._id;
    
    next();

})

const adminOnly = (req, res, next) => {
    const token = req.cookies["Inst@Book-admin-token"];
  
    if (!token)
      return next(new ErrorHandler("Only Admin can access this route", 401));
  
    const secretKey = jwt.verify(token, process.env.JWT_SECRET);
  
    const isMatched = secretKey === adminSecretKey;
  
    if (!isMatched)
      return next(new ErrorHandler("Only Admin can access this route", 401));
  
    next();
  };
export {isAuthenticated,adminOnly}