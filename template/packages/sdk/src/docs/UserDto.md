# UserDto

## Properties

| Name             | Type                                                                 | Description | Notes                             |
| ---------------- | -------------------------------------------------------------------- | ----------- | --------------------------------- |
| **id**           | **string**                                                           |             | [default to undefined]            |
| **createdAt**    | **string**                                                           |             | [default to undefined]            |
| **updatedAt**    | **string**                                                           |             | [default to undefined]            |
| **email**        | **string**                                                           |             | [optional] [default to undefined] |
| **phone**        | **string**                                                           |             | [optional] [default to undefined] |
| **role**         | **string**                                                           |             | [default to undefined]            |
| **isBlocked**    | **boolean**                                                          |             | [default to undefined]            |
| **settings**     | [**UserSettingsDto**](UserSettingsDto.md)                            |             | [default to undefined]            |
| **translations** | [**Array&lt;AbstractTranslationDto&gt;**](AbstractTranslationDto.md) |             | [optional] [default to undefined] |

## Example

```typescript
import { UserDto } from "./api";

const instance: UserDto = {
  id,
  createdAt,
  updatedAt,
  email,
  phone,
  role,
  isBlocked,
  settings,
  translations,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
