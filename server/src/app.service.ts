import { Injectable } from "@nestjs/common";
import { Message, Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class AppService {
    constructor(private readonly prisma: PrismaService) {}

    async getMessages(): Promise<Message[]> {
        return this.prisma.message.findMany();
    }

    async clearMessages(): Promise<Prisma.BatchPayload> {
        return this.prisma.message.deleteMany();
    }

    async createMessage(data: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput) {
        return this.prisma.message.create({ data });
    }

    // async updateMessage(payload: MessageUpdatePayload) {
    //     const { id, text } = payload;
    //     return this.prisma.message.update({ where: { id }, data: { text } });
    // }

    async removeMessage(where: Prisma.MessageWhereUniqueInput) {
        return this.prisma.message.delete({ where });
    }

    async getUser(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async getUserById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async updateMessage(message: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput) {
        return this.prisma.message.updateMany({
            data: { homePage: message["user"]["create"]["userHomePage"] },
            where: { userId: message["userId"] },
        });
    }

    async updateOrCreateUser(user: Prisma.UserCreateWithoutMessagesInput) {
        return this.prisma.user.upsert({
            create: user,
            update: user,
            where: { id: user.id },
        });
    }
}
