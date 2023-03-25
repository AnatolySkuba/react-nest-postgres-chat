import { Message, Prisma, User } from "@prisma/client";
import { PrismaService } from "./prisma.service";
export declare class AppService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRootMessages(): Promise<Message[]>;
    getChildren(parent: Message): Promise<Message[]>;
    getMessages(): Promise<Message[]>;
    clearMessages(): Promise<Prisma.BatchPayload>;
    createMessage({ data, }: {
        data: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput;
    }): Promise<Message>;
    removeMessage(where: Prisma.MessageWhereUniqueInput): Promise<Message>;
    updateMessage({ id, message, }: {
        id: Prisma.MessageWhereUniqueInput;
        message: Prisma.MessageUncheckedCreateInput;
    }): Promise<Message>;
    updateAvatar({ id, avatar }: {
        id: string;
        avatar: string;
    }): Promise<User>;
    updateLike(payload: {
        userId: string;
        messageId: string;
    }): Promise<import(".prisma/client").Like>;
    getUser(email: string): Promise<User>;
    getUserById(id: string): Promise<User>;
}
