import { Injectable } from "@nestjs/common";
import { Comment, Prisma, User } from "@prisma/client";
import { PrismaService } from "./prisma.service";

@Injectable()
export class AppService {
    constructor(private readonly prisma: PrismaService) {}

    async getMessages(): Promise<Comment[]> {
        return this.prisma.comment.findMany();
    }

    async clearMessages(): Promise<Prisma.BatchPayload> {
        return this.prisma.comment.deleteMany();
    }

    async createMessage(data: Prisma.CommentCreateInput | Prisma.CommentUncheckedCreateInput) {
        return this.prisma.comment.create({ data });
    }

    async updateComment(payload: Prisma.CommentUpdateInput) {
        const { id, ...rest } = payload;
        if (typeof id === "string")
            return this.prisma.comment.update({ where: { id }, data: rest });
    }

    async removeMessage(where: Prisma.CommentWhereUniqueInput) {
        return this.prisma.comment.delete({ where });
    }

    async getUser(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async getUserById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async updateMessage(message: Prisma.CommentCreateInput | Prisma.CommentUncheckedCreateInput) {
        return this.prisma.comment.updateMany({
            data: { homePage: message["user"]["create"]["userHomePage"] },
            where: { userId: message["userId"] },
        });
    }

    async updateOrCreateUser(user: User) {
        return this.prisma.user.upsert({
            create: user,
            update: user,
            where: { id: user.id },
        });
    }
}
