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
  onSnapshot,
  updateDoc,
  addDoc,
} from "firebase/firestore";

export default function App() {

  // 👤 usuário

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [usuario, setUsuario] = useState(null);

  // 👑 admin

  const adminEmail =
    "latveriagibis@gmail.com";

  // 💬 whatsapp admin

  const whatsapp =
    "5551999999999";

  // 🦸 HQs

  const [hqs, setHqs] = useState([]);

  // 🔍 imagem selecionada

  const [
    imagemSelecionada,
    setImagemSelecionada,
  ] = useState({});

  // 👑 formulário admin

  const [novaHQ, setNovaHQ] =
    useState({

      nome: "",

      descricao: "",

      editora: "",

      ano: "",

      estado: "",

      imagem: "",

      imagensExtras: "",

      lance: "",

      encerramento: "",
    });

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

  // 👑 cadastrar HQ REAL

  const cadastrarHQ =
    async () => {

      if (
        !usuario ||
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

      if (
        !novaHQ.nome ||
        !novaHQ.imagem
      ) {

        alert(
          "Preencha nome e imagem."
        );

        return;
      }

      const imagens =
        novaHQ.imagensExtras
          ? novaHQ.imagensExtras
              .split(",")
              .map((img) =>
                img.trim()
              )
          : [];

      await addDoc(
        collection(db, "hqs"),
        {

          nome:
            novaHQ.nome,

          descricao:
            novaHQ.descricao,

          editora:
            novaHQ.editora,

          ano:
            novaHQ.ano,

          estado:
            novaHQ.estado,

          imagem:
            novaHQ.imagem,

          imagens: [
            novaHQ.imagem,
            ...imagens,
          ],

          lance:
            Number(
              novaHQ.lance
            ),

          encerramento:
            novaHQ.encerramento,

          historico: [],

          vencedor: "",

          vencedorEmail: "",
        }
      );

      alert(
        "HQ cadastrada!"
      );

      setNovaHQ({

        nome: "",

        descricao: "",

        editora: "",

        ano: "",

        estado: "",

        imagem: "",

        imagensExtras: "",

        lance: "",

        encerramento: "",
      });
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

    const agora =
      new Date().getTime();

    const fim =
      new Date(
        hq.encerramento
      ).getTime();

    if (agora > fim) {

      alert(
        "Leilão encerrado."
      );

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
          new Date().toLocaleString(),
      },
    ];

    await updateDoc(ref, {

      lance:
        hq.lance + 10,

      ultimoLance:
        usuario.displayName,

      ultimoEmail:
        usuario.email,

      historico:
        novoHistorico,
    });
  };

  // 👑 definir vencedor automático

  useEffect(() => {

    const verificar =
      setInterval(() => {

        hqs.forEach(
          async (hq) => {

            const agora =
              new Date().getTime();

            const fim =
              new Date(
                hq.encerramento
              ).getTime();

            if (
              agora > fim &&
              !hq.vencedor &&
              hq.ultimoLance
            ) {

              const ref = doc(
                db,
                "hqs",
                hq.id
              );

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
      }, 5000);

    return () =>
      clearInterval(verificar);

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

📅 Encerramento:
${hq.encerramento}

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

  // ⏱️ calcular tempo restante

  const tempoRestante =
    (dataFim) => {

      const agora =
        new Date().getTime();

      const fim =
        new Date(dataFim)
          .getTime();

      const diferenca =
        fim - agora;

      if (diferenca <= 0) {
        return "Encerrado";
      }

      const dias =
        Math.floor(
          diferenca /
          (1000 * 60 * 60 * 24)
        );

      const horas =
        Math.floor(
          (
            diferenca %
            (1000 * 60 * 60 * 24)
          ) /
          (1000 * 60 * 60)
        );

      const minutos =
        Math.floor(
          (
            diferenca %
            (1000 * 60 * 60)
          ) /
          (1000 * 60)
        );

      return `${dias}d ${horas}h ${minutos}m`;
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

        <div className="admin-panel">

          <h2>
            👑 Painel Admin
          </h2>

          {/* 📤 exportar */}

          <button
            className="exportar-btn"
            onClick={
              exportarResultado
            }
          >
            📤 Exportar Resultado
          </button>

          {/* ➕ cadastrar HQ */}

          <div className="admin-card">

            <h3>
              ➕ Nova HQ
            </h3>

            <input
              type="text"
              placeholder="Nome da HQ"
              value={
                novaHQ.nome
              }
              onChange={(e) =>
                setNovaHQ({
                  ...novaHQ,
                  nome:
                    e.target.value,
                })
              }
            />

            <textarea
              placeholder="Descrição"
              value={
                novaHQ.descricao
              }
              onChange={(e) =>
                setNovaHQ({
                  ...novaHQ,
                  descricao:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Editora"
              value={
                novaHQ.editora
              }
              onChange={(e) =>
                setNovaHQ({
                  ...novaHQ,
                  editora:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Ano"
              value={
                novaHQ.ano
              }
              onChange={(e) =>
                setNovaHQ({
                  ...novaHQ,
                  ano:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Estado"
              value={
                novaHQ.estado
              }
              onChange={(e) =>
                setNovaHQ({
                  ...novaHQ,
                  estado:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="URL imagem principal"
              value={
                novaHQ.imagem
              }
              onChange={(e) =>
                setNovaHQ({
                  ...novaHQ,
                  imagem:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="URLs extras separadas por vírgula"
              value={
                novaHQ.imagensExtras
              }
              onChange={(e) =>
                setNovaHQ({
                  ...novaHQ,
                  imagensExtras:
                    e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Lance inicial"
              value={
                novaHQ.lance
              }
              onChange={(e) =>
                setNovaHQ({
                  ...novaHQ,
                  lance:
                    e.target.value,
                })
              }
            />

            <input
              type="datetime-local"
              value={
                novaHQ.encerramento
              }
              onChange={(e) =>
                setNovaHQ({
                  ...novaHQ,
                  encerramento:
                    e.target.value,
                })
              }
            />

            <button
              onClick={
                cadastrarHQ
              }
            >
              🚀 Publicar HQ
            </button>

          </div>

        </div>
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
              src={
                imagemSelecionada[hq.id]
                  || hq.imagem
              }
              alt={hq.nome}
              className="hq-img"
            />

            {/* 🖼️ galeria */}

            <div className="mini-galeria">

              {hq.imagens?.map(
                (img, index) => (

                  <img
                    key={index}
                    src={img}
                    alt="HQ"
                    className="mini-img"

                    onClick={() =>

                      setImagemSelecionada({

                        ...imagemSelecionada,

                        [hq.id]: img,
                      })
                    }
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
              💰 Lance Atual
              <br />

              R$ {hq.lance}
            </p>

            <p className="tempo">

              ⏳

              {" "}

              {
                tempoRestante(
                  hq.encerramento
                )
              }

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

            {/* 💬 whatsapp */}

            {hq.vencedor && (

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(

`Olá! Ganhei a HQ ${hq.nome} no Gibilance.`

                )}`}

                target="_blank"

                rel="noreferrer"
              >

                <button
                  className="whats-btn"
                >
                  💬 Falar no WhatsApp
                </button>

              </a>
            )}

            <button
              onClick={() =>
                darLance(hq)
              }
            >
              💰 Dar lance +10
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}




