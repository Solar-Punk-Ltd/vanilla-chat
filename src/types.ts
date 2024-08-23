import { BatchId } from '@ethersphere/bee-js';
import { UserWithIndex } from 'swarm-decentralized-chat';
import { UserActivity } from 'swarm-decentralized-chat/dist/types';
import { RunningAverage } from 'swarm-decentralized-chat/dist/utils';

export interface NodeListElement {
    url: string;
    stamp: BatchId
}

export interface Diagnostics {
    requestTimeAvg: RunningAverage;
    users: UserWithIndex[];
    currentMessageFetchInterval: number;
    maxParallel: number;
    userActivityTable: UserActivity;
    newlyResigeredUsers: UserWithIndex[];
    requestCount: number;
}