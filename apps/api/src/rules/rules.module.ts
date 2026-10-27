import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RulesService } from "./rules.service";

@Module({
  imports: [PrismaModule],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}
