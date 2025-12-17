import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import habitRoutes from './routes/habitRoutes.js';
import userRouter from "./routes/userRoutes.js";

dotenv.config();//cargar variables de entorno desde el archivo .env


const app = express();//instancia de express
app.use(express.json());//para parsear el body de las solicitudes como json

app.use(cors({
    origin: true,//frontend permitido
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200
}));//habilitar cors para permitir solicitudes desde otros dominios

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend activo" });
});

app.use('/api/habits', habitRoutes);//definimos la ruta base para las rutas de habitos
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5000;//puerto del servidor

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});