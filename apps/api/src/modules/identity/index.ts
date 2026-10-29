// Module NestJS
export * from './identity.module.js';

// Domain
export * from './domain/entities/user-account.entity.js';
export * from './domain/value-objects/account-status.enum.js';
export * from './domain/value-objects/email.vo.js';
export * from './domain/value-objects/phone-number.vo.js';
export * from './domain/value-objects/password-hash.vo.js';
export * from './domain/events/user-registered.event.js';

// Application Ports & Queries
export * from './application/ports/identity-reader.port.js';
export * from './application/ports/identity-writer.port.js';
export * from './application/ports/password-hasher.port.js';
export * from './application/ports/token-service.port.js';
export * from './application/commands/register.use-case.js';
export * from './application/commands/login.use-case.js';
export * from './application/queries/validate-session.query.js';

// Presentation
export * from './presentation/http/guards/jwt-auth.guard.js';
export * from './presentation/http/guards/platform-admin.guard.js';
export * from './presentation/http/decorators/current-user.decorator.js';
