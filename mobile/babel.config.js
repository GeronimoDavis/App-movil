module.exports = function(api) {
  api.cache(true);//almacena resultados en cache
  return {
    presets: ['babel-preset-expo'],
    //esto para agregar funcionalidades extras como poder usar variables desde un archivo .env
    plugins: [
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
      }]
    ]
  };
};