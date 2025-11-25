import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
    try{
        const authHeader = req.headers.authotization || req.headers.Authotization;// extraemos del header el token

        if(!authHeader ||!authHeader.starts("Bearer ")){// si no existe y no comienza con Bearer tiramos error
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];//convertimos el token a un array para separarlo del bearer

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // verificamos con verify que el token es autentico y que no este vencido usando la clave guardada en el .env
        //nos devuelve el payload en decoded con el id y email

        const user = await User.findById(decoded.id).select("-password");
        //esto para corroborar que exista el usuario, que no este eliminado ya que el token si podria ser valido pero no el usaurio
        if(!user){
            return res.status(401).json({ message: 'Invalid token: user not found' });
        }

        req.user = user;

        next();
    }catch(error){
        return res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
}