import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


export const userRegister = async (req, res) => {
    //para validar el email
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    try{
        const {userName, email, password} = req.body;

        if(!userName || !email || !password){
            return res.status(400).json({ message: "All fields are required.", error: "All fields are required." });
        }

        if(!regex.test(email)){
            res.status(400).json({ message: "invalid email" })
        }

        //verifico si existe el email
        const existEmail = await User.findOne({email});

        if(existEmail){
            return res.status(409).json({message: "This email address is already registered with another account."})
        }
        //encripto la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordEncrypted = await bcrypt.hash(password, salt);

        const newUser = new User({
            userName,
            email,
            password: passwordEncrypted
        })

        await newUser.save();

        res.status(201).json({ message: "Successfully registered user",
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email
            }})

    }catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
}

export const userLogin = async (req, res) =>{
    try{
        const {email, password} = req.body;

        const existUser = await User.findOne({email});
        if(!existUser){
            return res.status(401).json({message:"Incorrect credentials"});
        }

        //comparo la clave con la de la bases de datos
        const validatePassword = await bcrypt.compare(password, existUser.password);
        if(!validatePassword){
            return res.status(401).json({message:"Incorrect credentials"});
        }

        const payload = {
            id: existUser._id,
            email: existUser.email
        };
        //creamos el accessToken 
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN || "1h"});

        //creamos el refeshToken
        const refreshToken = jwt.sign(payload, 
            process.env.JWT_REFRESH_SECRET,
            {expiresIn: "1d"}
        );

        // Guardamos el refresh en la BD
        existUser.refreshToken = refreshToken;
        await existUser.save();

        return res.status(200).json({message: "Login successful", 
            accessToken,
            refreshToken, 
            user: {
                id: existUser._id,
                userName: existUser.userName,
                email: existUser.email
            }
        });


    }catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
}

export const refreshToken = async (req, res) =>{
    try{
        const {refreshToken} = req.body;
        if(!refreshToken){
            return res.status(401).json({ message: "Refresh token required" })
        }

        //con esto nos aseguramos que pertenece a un usuario y que no fue borrado por logout
        const user = await User.findOne({refreshToken});

        //y si no existe usuario con ese refreshToken tiramos error:
        if(!user){
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET,
            {expiresIn: "1h"}
        );
        
        return res.status(200).json({accessToken: newAccessToken})
    }catch{
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

