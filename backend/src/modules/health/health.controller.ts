import { asyncHandler } from '../../utils/async-handler';
import { sendError, sendSuccess } from '../../utils/response';
import { healthService } from './health.service';

export const healthController = {
  check: asyncHandler(async (_req, res) => {
    const health = await healthService.check();
    if (health.status !== 'ok') {
      sendError(res, 503, 'Database không kết nối được', 'SERVICE_UNAVAILABLE', health);
      return;
    }
    sendSuccess(res, health);
  }),
};
