// src/App.jsx

import { useEffect, useState } from "react";

import "./style.css";

import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// 🖼️ imagens

import spiderman from "./assets/spiderman.jpg";
import spiderman2 from "./assets/spiderman2.jpg";
import spiderman3 from "./assets/spiderman3.jpg";

import batman from "./assets/batman.jpg";
import batman2 from "./assets/batman2.jpg";
import batman3 from "./assets/batman3.jpg";

import xmen from "./assets/xmen.jpg";
import xmen2 from "./assets/xmen2.jpg";
import xmen3 from "./assets/xmen3.jpg";

export default function App() {

  // 👤 usuário

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [usuario, setUsuario] = useState(null);

  // 👑 admin

  const adminEmail =
    "latveriagibis@gmail.com";

  // 🦸 HQs

  const [hqs, setHqs] = useState([]);

  // 🔐 monitor login

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setUsuario(user);
        }
      );

    return () => unsubscribe();

  }, []);

  // 🔥 realtime firestore

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(db, "hqs"),
        (snapshot) => {

          const lista =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setHqs(lista);

        }
      );

    return () => unsubscribe();

  }, []);

  // 👑 criar HQs

  const criarHqs = async () => {

    if (
      !usuario ||
      !usuario.email ||
      usuario.email
        .trim()
        .toLowerCase() !==
        adminEmail.toLowerCase()
    ) {

      alert(
        "Apenas admin."
      );

      return;
    }

    const dados = [

      // 🕷️ Homem-Aranha

      {
        id: "1",

        nome:
          "Homem-Aranha #1",

        imagem:
          spiderman,

        imagens: [
          spiderman,
          spiderman2,
          spiderman3,
        ],

        descricao:
          "HQ clássica do Homem-Aranha em excelente estado. Edição muito procurada por colecionadores.",

        editora:
          "Abril",

        ano:
          "1994",

        estado:
          "Muito bom",

        lance: 50,

        tempo: 60,

        historico: [],

        vencedor: "",

        vencedorEmail: "",
      },

      // 🦇 Batman

      {
        id: "2",

        nome:
          "Batman: Ano Um",

        imagem:
          batman,

        imagens: [
          batman,
          batman2,
          batman3,
        ],

        descricao:
          "Clássico absoluto do Batman escrito por Frank Miller.",

        editora:
          "DC",

        ano:
          "1987",

        estado:
          "Excelente",

        lance: 80,

        tempo: 60,

        historico: [],

        vencedor: "",

        vencedorEmail: "",
      },

      // ❌ X-Men

      {
        id: "3",

        nome:
          "X-Men Clássico",

        imagem:
          xmen,

        imagens: [
          xmen,
          xmen2,
          xmen3,
        ],

        descricao:
          "Edição clássica dos mutantes mais famosos da Marvel.",

        editora:
          "Abril",

        ano:
          "1996",

        estado:
          "Bom",

        lance: 60,

        tempo: 60,

        historico: [],

        vencedor: "",

        vencedorEmail: "",
      },
    ];

    for (const hq of dados) {

      await setDoc(
        doc(db, "hqs", hq.id),
        hq
      );
    }

    alert(
      "HQs criadas!"
    );
  };

  // 💰 lance

  const darLance = async (
    hq
  ) => {

    if (!usuario) {

      alert(
        "Faça login."
      );

      return;
    }

    if (hq.tempo <= 0) {
      return;
    }

    const ref = doc(
      db,
      "hqs",
      hq.id
    );

    const historicoAtual =
      hq.historico || [];

    const novoHistorico = [

      ...historicoAtual,

      {
        usuario:
          usuario.displayName,

        email:
          usuario.email,

        valor:
          hq.lance + 10,

        horario:
          new Date().toLocaleTimeString(),

        timestamp:
          Date.now(),
      },
    ];

    await updateDoc(ref, {

      lance:
        hq.lance + 10,

      // ⏰ anti-sniper

      tempo:
        hq.tempo <= 10
          ? 15
          : hq.tempo,

      ultimoLance:
        usuario.displayName,

      ultimoEmail:
        usuario.email,

      historico:
        novoHistorico,

      atualizadoEm:
        serverTimestamp(),
    });
  };

  // ⏱️ cronômetro

  useEffect(() => {

    const timer =
      setInterval(() => {

        hqs.forEach(
          async (hq) => {

            const ref = doc(
              db,
              "hqs",
              hq.id
            );

            // diminuir tempo

            if (hq.tempo > 0) {

              await updateDoc(
                ref,
                {
                  tempo:
                    hq.tempo - 1,
                }
              );
            }

            // 👑 vencedor

            if (
              hq.tempo === 1 &&
              hq.ultimoLance &&
              !hq.vencedor
            ) {

              await updateDoc(
                ref,
                {
                  vencedor:
                    hq.ultimoLance,

                  vencedorEmail:
                    hq.ultimoEmail,
                }
              );
            }
          }
        );
      }, 1000);

    return () =>
      clearInterval(timer);

  }, [hqs]);

  // 📝 cadastro

  const cadastrar =
    async () => {

      try {

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            senha
          );

        await updateProfile(
          userCredential.user,
          {
            displayName:
              nome,
          }
        );

        await auth.currentUser.reload();

        setUsuario(
          auth.currentUser
        );

        alert(
          "Conta criada!"
        );

      } catch (error) {

        alert(error.message);
      }
    };

  // 🔑 login

  const login = async () => {

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      alert(
        "Login OK!"
      );

    } catch {

      alert(
        "Erro login."
      );
    }
  };

  // 🚪 logout

  const logout = async () => {
    await signOut(auth);
  };

  // 📤 exportar resultado

  const exportarResultado =
    () => {

      let texto =
`🏆 RESULTADO GIBILANCE

`;

      hqs.forEach((hq) => {

        texto +=
`📚 ${hq.nome}

👑 ${hq.vencedor || "Sem vencedor"}

📧 ${hq.vencedorEmail || "-"}

💰 R$ ${hq.lance}

🧾 ${
  hq.historico
    ? hq.historico.length
    : 0
} lances

-------------------

`;
      });

      navigator.clipboard.writeText(
        texto
      );

      alert(
        "Resultado copiado!"
      );
    };

  return (

    <div className="container">

      <h1>
        🦸‍♂️ Gibilance
      </h1>

      <p className="subtitulo">
        Plataforma de leilão
        de HQs
      </p>

      {/* 🔐 LOGIN */}

      <div className="auth-box">

        {usuario ? (

          <>

            <p>
              👤 Logado como:
            </p>

            <h3>
              {
                usuario.displayName
              }
            </h3>

            <small>
              {usuario.email}
            </small>

            {/* 👑 admin */}

            {usuario.email
              .trim()
              .toLowerCase() ===
              adminEmail.toLowerCase() && (

              <p
                style={{
                  color:
                    "#facc15",

                  fontWeight:
                    "bold",

                  marginTop: 10,
                }}
              >
                👑 ADMIN
              </p>
            )}

            <button
              onClick={logout}
            >
              Sair
            </button>

          </>

        ) : (

          <>

            <input
              type="text"
              placeholder="Primeiro nome"
              value={nome}
              onChange={(e) =>
                setNome(
                  e.target.value
                )
              }
            />

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) =>
                setSenha(
                  e.target.value
                )
              }
            />

            <div className="botoes-auth">

              <button
                onClick={login}
              >
                Entrar
              </button>

              <button
                onClick={
                  cadastrar
                }
              >
                Criar conta
              </button>

            </div>

          </>
        )}
      </div>

      {/* 👑 ADMIN */}

      {usuario &&
       usuario.email
         .trim()
         .toLowerCase() ===
       adminEmail.toLowerCase() && (

        <>

          <div
            style={{
              textAlign:
                "center",

              marginBottom:
                20,
            }}
          >

            <button
              onClick={
                criarHqs
              }
            >
              👑 Criar HQs
            </button>

          </div>

          {/* 👑 painel */}

          <div className="admin-panel">

            <h2>
              👑 Painel Administrativo
            </h2>

            <button
              className="exportar-btn"
              onClick={
                exportarResultado
              }
            >
              📤 Exportar Resultado
            </button>

            {hqs.map((hq) => (

              <div
                key={hq.id}
                className="admin-card"
              >

                <h3>
                  {hq.nome}
                </h3>

                <p>
                  💰 Valor:
                  <br />

                  <strong>
                    R$ {hq.lance}
                  </strong>
                </p>

                <p>
                  👑 Vencedor:
                  <br />

                  <strong>
                    {hq.vencedor ||
                     "Em andamento"}
                  </strong>
                </p>

                <p>
                  📧
                  {hq.vencedorEmail || "-"}
                </p>

                <p>
                  🧾 Lances:
                  {" "}
                  {hq.historico
                    ? hq.historico.length
                    : 0}
                </p>

              </div>
            ))}
          </div>

        </>
      )}

      {/* 🦸 HQs */}

      <div className="lista">

        {hqs.map((hq) => (

          <div
            key={hq.id}
            className="card"
          >

            {/* 🖼️ imagem principal */}

            <img
              src={hq.imagem}
              alt={hq.nome}
              className="hq-img"
            />

            {/* 🖼️ mini galeria */}

            <div className="mini-galeria">

              {hq.imagens?.map(
                (img, index) => (

                  <img
                    key={index}
                    src={img}
                    alt="HQ"
                    className="mini-img"
                  />
                )
              )}

            </div>

            <h2>
              {hq.nome}
            </h2>

            {/* 📚 descrição */}

            <div className="descricao">

              <p>
                📚 {hq.descricao}
              </p>

              <p>
                🏢 Editora:
                {" "}
                {hq.editora}
              </p>

              <p>
                📅 Ano:
                {" "}
                {hq.ano}
              </p>

              <p>
                ⭐ Estado:
                {" "}
                {hq.estado}
              </p>

            </div>

            <p className="valor">
              💰 Lance:
              <br />

              R$ {hq.lance}
            </p>

            <p
              className={`tempo ${
                hq.tempo <= 10
                  ? "urgente"
                  : ""
              }`}
            >
              ⏱️{" "}

              {hq.tempo > 0
                ? `${hq.tempo}s`
                : "Encerrado"}
            </p>

            {hq.ultimoLance && (

              <p>
                🔥 Último:
                <br />

                <strong>
                  {
                    hq.ultimoLance
                  }
                </strong>
              </p>
            )}

            {hq.vencedor && (

              <div className="vencedor">

                👑 Vencedor:
                <br />

                <strong>
                  {
                    hq.vencedor
                  }
                </strong>

              </div>
            )}

            <button
              onClick={() =>
                darLance(hq)
              }
              disabled={
                hq.tempo === 0
              }
            >
              {hq.tempo > 0
                ? "Dar lance +10"
                : "Encerrado"}
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}