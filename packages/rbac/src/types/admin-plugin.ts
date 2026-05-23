/**
 * Admin plugin type definition for runtime detection
 */
export interface AdminPlugin {
  id: string;
  ac?: Record<string, string[]>;
}
