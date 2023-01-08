import {Module} from '@nestjs/common';
import {ServerController} from './server.controller';
import {ServerService} from './server.service';
import {CoreModule} from './core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [ServerController],
  providers: [ServerService],
})
export class ServerModule {}
