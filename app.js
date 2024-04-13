import express from "express"

import { connectDB } from "./utils/features.js";
import dotenv from 'dotenv'
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import {createServer} from "http"

import userRoute from "./routes/user.js"
import chatRoute from "./routes/chat.js"
import { createUser } from "./seeders/user.js";
import { createGroupChats, createMessagesInAChat, createSingleChats } from "./seeders/chat.js";
import adminRoute from "./routes/admin.js"
import { log } from "console";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT, NEW_REQUEST } from "./constants/event.js";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
dotenv.config({
    path:"./.env"
})

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
connectDB(mongoURI);



// createUser(2)
const app = express();

const server = createServer(app)
const io = new Server(server,{})

app.set("io",io)
 const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
 const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsasdsdfsdfsdfd";

 const userSocketIDs=new Map();

//---temprary using middleware--//
app.use(express.json());
app.use(cookieParser());


//----//
app.use("/user",userRoute);
app.use("/chat",chatRoute);
app.use("/admin",adminRoute)

app.get("/",(req,res)=>{
    res.send("Hello World")
})

io.use((socket, next) => {
    // cookieParser()(
    //   socket.request,
    //   socket.request.res,
    //   async (err) => await socketAuthenticator(err, socket, next)
    // );
  });

io.on("connection",(socket)=>{
const user = {
    _id:"adf",
    name:"okh"
};
    userSocketIDs.set(user._id.toString(),socket.id);
    console.log(userSocketIDs)

    socket.on(NEW_MESSAGE,async({chatId,members,message})=>{

        const messageForRealTime = {
            content:message,
            _id:uuid(),
            sender:{
                _id:user._id,
                name:user.name,
            },
            chat:chatId,
            createdAt:new Date().toISOString(),
        };
        const messageForDB = {
            content:message,
            sender:user._id,
            chat:chatId,
        }

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(NEW_MESSAGE, {
          chatId,
          message: messageForRealTime,
        });
        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

        try {
            await Message.create(messageForDB);
          } catch (error) {
            throw new Error(error);
          }
    })

    socket.on("disconnect",()=>{
        console.log("a user disconnected");
        userSocketIDs.delete(user._id.toString()); 
    })
})

app.use(errorMiddleware)
server.listen(port,()=>{
    console.log(`Server is running on port ${port} in ${envMode} Mode`);
})

export{
    adminSecretKey,
    envMode,
    userSocketIDs
}