import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { getToken } from "../src/storage/authStorage";


export default function Index() {
 const [isLogged, setIsLogged] = useState<boolean | null>(null); //toma valores bool o null y lo iniciamos como null

 useEffect(() => {
  const checkSession = async () =>{
    const token = await getToken(); //usamos la funcion de authStorage para tomar el token y verificar que existe 
    setIsLogged(!!token) //guarda true o false

  };
  checkSession();
 },[]);

 if(isLogged === null) return null;

  if(!isLogged){
    return <Redirect href="/login" />;
  }
  
  
  return <Redirect href="/home" />;
}
