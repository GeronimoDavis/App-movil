import User from "../models/user.js";
import bcrypt from "bcrypt";

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
        res.status(500).json({message: "Server error", error: error.message})
    }
}

