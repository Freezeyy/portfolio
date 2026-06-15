import type { Core } from '@strapi/strapi';

export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGINS', [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ]),
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
