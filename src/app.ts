import { EthAddress, EVENTS, MessageData, SwarmChat } from "swarm-decentralized-chat";
import { ethers } from "ethers";
import { Diagnostics, NodeListElement } from "./types";
import { addMessage, addToLastThirty, displayDiagnostics, randomlySelectNode } from './utils';
import { BatchId } from "@ethersphere/bee-js";

let privKey: string;
let ownAddress: EthAddress;
let nickname: string;
let topic: string;
let chat: SwarmChat;
const keyName = "VANILLA_SWARM_CHAT_PRIVKEY";
let diagnostics: Diagnostics | null = null;
let diagnosticClock;
let lastThiry: string[];

// List of Bee nodes, with stamp
const nodeList: NodeListElement[] = [
    { url: "http://195.88.57.155:1633" ,  stamp: "dc619251ae6d934cf5911c183656c44e4ee522f6f307013aff84d732168b5989" as BatchId },
    //{ url: "http://161.97.125.121:1733" , stamp: "1f191134439c1810da0ef41f4decb176b931377f0a66f9eba41a40308a62d8c5" as BatchId },
    //{ url: "http://161.97.125.121:1833" , stamp: "f85df6e7a755ac09494696c94e66c8f03f2c8efbe1cb4b607e44ad6df047e8cc" as BatchId },
    //{ url: "http://161.97.125.121:2033" , stamp: "7093b4457e4443090cb2e8765823a601b3c0165372f8b5bf013cc0f48be4e367" as BatchId }
];

const selectedNode = randomlySelectNode(nodeList);

chat = new SwarmChat({ 
    url: selectedNode.url, 
    logLevel: "info", 
    usersFeedTimeout: 10000
});

// Check is the user has a private key in localStorage
window.onload = function() {
    const lsReadResult = localStorage.getItem(keyName);
    if (lsReadResult === null) {
      document.getElementById("keypairPopup")?.classList.remove("hidden"); 
    } else {
        privKey = lsReadResult;
        const wallet = new ethers.Wallet(privKey);
        ownAddress = wallet.address as unknown as EthAddress;
        document.getElementById("entryScreen")?.classList.remove("hidden");
    }
};

// Handle keypair generation
document.getElementById("keypairPopup")?.addEventListener('click', async () => {
    const keyPair = ethers.Wallet.createRandom();
    privKey = keyPair.privateKey;
    ownAddress = keyPair.address as unknown as EthAddress;
    localStorage.setItem(keyName, privKey);

    alert("Keypair generated and saved!")
    document.getElementById("keypairPopup")?.classList.add("hidden");
    document.getElementById("entryScreen")?.classList.remove("hidden");    
});

// Handle entering the chat room
document.getElementById("enterChatBtn")?.addEventListener('click', async () => {
    try {
        document.getElementById("loadingOverlay")?.classList.remove("hidden");

        nickname = (document.getElementById('nickname') as HTMLInputElement).value;
        topic = (document.getElementById('topic') as HTMLInputElement).value;

        // Start polling messages & the Users feed
        chat.startMessageFetchProcess(topic);
        chat.startUserFetchProcess(topic);

        // Get diagnostic data from SwarmChat instance
        diagnosticClock = setInterval(() => {
            diagnostics = chat.getDiagnostics() as Diagnostics;
            displayDiagnostics(diagnostics);
        }, 3000);

        // Load users (first time when entering app)
        await chat.initUsers(topic, ownAddress, selectedNode.stamp)
            .then(() => console.info(`initUsers was successful`))
            .catch((err) => console.error(`initUsers error: ${err.error}`));

        // Connect to chat
        await chat.registerUser(topic, { participant: ownAddress, key: privKey, stamp: selectedNode.stamp, nickName: nickname })
            .then(() => console.info(`user registered.`))
            .catch((err) => console.error(`registerUser error ${err.error}`));

        // Events
        const { on } = chat.getChatActions();
        on(EVENTS.RECEIVE_MESSAGE, (newMessages) => {
            newMessages.forEach((msg: MessageData) => {
                console.debug(`New message: ${msg.message}`);
                
                const id = `${msg.address}${msg.timestamp}`;
                if (lastThiry.includes(id)) { console.log("return;"); return;}
                else {
                    addMessage(msg.username, msg.message, msg.address === ownAddress);
                    lastThiry = addToLastThirty(lastThiry, id);
                }

            });
        });

        document.getElementById("entryScreen")?.classList.add("hidden");
        document.getElementById("chatScreen")?.classList.remove("hidden");

    } catch (err) {
        console.error(`Error entering chat: ${(err as unknown as Error).message}`);
    } finally {
        document.getElementById("loadingOverlay")?.classList.add("hidden");
    }    
});

// Handle init
document.getElementById('initBtn')?.addEventListener('click', async () => {
    topic = (document.getElementById('topic') as HTMLInputElement).value;
    chat.initChatRoom(topic, selectedNode.stamp)
        .then((res) => alert("Chat room created!"))
        .catch((err) => alert("Could not create chat room!"));
});

// Handle sending messages
document.getElementById('messageInput')?.addEventListener('keypress', (key: KeyboardEvent) => {
    if (key.code === 'Enter') sendMessage();
});
document.getElementById("sendBtn")?.addEventListener('click', sendMessage);

// Send message that is on messageInput
async function sendMessage() {
    const messageText = (document.getElementById("messageInput") as HTMLInputElement).value;

    const messageObj: MessageData = {
        message: messageText,
        username: nickname,
        address: ownAddress,
        timestamp: Date.now()
    };

    await chat.sendMessage(
        ownAddress,
        topic,
        messageObj,
        selectedNode.stamp,
        privKey,
    )
    .then((res) => console.info(`Message sent ${res}`))
    .catch((err) => console.error(`Error sending message ${err.error}`));

    (document.getElementById("messageInput") as HTMLInputElement ).value = "";
}