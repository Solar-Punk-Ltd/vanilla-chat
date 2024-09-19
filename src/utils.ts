import { EthAddress } from 'swarm-decentralized-chat';
import { Diagnostics, NodeListElement } from './types';

// Select a node to use
export function randomlySelectNode(nodeList: NodeListElement[]): NodeListElement {
    const randomIndex = Math.floor(Math.random() * nodeList.length);
    return nodeList[randomIndex];
}

// Add message to UI, with animation
export function addMessage(username: string, message: string, isSent: boolean, timestamp: number) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-bubble');
    messageElement.classList.add(isSent ? 'chat-bubble--sent' : 'chat-bubble--received');

    const usernameElement = document.createElement('span');
    usernameElement.classList.add('username');
    usernameElement.textContent = username;

    const timeElement = document.createElement('span');
    timeElement.classList.add('time');
    timeElement.textContent = new Date(timestamp).toLocaleTimeString();

    messageElement.appendChild(usernameElement);
    messageElement.appendChild(document.createTextNode(message));
    messageElement.appendChild(timeElement);

    const messagesDiv = document.getElementById('messages')
    messagesDiv?.appendChild(messageElement);

    //if (!messagesDiv) return;
    //const isNearBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 50;
    //if (!isNearBottom) {
        messagesDiv?.scrollTo({ 
            left: 0,
            top: messagesDiv.scrollHeight,
            /*behavior: "smooth"*/
        });
    //}
}

// Display diagnostics
export function displayDiagnostics(diagnostics: Diagnostics) {
    if (!diagnostics) return;

// ---Message fetch interval---
    (document.getElementById('mInterval')  as HTMLElement).innerHTML 
        = `<i>Current message fetch interval</i> <strong>${diagnostics.currentMessageFetchInterval} ms </strong>`;

// ---Max parallel message fetch---
    (document.getElementById('maxParallel')  as HTMLElement).innerHTML 
        = `<i>Max parallel message fetch</i> <strong>${diagnostics.maxParallel}</strong>`;

// ---Newly registered users---
    let newUsers = "<i>";
    for (let i = 0; i < diagnostics.newlyResigeredUsers.length; i++) {
        newUsers += `${diagnostics.newlyResigeredUsers[i].username}`;
        if (i < diagnostics.newlyResigeredUsers.length-1) newUsers += ', ';
    }
    newUsers += '</i>';
    (document.getElementById('newUsers')  as HTMLElement).innerHTML 
        = `<i>Newly registered users:</i> <strong>${newUsers}</strong>`;

// ---Total request count---
    (document.getElementById('reqCount')  as HTMLElement).innerHTML
        = `<i>Total request count:</i>  <strong>${diagnostics.requestCount}</strong>`;

// ---Average request time---
    (document.getElementById('reqTimeAvg')  as HTMLElement).innerHTML
        = `<i>Average request time:</i>  <strong>${Math.floor(diagnostics.requestTimeAvg.getAverage())} ms </strong>`;

// ---User activity table---
    let userActivity = "";
    for (const address in diagnostics.userActivityTable) {
        const actObj = diagnostics.userActivityTable[address as EthAddress];
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        const timestamp = new Date(actObj.timestamp);
        const timeString = formatTimeWithLeadingZero(timestamp);
        userActivity += `
            <div>
                <strong>${shortAddress}</strong>: 
                <span><i>{ timestamp: ${timeString}, readFails: ${actObj.readFails} }</i></span>
            </div>`;
    }
    (document.getElementById('userActivity')  as HTMLElement).innerHTML
        = `<i>User Activity Table:</i>  ${userActivity}`;

// ---Active users---
    let users = "";
    for (let i = 0; i < diagnostics.users.length; i++) {
        users += `${diagnostics.users[i].username}`;
        if (diagnostics.users.length-1) users += ", ";
    }
    (document.getElementById('users')  as HTMLElement).innerHTML
        = `<i>Active users:</i>  <strong>${users}</strong>`;
}

// Will give back a time string, which also contains leading zeroes
export function formatTimeWithLeadingZero(date: Date): string {
    const formatWithLeadingZero = (n: number) => {
        return n < 10 ? `0${n}` : `${n}`;
    }

    const hours = formatWithLeadingZero(date.getHours());
    const minutes = formatWithLeadingZero(date.getMinutes());
    const seconds = formatWithLeadingZero(date.getSeconds());
    
    return `${hours}:${minutes}:${seconds}`;
}

export function addToLastThirty(lastThirty: string[], element: string): string[] {
    lastThirty.push(element);

    if (lastThirty.length > 30) {
        lastThirty.shift();
    }

    return lastThirty;
}