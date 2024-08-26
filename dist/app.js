var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c;
import { EVENTS, SwarmChat } from "swarm-decentralized-chat";
import { ethers } from "ethers";
let privKey;
let ownAddress;
let nickname;
let topic;
let chat;
const selectedNode = randomlySelectNode();
const keyName = "VANILLA_SWARM_CHAT_PRIVKEY";
// List of Bee nodes, with stamp
const nodeList = [
    { url: "http://195.88.57.155:1633", stamp: "b4fe81362508d9405e8f67f319e3feb715fb7bef7d2bf14dda046e8f9c3aafbc" },
    { url: "http://161.97.125.121:1733", stamp: "1f191134439c1810da0ef41f4decb176b931377f0a66f9eba41a40308a62d8c5" },
    { url: "http://161.97.125.121:1833", stamp: "f85df6e7a755ac09494696c94e66c8f03f2c8efbe1cb4b607e44ad6df047e8cc" },
    { url: "http://161.97.125.121:2033", stamp: "7093b4457e4443090cb2e8765823a601b3c0165372f8b5bf013cc0f48be4e367" }
];
// Check is the user has a private key in localStorage
window.onload = function () {
    var _a, _b;
    const lsReadResult = localStorage.getItem(keyName);
    if (lsReadResult === null) {
        (_a = document.getElementById("keypairPopup")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
    }
    else {
        privKey = lsReadResult;
        const wallet = new ethers.Wallet(privKey);
        ownAddress = wallet.address;
        (_b = document.getElementById("entryScreen")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    }
};
// Handle keypair generation
(_a = document.getElementById("enterChatBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const keyPair = ethers.Wallet.createRandom();
    privKey = keyPair.privateKey;
    ownAddress = keyPair.address;
    localStorage.setItem(keyName, privKey);
    alert("Keypair generated and saved!");
    (_a = document.getElementById("keypairPopup")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    (_b = document.getElementById("entryScreen")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
}));
// Handle entering the chat room
(_b = document.getElementById("enterChatBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    nickname = document.getElementById('nickname').value;
    topic = document.getElementById('topic').value;
    chat = new SwarmChat({
        url: selectedNode.url,
        logLevel: "info",
        usersFeedTimeout: 10000
    });
    // Initialize the chat
    yield chat.initUsers(topic, ownAddress, selectedNode.stamp);
    const { on } = chat.getChatActions();
    on(EVENTS.RECEIVE_MESSAGE, (newMessages) => {
        const messageDiv = document.getElementById("messages");
        newMessages.forEach((msg) => {
            const messageElement = document.createElement("div");
            messageElement.textContent = `${msg.username}: ${msg.message}`;
            messageDiv === null || messageDiv === void 0 ? void 0 : messageDiv.appendChild(messageElement);
        });
    });
    (_a = document.getElementById("entryScreen")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    (_b = document.getElementById("chatScreen")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
}));
// Handle sending messages
(_c = document.getElementById("sendBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    const messageText = document.getElementById("messageInput").value;
    const messageObj = {
        message: messageText,
        username: nickname,
        address: ownAddress,
        timestamp: Date.now()
    };
    yield chat.sendMessage(ownAddress, topic, messageObj, selectedNode.stamp, privKey);
    document.getElementById("messageInput").value = "";
}));
function randomlySelectNode() {
    const randomIndex = Math.floor(Math.random() * nodeList.length);
    return nodeList[randomIndex];
}
