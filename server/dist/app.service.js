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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let AppService = class AppService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRootMessages() {
        return await this.prisma.message.findMany({
            where: {
                parentId: null,
            },
            orderBy: { updatedAt: "asc" },
            include: messageInclude,
        });
    }
    async getChildren(parent) {
        const new_arr = [];
        const getSubChildren = async (arr) => {
            for (const element of arr) {
                const children = await this.prisma.message.findMany({
                    where: { parentId: element.id },
                    include: messageInclude,
                });
                new_arr.push(element);
                if (Array.isArray(children) && children.length) {
                    await getSubChildren(children);
                }
            }
        };
        await getSubChildren([parent]);
        return new_arr;
    }
    async getMessages() {
        const rootMessages = await this.getRootMessages();
        const allMessages = await rootMessages.reduce(async (acc, rootMessage) => {
            return [...(await acc), ...(await this.getChildren(rootMessage))];
        }, []);
        return allMessages;
    }
    async clearMessages() {
        return this.prisma.message.deleteMany();
    }
    async createMessage({ data, }) {
        return this.prisma.message.create({ data });
    }
    async removeMessage(where) {
        return this.prisma.message.delete({ where });
    }
    async updateMessage({ id, message, }) {
        return this.prisma.message.update({
            where: id,
            data: {
                text: message.text,
                files: {
                    deleteMany: { NOT: id },
                    create: message.files.createMany.data,
                },
                images: {
                    deleteMany: { NOT: id },
                    create: message.images.createMany.data,
                },
            },
        });
    }
    async updateAvatar({ id, avatar }) {
        return this.prisma.user.update({
            where: { id: id },
            data: { avatar },
        });
    }
    async updateLike(payload) {
        const like = await this.prisma.like.findUnique({
            where: { userId_messageId: payload },
        });
        if (like) {
            return await this.prisma.like.delete({ where: { userId_messageId: payload } });
        }
        else {
            return await this.prisma.like.create({ data: payload });
        }
    }
    async getUser(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async getUserById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
};
AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppService);
exports.AppService = AppService;
const messageInclude = {
    files: {
        select: {
            id: true,
            fileName: true,
            filePath: true,
            publicId: true,
        },
    },
    images: {
        select: {
            id: true,
            largeURL: true,
            publicId: true,
            width: true,
            height: true,
        },
    },
    likes: true,
};
//# sourceMappingURL=app.service.js.map