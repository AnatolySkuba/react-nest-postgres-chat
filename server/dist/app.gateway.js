"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const client_1 = require("@prisma/client");
const socket_io_1 = require("socket.io");
const app_service_1 = require("./app.service");
const users = {};
let AppGateway = class AppGateway {
    constructor(appService) {
        this.appService = appService;
    }
    async handleMessagesGet() {
        const messages = await this.appService.getMessages();
        this.server.emit("messages", messages);
    }
    async handleMessagesClear() {
        await this.appService.clearMessages();
    }
    async handleMessagesPost(payload) {
        if ("userId" in payload) {
            const user = await this.appService.getUserById(payload["userId"]);
            const result = await this.appService.createMessage({
                data: Object.assign(Object.assign({}, payload), { avatar: user.avatar }),
            });
            this.successMessage({ message: "Message saved", result });
            return;
        }
        const user = await this.appService.getUser(payload["user"]["create"]["email"]);
        if (!user) {
            const result = await this.appService.createMessage({
                data: Object.assign({}, payload),
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
    async handleMessagePut({ id, message, }) {
        const result = await this.appService.updateMessage({
            id,
            message,
        });
        this.successMessage({ message: "Message changed", result });
        this.handleMessagesGet();
    }
    async handleAvatarPut({ id, avatar }) {
        await this.appService.updateAvatar({
            id,
            avatar,
        });
        this.handleMessagesGet();
    }
    async handleLikePut(payload) {
        await this.appService.updateLike(payload);
        this.handleMessagesGet();
    }
    async handleMessageDelete(payload) {
        const result = await this.appService.removeMessage(payload);
        this.server.emit("message:delete", result);
        this.handleMessagesGet();
    }
    afterInit(server) {
        console.log(server);
    }
    handleConnection(client, ...args) {
        const userName = client.handshake.query.userName;
        const socketId = client.id;
        users[socketId] = userName;
        client.broadcast.emit("log", `${userName} connected`);
    }
    handleDisconnect(client) {
        const socketId = client.id;
        const userName = users[socketId];
        delete users[socketId];
        client.broadcast.emit("log", `${userName} disconnected`);
    }
    successMessage({ message, result }) {
        this.server.emit("message:post", result);
        this.server.emit("log", {
            status: "success",
            message: message,
        });
        this.handleMessagesGet();
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("messages:get"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleMessagesGet", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("messages:clear"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleMessagesClear", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("message:post"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleMessagesPost", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("message:put"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleMessagePut", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("avatar:put"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleAvatarPut", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("like:put"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleLikePut", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("message:delete"),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handleMessageDelete", null);
AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CLIENT_URI,
        },
        serveClient: false,
        namespace: "message",
    }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppGateway);
exports.AppGateway = AppGateway;
//# sourceMappingURL=app.gateway.js.map