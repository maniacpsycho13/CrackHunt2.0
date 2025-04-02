import express from 'express'
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
const app=express();

const PORT=5000;
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors(
    {
        origin:['https://crack-hunt2-0-zeta.vercel.app','http://localhost:3000','https://crack-hunt2-0-beta.vercel.app'],
        methods:['GET','POST','PUT','DELETE'],
        credentials:true,
        exposedHeaders:['set-cookie']
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