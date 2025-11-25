import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        userName:{
            type: String,
            required: true,
            unique: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        password:{
            type: String,
            required: true,
        },
        createdAt:{
            type: Date,
            default: Date.now,
        },
        refreshToken:{type: String, default: null}
    }, {
        timestamps: true //esto para tener un registro de cuando se creeo y se actualizo el documento
    }
)

export default mongoose.model("User", userSchema);