import express from 'express'
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cookieParser from "cookie-parser";
const app=express();
app.use(cookieParser());

const PORT=5000;
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors(
    {
          
        origin:['https://crack-hunt2-0-zeta.vercel.app','http://localhost:3000','https://crack-hunt2-0-beta.vercel.app',"https://crack-hunt2-0-one.vercel.app","https://crack-hunt2-0-seven.vercel.app","https://crack-hunt2-0-git-aryan-aryans-projects-2cd87065.vercel.app"],
        methods:['GET','POST','PUT','DELETE'],
        credentials:true,
        exposedHeaders:['set-cookie','authorization'],
        allowedHeaders:['Content-Type','Authorization'],

    }
));
app.use(express.static('public'));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
// app.use('/api/leaderboard', leaderboardRoutes);
app.get('/',(req,res)=>{
    res.json({
        message:"Hello from the server"
    })
})
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})  