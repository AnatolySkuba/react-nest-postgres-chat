import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Comment, Prisma } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { CLIENT_URI } from "../constants";
import { AppService } from "./app.service";

const users: Record<string, string> = {};

@WebSocketGateway({
    cors: {
        origin: CLIENT_URI,
    },
    serveClient: false,
    namespace: "chat",
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
    async handleMessagePost(
        @MessageBody()
        payload: Prisma.CommentCreateInput | Prisma.CommentUncheckedCreateInput
    ): Promise<void> {
        if (Object.keys(payload).includes("userId")) {
            const user = await this.appService.getUserById(payload["userId"]);
            const createdMessage = await this.appService.createMessage({
                ...payload,
                avatar: user.avatar,
                homePage: user.homePage,
            });
            this.successMessage({ message: "Comment saved", createdMessage });
            return;
        }

        const user = await this.appService.getUser(payload["user"]["create"]["email"]);

        if (!user) {
            const createdMessage = await this.appService.createMessage(payload);
            this.successMessage({ message: "Comment saved", createdMessage });
            return;
        }

        if (payload["user"]["create"]["userName"] !== user.userName) {
            this.server.emit("log", {
                status: "error",
                message: "Incorrect User Name and E-mail",
            });
            return;
        }

        if (payload["user"]["create"]["homePage"] !== user.homePage) {
            await this.appService.updateOrCreateUser({
                ...user,
                homePage: !!payload["user"]["create"]["homePage"]
                    ? payload["user"]["create"]["homePage"]
                    : user.homePage,
            });
            this.appService.updateMessage({ ...payload, userId: user.id });
        }

        const createdMessage = await this.appService.createMessage({
            text: payload.text,
            file: payload.file,
            image: payload.image,
            userId: user.id,
            userName: user.userName,
            avatar: user.avatar,
            homePage: !!payload["user"]["create"]["homePage"]
                ? payload["user"]["create"]["homePage"]
                : user.homePage,
        });

        this.successMessage({ message: "Comment saved", createdMessage });
    }

    @SubscribeMessage("message:put")
    async handleMessagePut(
        @MessageBody()
        payload: Prisma.CommentUpdateInput
    ): Promise<void> {
        const updateComment = await this.appService.updateComment(payload);
        this.server.emit("message:put", updateComment);
        this.handleMessagesGet();
    }

    @SubscribeMessage("message:delete")
    async handleMessageDelete(
        @MessageBody()
        payload: Prisma.CommentWhereUniqueInput
    ) {
        const removedMessage = await this.appService.removeMessage(payload);
        this.server.emit("message:delete", removedMessage);
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

    successMessage({ message, createdMessage }: { message: string; createdMessage: Comment }) {
        this.server.emit("message:post", createdMessage);
        this.server.emit("log", {
            status: "success",
            message: message,
        });
        this.handleMessagesGet();
    }
}
