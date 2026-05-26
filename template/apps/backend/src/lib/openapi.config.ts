import * as fs from 'node:fs';
import * as path from 'node:path';
import { OpenApiNestFactory } from '@abbas_srour/nest-openapi-tools';
import { AuthModule } from '@module/auth/auth.module';
import { AuthService } from '@module/auth/service/auth.service';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigModule } from '@config/config.module';
import { ApiConfigService } from '@config/service/api-config.service';
import { apiReference } from '@scalar/nestjs-api-reference';
import { isErrorResult, merge } from 'openapi-merge';

export async function setupOpenapi(app: INestApplication) {
  const filePath = path.join(import.meta.dirname, 'openapi-description.md');
  const apiDoc = fs.readFileSync(filePath, 'utf8');
  const apiConfig = app.select(ConfigModule).get(ApiConfigService);
  const authService = app.select(AuthModule).get(AuthService);

  const documentBuilder = new DocumentBuilder()
    .setTitle('API')
    .setDescription(apiDoc)
    .addBearerAuth()
    .setVersion(apiConfig.appConfig.apiVersion);

  const apiDocument = SwaggerModule.createDocument(app, documentBuilder.build());
  const authDocument = await authService.instance.api.generateOpenAPISchema();

  // Merge NestJS and Better Auth schemas using openapi-merge
  const mergeResult = merge([
    {
      oas: apiDocument as Parameters<typeof merge>[0][0]['oas'],
      pathModification: { prepend: '' },
    },
    {
      oas: authDocument as Parameters<typeof merge>[0][0]['oas'],
      pathModification: { prepend: '/api/auth' },
    },
  ]);

  if (!isErrorResult(mergeResult)) {
    const mergedSchema = {
      ...mergeResult.output,
      openapi: '3.1.0',
    };
    const outputPath = path.resolve(import.meta.dirname, '../../../../packages/sdk/openapi.json');

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(mergedSchema, null, 2));
  } else {
    console.error('❌ Failed to merge OpenAPI schemas:', mergeResult.message);
  }

  // Swagger
  SwaggerModule.setup('docs', app, apiDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Scalar
  app.use(
    '/reference',
    apiReference({
      sources: [
        {
          title: 'Auth Documentation',
          url: '/api/auth/open-api/generate-schema',
        },
        {
          title: 'API Documentation',
          content: apiDocument,
          default: true,
        },
      ],
    }),
  );

  // Creates OpenApi Types
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    await OpenApiNestFactory.configure(app, documentBuilder, {
      webServerOptions: {
        enabled: false,
        path: 'docs',
      },
      clientGeneratorOptions: {
        enabled: isDevelopment,
        type: 'typescript-axios',
        openApiFilePath: path.resolve(import.meta.dirname, '../../../../packages/sdk/openapi.json'),
        openApiToolsFilePath: path.resolve(
          import.meta.dirname,
          '../../../../packages/sdk/openapitools.json',
        ),
        outputFolderPath: '../../packages/sdk/src',
        additionalProperties:
          'apiPackage=clients,modelPackage=models,withSeparateModelsAndApi=true,useSingleRequestParameter=true',
        skipValidation: false,
      },
    });
  }
}
