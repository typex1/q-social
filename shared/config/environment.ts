export type Environment = 'local' | 'aws';

export interface Config {
  environment: Environment;
  apiBaseUrl: string;
  corsOrigins: string[];
}

export function getConfig(): Config {
  const env = process.env.NEXT_PUBLIC_ENV || 'local';
  
  if (env === 'aws') {
    return {
      environment: 'aws',
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '',
      corsOrigins: [process.env.NEXT_PUBLIC_APP_URL || '']
    };
  }
  
  return {
    environment: 'local',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    corsOrigins: ['http://localhost:3000']
  };
}
