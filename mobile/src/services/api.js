import axios from "axios";
//libreria para guardar datos pequeños y persistentes de manera locales en el dispositivo
import asyncStorage from "@react-native-async-storage/async-storage";
import {API_URL} from "@env";

const api = axios.create({
    baseURL: API_URL
})
// Interceptor: antes de cada request agrega el Authorization con el token guardado
api.interceptors.request.use(
    async(config) =>{//config objeto de la request
        try{
            const token = await asyncStorage.getItem("accesToken");//buscamos el accessToken en el almacenamiento del celular
            if(token){
                config.headers = config.headers || {}; //si existe el headers usamos ese sino lo creamos vacio para insertarle el token
                config.headers.Authorization = `Bearer ${token}`;
            }
            
        }catch(error){
            console.warn("Error reading token from storage", err)
        }

        return config;

    },

    (error) => Promise.reject(error)//Si hay algún error al preparar la request, lo rechaza
);

export default api;