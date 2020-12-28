import {Module} from '@nestjs/common';
import {AppController} from './controllers/app.controller';
import {DatabaseService} from './services/database.service';
import {FixturesService} from './services/fixtures.service';
import {RepositoryService} from './services/repository.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [DatabaseService, FixturesService, RepositoryService],
})
export class CardStoreModule {}
