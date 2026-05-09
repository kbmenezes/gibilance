// Importa o núcleo do Firebase
import { initializeApp } from "firebase/app";

// Importa autenticação
import { getAuth } from "firebase/auth";

// Configuração do seu projeto (a que você me mandou)
const firebaseConfig = {
  apiKey: "AIzaSyBZvhdDJ2QYRwD-W13jL1qYw3qYr__PZVg",
  authDomain: "gibilance.firebaseapp.com",
  projectId: "gibilance",
  storageBucket: "gibilance.firebasestorage.app",
  messagingSenderId: "940783638232",
  appId: "1:940783638232:web:3089e56df2b9d68f2da9ad"
};

// Inicializa o app
const app = initializeApp(firebaseConfig);

// Inicializa autenticação
export const auth = getAuth(app);