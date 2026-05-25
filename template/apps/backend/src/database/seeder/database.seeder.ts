import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Seeders removed - Better Auth handles user and role initialization
    // via the RBAC plugin sync functionality
  }
}
