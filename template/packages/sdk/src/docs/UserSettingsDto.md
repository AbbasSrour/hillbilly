# UserSettingsDto

## Properties

| Name             | Type                                                                 | Description | Notes                             |
| ---------------- | -------------------------------------------------------------------- | ----------- | --------------------------------- |
| **id**           | **string**                                                           |             | [default to undefined]            |
| **createdAt**    | **string**                                                           |             | [default to undefined]            |
| **updatedAt**    | **string**                                                           |             | [default to undefined]            |
| **locale**       | [**LanguageCode**](LanguageCode.md)                                  |             | [default to undefined]            |
| **theme**        | [**Theme**](Theme.md)                                                |             | [default to undefined]            |
| **timezone**     | **string**                                                           |             | [default to undefined]            |
| **translations** | [**Array&lt;AbstractTranslationDto&gt;**](AbstractTranslationDto.md) |             | [optional] [default to undefined] |

## Example

```typescript
import { UserSettingsDto } from "./api";

const instance: UserSettingsDto = {
  id,
  createdAt,
  updatedAt,
  locale,
  theme,
  timezone,
  translations,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
