import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";

import type { AbstractDto } from "@/abstract/dto/abstract.dto";
import type { TranslationService } from "@/package/translation/service/translation.service";

// FIXME: add implementation
@Injectable()
export class TranslationInterceptor implements NestInterceptor {
  constructor(private readonly translationService: TranslationService) {}

  public intercept(_context: ExecutionContext, next: CallHandler): Observable<AbstractDto> {
    return next
      .handle()
      .pipe(mergeMap((data) => this.translationService.translateNecessaryKeys(data)));
  }
}
