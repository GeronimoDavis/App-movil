import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import blackListedToken from "../models/blackListedToken.js";
import user from "../models/user.js";


export const userRegister = async (req, res) => {
    //para validar el email
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    try{
        const {userName, email, password} = req.body;

        if(!userName || typeof userName !== "string" ||userName.trim().length < 3){
            return res.status(400).json({error: "userName must have at least 3 characters"})
        }

        if(userName.trim().length > 30){
            return res.status(400).json({ error: "userName is too long (max 30 characters)." });
        }
       
        if(!email || !regex.test(email)){
            res.status(400).json({ message: "invalid email" })
        }

        if(!password || typeof password !== "string", password.trim().length < 6){
            return res.status(400).json({error: "Password must have at least 6 characters"})
        }

        if(password.length > 50){
            return res.status(400).json({ error: "Password is too long (max 50 characters)" });
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
        try{
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        }catch (err) {
            // Si el refresh token expiró o es inválido, lo eliminamos por seguridad
            user.refreshToken = null;
            await user.save();
            return res.status(403).json({ message: "Expired or invalid refresh token" });
        }
        

        const payload = { id: user._id, email: user.email };
        const newAccessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );
        
        return res.status(200).json({accessToken: newAccessToken})
    }catch{
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const logout = async (req, res) =>{
    try{
        //sacar token del header (si existe)
        const authHeader = req.headers.authorization;

        //si no existe el token no falla el sistema sino que le invalidamos el refreshToken y al no tener accessToken se obliga a logearse
        const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

       let expiresAt = null;

       if(token){
            const decodedUnsafe = jwt.decode(token); //si el nos devuelve el payload, o null si el token está mal formado.

            if(decodedUnsafe && decodedUnsafe.exp){//validamos que no sea null y que tenga el campo exp el token
                expiresAt = new Date(decodedUnsafe.exp * 1000)//multiplicamos por 1000 porque el exp viene en segundos y js trabaja con milisegundos 
            }else{
                expiresAt = new Date(Date.now() + 60 * 60 * 1000);//si no obtenemos el tiempo en el que expira le damos una hora 
            }

            try{
                await blackListedToken.updateOne(// usamos el update para que se actualice el token en la lista negra o se cree en caso de que no exista y no usamos create para evitar errores
                    {token},//usamos esto de referencia para buscar el token que coincida con este
                    {$set: {token, expiresAt}},//si lo encuentra actualiza los campos
                    {upsert: true}//esto dice que si no encuentra el token lo cree
                )

            }catch(error){
                console.error("Error al guardar token en blacklist:", err);//registramos el error para no darle un mendaje de no se pudo cerrar sesion
            }
        }

        //invalidamos el refreshToken
        const {refreshToken} = req.body;
        if(refreshToken){
            const user = await User.findOne({refreshToken});
            if(user){
                user.refreshToken = null;
                await user.save();
            }
        }

        return res.status(200).json({ message: "Logout successful" });

    }catch(error){
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
    
}