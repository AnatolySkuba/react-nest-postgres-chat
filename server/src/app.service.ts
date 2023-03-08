import { Injectable } from "@nestjs/common";
import { Message, Prisma, User } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class AppService {
    constructor(private readonly prisma: PrismaService) {}
    async getRootMessages(): Promise<Message[]> {
        return await this.prisma.message.findMany({
            where: {
                parentId: null,
            },
            orderBy: { updatedAt: "asc" },
            include: messageInclude,
        });
    }

    async getChildren(parent: Message): Promise<Message[]> {
        const new_arr = [];
        const getSubChildren = async (arr: Message[]) => {
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

    async getMessages(): Promise<Message[]> {
        const rootMessages = await this.getRootMessages();
        const allMessages = await rootMessages.reduce<Promise<Message[]>>(
            async (acc, rootMessage) => {
                return [...(await acc), ...(await this.getChildren(rootMessage))];
            },
            [] as unknown as Promise<Message[]>
        );

        return allMessages;
    }

    async clearMessages(): Promise<Prisma.BatchPayload> {
        return this.prisma.message.deleteMany();
    }

    async createMessage({
        data,
    }: {
        data: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput;
    }) {
        return this.prisma.message.create({ data });
    }

    async removeMessage(where: Prisma.MessageWhereUniqueInput) {
        return this.prisma.message.delete({ where });
    }

    async updateMessage({
        id,
        message,
    }: {
        id: Prisma.MessageWhereUniqueInput;
        message: Prisma.MessageUncheckedCreateInput;
    }) {
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

    async updateAvatar({ id, avatar }: { id: string; avatar: string }) {
        return this.prisma.user.update({
            where: { id: id },
            data: { avatar },
        });
    }

    async updateLike(payload: { userId: string; messageId: string }) {
        const like = await this.prisma.like.findUnique({
            where: { userId_messageId: payload },
        });
        if (like) {
            return await this.prisma.like.delete({ where: { userId_messageId: payload } });
        } else {
            return await this.prisma.like.create({ data: payload });
        }
    }

    async getUser(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async getUserById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }
}

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
