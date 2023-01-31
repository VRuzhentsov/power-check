import {PrismaService} from '../../services/prisma/prisma.service';

export default class Repository {
  constructor(private prisma: PrismaService) {}
}
