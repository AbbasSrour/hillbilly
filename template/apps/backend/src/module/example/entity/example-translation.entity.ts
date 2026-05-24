import { Entity, Property } from "@mikro-orm/decorators/legacy";
import { AbstractTranslationEntity } from "@hillbilly/nest/abstract";

@Entity({ tableName: "example_translation" })
export class ExampleTranslationEntity extends AbstractTranslationEntity {
  @Property({ type: "string" })
  text!: string;
}
