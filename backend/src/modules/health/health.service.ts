import { healthRepository } from './health.repository';

export interface HealthStatus {
  status: 'ok' | 'error';
  database: 'up' | 'down';
  uptime: number;
  timestamp: string;
}

export const healthService = {
  async check(): Promise<HealthStatus> {
    let database: HealthStatus['database'] = 'up';
    try {
      await healthRepository.pingDatabase();
    } catch {
      database = 'down';
    }
    return {
      status: database === 'up' ? 'ok' : 'error',
      database,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  },
};
