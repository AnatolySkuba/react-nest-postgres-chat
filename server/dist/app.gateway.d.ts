import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Message, Prisma } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { AppService } from "./app.service";
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly appService;
    constructor(appService: AppService);
    server: Server;
    handleMessagesGet(): Promise<void>;
    handleMessagesClear(): Promise<void>;
    handleMessagesPost(payload: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput): Promise<void>;
    handleMessagePut({ id, message, }: {
        id: Prisma.MessageWhereUniqueInput;
        message: Prisma.MessageUncheckedCreateInput;
    }): Promise<void>;
    handleAvatarPut({ id, avatar }: {
        id: string;
        avatar: string;
    }): Promise<void>;
    handleLikePut(payload: {
        userId: string;
        messageId: string;
    }): Promise<void>;
    handleMessageDelete(payload: Prisma.MessageWhereUniqueInput): Promise<void>;
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
    successMessage({ message, result }: {
        message: string;
        result: Message;
    }): void;
}
