/* @hillbilly-sync */
import { Injectable } from "@nestjs/common";

@Injectable()
export class ValidatorService {
  public isImage(mimeType: string): boolean {
    const imageMimeTypes = ["image/jpeg", "image/png"];

    return imageMimeTypes.includes(mimeType);
  }

  public isExcel(mimeType: string): boolean {
    const excelMimeTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

    return excelMimeTypes.includes(mimeType);
  }

  public isCsv(mimeType: string): boolean {
    const csvMimeTypes = ["text/csv"];

    return csvMimeTypes.includes(mimeType);
  }

  public isTxt(mimeType: string): boolean {
    const txtMimeTypes = ["text/plain"];

    return txtMimeTypes.includes(mimeType);
  }
}
