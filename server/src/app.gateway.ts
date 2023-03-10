import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Message, Prisma } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { AppService } from "./app.service";

const users: Record<string, string> = {};

@WebSocketGateway({
    cors: {
        origin: process.env.CLIENT_URI,
    },
    serveClient: false,
    namespace: "message",
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly appService: AppService) {}

    @WebSocketServer() server: Server;

    @SubscribeMessage("messages:get")
    async handleMessagesGet(): Promise<void> {
        const messages = await this.appService.getMessages();
        this.server.emit("messages", messages);
    }

    @SubscribeMessage("messages:clear")
    async handleMessagesClear(): Promise<void> {
        await this.appService.clearMessages();
    }

    @SubscribeMessage("message:post")
    async handleMessagesPost(
        @MessageBody()
        payload: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput
    ): Promise<void> {
        if ("userId" in payload) {
            const user = await this.appService.getUserById(payload["userId"]);
            const result = await this.appService.createMessage({
                data: {
                    ...payload,
                    avatar: user.avatar,
                },
            });
            this.successMessage({ message: "Message saved", result });
            return;
        }

        const user = await this.appService.getUser(payload["user"]["create"]["email"]);

        if (!user) {
            const result = await this.appService.createMessage({
                data: { ...payload },
            });
            this.successMessage({ message: "Message saved", result });
            return;
        }

        if (payload["user"]["create"]["userName"] !== user.userName) {
            this.server.emit("log", {
                status: "error",
                message: "Incorrect User Name and E-mail",
            });
            return;
        }

        const result = await this.appService.createMessage({
            data: {
                text: payload.text,
                files: payload.files,
                images: payload.images,
                parentId: payload.parentId,
                userId: user.id,
                userName: user.userName,
                avatar: user.avatar,
            },
        });
        this.successMessage({ message: "Message saved", result });
    }

    @SubscribeMessage("message:put")
    async handleMessagePut(
        @MessageBody()
        {
            id,
            message,
        }: {
            id: Prisma.MessageWhereUniqueInput;
            message: Prisma.MessageUncheckedCreateInput;
        }
    ): Promise<void> {
        const result = await this.appService.updateMessage({
            id,
            message,
        });
        this.successMessage({ message: "Message changed", result });
        this.handleMessagesGet();
    }

    @SubscribeMessage("avatar:put")
    async handleAvatarPut(
        @MessageBody()
        { id, avatar }: { id: string; avatar: string }
    ): Promise<void> {
        await this.appService.updateAvatar({
            id,
            avatar,
        });
        this.handleMessagesGet();
    }

    @SubscribeMessage("like:put")
    async handleLikePut(
        @MessageBody()
        payload: {
            userId: string;
            messageId: string;
        }
    ): Promise<void> {
        await this.appService.updateLike(payload);
        this.handleMessagesGet();
    }

    @SubscribeMessage("message:delete")
    async handleMessageDelete(
        @MessageBody()
        payload: Prisma.MessageWhereUniqueInput
    ) {
        const result = await this.appService.removeMessage(payload);
        this.server.emit("message:delete", result);
        this.handleMessagesGet();
    }

    afterInit(server: Server) {
        console.log(server);
    }

    handleConnection(client: Socket, ...args: any[]) {
        const userName = client.handshake.query.userName as string;
        const socketId = client.id;
        users[socketId] = userName;

        client.broadcast.emit("log", `${userName} connected`);
    }

    handleDisconnect(client: Socket) {
        const socketId = client.id;
        const userName = users[socketId];
        delete users[socketId];

        client.broadcast.emit("log", `${userName} disconnected`);
    }

    successMessage({ message, result }: { message: string; result: Message }) {
        this.server.emit("message:post", result);
        this.server.emit("log", {
            status: "success",
            message: message,
        });
        this.handleMessagesGet();
    }
}
