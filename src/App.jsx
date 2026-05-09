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
} from "firebase/firestore";

export default function App() {
  // 👤 usuário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [usuario, setUsuario] = useState(null);

  // 🦸 HQs
  const [hqs, setHqs] = useState([]);

  // 🔐 monitorar login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUsuario(user);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🔥 carregar HQs em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "hqs"),
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHqs(lista);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🚀 criar HQs iniciais
  const criarHqs = async () => {
    const dados = [
      {
        id: "1",
        nome: "Homem-Aranha #1",
        lance: 50,
        tempo: 60,
        historico: [],
        vencedor: "",
      },
      {
        id: "2",
        nome: "Batman: Ano Um",
        lance: 80,
        tempo: 60,
        historico: [],
        vencedor: "",
      },
      {
        id: "3",
        nome: "X-Men Clássico",
        lance: 60,
        tempo: 60,
        historico: [],
        vencedor: "",
      },
    ];

    for (const hq of dados) {
      await setDoc(doc(db, "hqs", hq.id), hq);
    }

    alert("HQs criadas!");
  };

  // 💰 dar lance
  const darLance = async (hq) => {
    if (!usuario) {
      alert(
        "Faça login para participar."
      );
      return;
    }

    if (hq.tempo <= 0) {
      return;
    }

    const ref = doc(db, "hqs", hq.id);

    const historicoAtual =
      hq.historico || [];

    const novoHistorico = [
      ...historicoAtual,
      {
        usuario:
          usuario.displayName,
        valor: hq.lance + 10,
        horario:
          new Date().toLocaleTimeString(),
      },
    ];

    await updateDoc(ref, {
      lance: hq.lance + 10,
      tempo: 60,
      ultimoLance:
        usuario.displayName,
      historico: novoHistorico,
    });
  };

  // ⏱️ cronômetro
  useEffect(() => {
    const timer = setInterval(() => {
      hqs.forEach(async (hq) => {
        const ref = doc(
          db,
          "hqs",
          hq.id
        );

        // ⏱️ diminuir tempo
        if (hq.tempo > 0) {
          await updateDoc(ref, {
            tempo: hq.tempo - 1,
          });
        }

        // 👑 definir vencedor
        if (
          hq.tempo === 1 &&
          hq.ultimoLance &&
          !hq.vencedor
        ) {
          await updateDoc(ref, {
            vencedor:
              hq.ultimoLance,
          });
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hqs]);

  // 📝 cadastro
  const cadastrar = async () => {
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
          displayName: nome,
        }
      );

      await auth.currentUser.reload();

      setUsuario(auth.currentUser);

      alert(
        "Conta criada com sucesso!"
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

      alert("Login realizado!");
    } catch (error) {
      alert(
        "E-mail ou senha inválidos."
      );
    }
  };

  // 🚪 logout
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className="container">
      <h1>🦸‍♂️ Gibilance</h1>

      <p className="subtitulo">
        Plataforma de leilão de HQs
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

            <button onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Seu primeiro nome"
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
            />

            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
            />

            <div className="botoes-auth">
              <button onClick={login}>
                Entrar
              </button>

              <button onClick={cadastrar}>
                Cadastrar
              </button>
            </div>
          </>
        )}
      </div>

      {/* 🚀 botão criar HQs */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        <button
          onClick={criarHqs}
        >
          Criar HQs no Firebase
        </button>
      </div>

      {/* 🦸 HQs */}
      <div className="lista">
        {hqs.map((hq) => (
          <div
            key={hq.id}
            className="card"
          >
            <h2>{hq.nome}</h2>

            <p className="valor">
              💰 Lance atual:
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
                ? `${hq.tempo}s restantes`
                : "Leilão encerrado"}
            </p>

            {hq.ultimoLance && (
              <p>
                🔥 Último lance:
                <br />
                <strong>
                  {
                    hq.ultimoLance
                  }
                </strong>
              </p>
            )}

            {/* 👑 vencedor */}
            {hq.vencedor && (
              <div
                className="vencedor"
              >
                👑 Vencedor:
                <br />

                <strong>
                  {
                    hq.vencedor
                  }
                </strong>

                <br />

                💰 R$ {hq.lance}
              </div>
            )}

            {/* 🧾 histórico */}
            {hq.historico &&
              hq.historico.length >
                0 && (
                <div className="historico">
                  <h4>
                    🧾 Histórico
                  </h4>

                  {hq.historico
                    .slice()
                    .reverse()
                    .map(
                      (
                        lance,
                        index
                      ) => (
                        <p
                          key={
                            index
                          }
                        >
                          🔥{" "}
                          <strong>
                            {
                              lance.usuario
                            }
                          </strong>
                          : R${" "}
                          {
                            lance.valor
                          }

                          <br />

                          <small>
                            {
                              lance.horario
                            }
                          </small>
                        </p>
                      )
                    )}
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