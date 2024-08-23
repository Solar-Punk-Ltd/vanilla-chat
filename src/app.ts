import { EthAddress, EVENTS, MessageData, SwarmChat } from "swarm-decentralized-chat";
import { ethers } from "ethers";
import { NodeListElement } from "./types";
import { BatchId } from "@ethersphere/bee-js";

let privKey: string;
let ownAddress: EthAddress;
let nickname: string;
let topic: string;
let chat: SwarmChat;
const selectedNode = randomlySelectNode();
const keyName = "VANILLA_SWARM_CHAT_PRIVKEY";

// List of Bee nodes, with stamp
const nodeList: NodeListElement[] = [
    { url: "http://195.88.57.155:1633" ,  stamp: "b4fe81362508d9405e8f67f319e3feb715fb7bef7d2bf14dda046e8f9c3aafbc" as BatchId },
    { url: "http://161.97.125.121:1733" , stamp: "1f191134439c1810da0ef41f4decb176b931377f0a66f9eba41a40308a62d8c5" as BatchId },
    { url: "http://161.97.125.121:1833" , stamp: "f85df6e7a755ac09494696c94e66c8f03f2c8efbe1cb4b607e44ad6df047e8cc" as BatchId },
    { url: "http://161.97.125.121:2033" , stamp: "7093b4457e4443090cb2e8765823a601b3c0165372f8b5bf013cc0f48be4e367" as BatchId }
];

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
document.getElementById("enterChatBtn")?.addEventListener('click', async () => {
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
    nickname = (document.getElementById('nickname') as HTMLInputElement).value;
    topic = (document.getElementById('topic') as HTMLInputElement).value;

    chat = new SwarmChat({ 
        url: selectedNode.url, 
        logLevel: "info", 
        usersFeedTimeout: 10000
    });

    // Initialize the chat
    await chat.initUsers(topic, ownAddress, selectedNode.stamp);
    const { on } = chat.getChatActions();
    on(EVENTS.RECEIVE_MESSAGE, (newMessages) => {
        const messageDiv = document.getElementById("messages");
        newMessages.forEach((msg: MessageData) => {
            const messageElement = document.createElement("div");
            messageElement.textContent = `${msg.username}: ${msg.message}`;
            messageDiv?.appendChild(messageElement);
        });
    });

    document.getElementById("entryScreen")?.classList.add("hidden");
    document.getElementById("chatScreen")?.classList.remove("hidden");
});

// Handle sending messages
document.getElementById("sendBtn")?.addEventListener('click', async () => {
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
    );
    (document.getElementById("messageInput") as HTMLInputElement ).value = "";
});

function randomlySelectNode(): NodeListElement {
    const randomIndex = Math.floor(Math.random() * nodeList.length);
    return nodeList[randomIndex];
}