import dotenv from 'dotenv';
import { Server } from 'http';
import { dbLoader } from './startup/db.loader';
import { expressLoader } from './startup/express.loader';
import { getApi } from './api/index.api';
import { errorHandler } from './utils/errorHandler';
import { config } from './utils/config';
import { logger as log } from './utils/logger';

dotenv.config();

export let server: Server;

try {
  dbLoader();
  const app = expressLoader();

  getApi(app);

  errorHandler(app);

  server = app?.listen(config.PORT, () => log(`App started on port ${config.PORT}`));
} catch (e) {
  log(e);
}
