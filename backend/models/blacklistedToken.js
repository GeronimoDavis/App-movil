import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
    token: {type: String, required: true},
    expiresAt: {type: Date, required: true}//guardamos la fecha de expiro del token para que cuando pase ese tiepo mongo lo borre
})

//creo un indice con todas las fechas y mongo elimina cada documento cuando su campo expiresAt < tiempo actual del servidor.
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("BlacklistedToken", blacklistedTokenSchema);

