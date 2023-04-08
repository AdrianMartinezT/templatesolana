import React, { useEffect, useState } from "react";
import {
    Connection,
    SystemProgram,
    Transaction,
    PublicKey,
    LAMPORTS_PER_SOL,
    clusterApiUrl,
    SendTransactionError,
} from "@solana/web3.js";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";

import { useStorageUpload } from "@thirdweb-dev/react";

const SOLANA_NETWORK = "devnet";

export default function Home() {
    const router = useRouter();
    const [publicKey, setPublicKey] = useState(null);
    const [signature, setSignature] = useState(null);
    const [balance, setBalance] = useState(0);
    const [receiver, setReceiver] = useState(null);
    const [amount, setAmount] = useState(null);

    const [uploadUrl, setUploadUrl] = useState(null);
    const [url, setUrl] = useState(null);
    const [statusText, setStatusText] = useState("");

    useEffect(() => {
        let key = window.localStorage.getItem("publicKey");
        let _signature = window.localStorage.getItem("signature");

        setPublicKey(key);
        setSignature(_signature);
    }, []);

    const handleReceiverChange = (event) => {
        setReceiver(event.target.value);
    };

    const handleAmountChange = (event) => {
        setAmount(event.target.value);
    };

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        SendTransaction();
    };

    //Función para iniciar sesion con Phantom
    const signIn = async () => {
        const provider = window?.phantom?.solana;
        const { solana } = window;

        //Si Phantom no está instalado

        if (!provider?.isPhantom || !solana.isPhantom) {
            toast.error("Phantom no está instalado");
            setTimeout(() => {
                window.open("https://phantom.app/", "_blank");
            }, 2000);

            return;
        }

        //Si Phantom está instalado
        //Asignamos la conexión a la red

        let phantom;
        if (provider?.isPhantom) phantom = provider;

        const { publicKey } = await phantom.connect();
        setPublicKey(publicKey.toString());
        toast.success("Tu Wallet esta conectado 👻");
        window.localStorage.setItem("publicKey", publicKey.toString());

        getBalances(publicKey);
    };

    //Funcion para cerrar sesion con Phantom

    const signOut = async () => {
        if (window) {
            const { solana } = window;
            window.localStorage.removeItem("publicKey");
            setPublicKey(null);
            setBalance(0);
            solana.disconnect();
            router.reload(window?.location?.pathname);
        }
    };

    //Función para obtener el balance de la cuenta

    const getBalances = async (publicKey) => {
        try {
            const connection = new Connection(
                clusterApiUrl(SOLANA_NETWORK),
                "confirmed"
            );
            const balance = await connection.getBalance(
                new PublicKey(publicKey)
            );

            const balancenew = balance / LAMPORTS_PER_SOL;
            setBalance(balancenew);
        } catch (error) {
            console.error("Error al obetener balance", error);
            toast.error("No se pudo obtener el balance de la cuenta");
        }
    };

    //Función para enviar transacciones
    const SendTransaction = async () => {
        try {
            const provider = window?.phantom?.solana;

            const connectiion = new Connection(
                clusterApiUrl(SOLANA_NETWORK),
                "confirmed"
            );

            const fromPubkey = new PublicKey(publicKey);
            const toPubkey = new PublicKey(receiver);

            getBalances(publicKey);

            // Checamos que tenga saldo suficiente
            if (balance < amount) {
                toast.error("No tienes suficiente saldo");
                return;
            }

            // Creamos la transacción
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: amount * LAMPORTS_PER_SOL,
                })
            );

            const { blockhash } = await connectiion.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            const transactionsignature = await provider.signTransaction(
                transaction
            );

            const txid = await connectiion.sendRawTransaction(
                transactionsignature.serialize()
            );

            console.info(`Transaction ${txid} sent`);

            const confirmation = await connectiion.confirmTransaction(txid, {
                commitment: "confirmed",
            });

            const { slot } = confirmation.value;

            const solanaExplorerLink = `https;//explorer.solana.com/tx/${txid}?cluster=${SOLANA_NETWORK}`;
            toast.success(`Transacción enviada con éxito!`);
            setAmount(null);
            setReceiver(null);
            return solanaExplorerLink;
        } catch (error) {
            console.error("Error al enviar la transacción", error);
        }
    };

    //Función para subir archivos a IPFS

    const { mutateAsync: upload } = useStorageUpload();

    const uploadToIpfs = async (file) => {
        setStatusText("Subiendo archivo a IPFS...");
        const uploadUrl = await upload({
            data: [file],
            options: {
                uploadWithGatewayUrl: true,
                uploadWithoutDirectory: true,
            },
        });
        return uploadUrl[0];
    };

    const urlToBlob = async (file) => {
        setStatusText("Convirtiendo URL a Blob...");
        await fetch(url)
            .then((res) => res.blob())
            .then((myBlob) => {
                myBlob.name = "blob.png";
                file = new File([myBlob], "image.png", { type: myBlob.type });
            });
        const uploadUrl = await uploadToIpfs(file);

        setStatusText(`La url de tu archivo en IPFS: ${uploadUrl}`);
        return uploadUrl;
    };

    return (
        <>
            <div className="flex flex-col w-screen h-screen bg-black">
                <div className="flex flex-col py-24 place-items-center justify-center">
                    <h1 className="text-5xl font-bold text-emerald-300 pb-10">
                        Superteach Starter
                    </h1>

                    {publicKey ? (
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col py-24 place-items-center justify-center">
                                <br />
                                <h1 className="text-2xl font-bold text-white">
                                    Tu numero de wallet es : {publicKey}
                                </h1>
                                <h1 className="text-2xl font-bold text-white">
                                    Tu balance es : {balance}
                                </h1>
                                <h1 className="text-2xl font-bold text-white">
                                    Enviar una transaccion a:
                                </h1>
                                <input
                                    className=" h-8 w-72 mt-4 border-2 border-white"
                                    type="text"
                                    onChange={handleReceiverChange}
                                />
                                <h1 className="text-2xl font-bold text-white">
                                    Cantidad de SOL a enviar:
                                </h1>
                                <input
                                    className=" h-8 w-72 mt-4 border-2 border-white"
                                    type="float"
                                    onChange={handleAmountChange}
                                />
                                <br />

                                <button
                                    type="submit"
                                    className="inline-flex h-8 w-52 justify-center bg-purple-500 font-bold text-white"
                                >
                                    Enviar Transaccion
                                </button>

                                <br />
                                <input
                                    className=" h-8 w-72 mt-4 border-2 border-white"
                                    type="float"
                                    onChange={handleUrlChange}
                                />
                                <br />
                                <button
                                    className="inline-flex h-8 w-52 justify-center bg-purple-500 font-bold text-white"
                                    onClick={() => {
                                        urlToBlob();
                                    }}
                                >
                                    Subir Archivo a IPFS 🌎
                                </button>

                                <br />

                                <p className="text-2xl font-bold text-white">
                                    {statusText}
                                </p>

                                <br />

                                <div className="flex flex-col place-items-center">
                                    <button
                                        type="submit"
                                        className="inline-flex h-8 w-52 justify-center bg-purple-500 font-bold text-white"
                                        onClick={() => {
                                            signOut();
                                        }}
                                    >
                                        {" "}
                                        Desconectar tu wallet 👻
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col place-items-center justify-center">
                            <button
                                type="submit"
                                className="inline-flex h-8 w-52 justify-center bg-purple-500 font-bold text-white"
                                onClick={() => {
                                    signIn();
                                }}
                            >
                                {" "}
                                Conectar tu wallet 👻
                            </button>
                        </div>
                    )}
                </div>
                <Toaster position="bottom-center" />
            </div>
        </>
    );
}
