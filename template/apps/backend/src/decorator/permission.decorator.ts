/* @hillbilly-sync */
import { Reflector } from "@nestjs/core";

export const PERMISSIONS_KEY = "permissions";
export const Permissions = Reflector.createDecorator<string[]>();
