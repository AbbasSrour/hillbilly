// ============================================================================
// @hillbilly/nest — NestJS Backend Utilities
// ============================================================================
//
// This package provides reusable NestJS decorators, guards, pipes, filters,
// middlewares, and DTO abstractions extracted from production NestJS backends.
//
// Categories (import via subpath to avoid naming collisions):
//   @hillbilly/nest/abstract     — base DTO, entity, repository, service classes
//   @hillbilly/nest/decorator    — parameter, property, class, and method decorators
//   @hillbilly/nest/guard        — authorization and permission guards
//   @hillbilly/nest/pipe         — validation and transformation pipes
//   @hillbilly/nest/filter       — exception filters
//   @hillbilly/nest/middleware   — HTTP middleware
//   @hillbilly/nest/interceptor  — NestJS interceptors
//   @hillbilly/nest/interface    — shared TypeScript interfaces
//   @hillbilly/nest/types        — shared TypeScript utility types
//   @hillbilly/nest/utils        — utility helpers
//
// Note: package/ modules (crypto, twilio, pdf, etc.) have their own subpaths:
//   @hillbilly/nest/package/crypto/crypto.module

export * from "./abstract";
export * from "./types";
export * from "./interface";
export * from "./guard";
export * from "./filter";
export * from "./middleware";
export * from "./utils";
