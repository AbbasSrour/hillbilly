# ApiAuthPhoneNumberVerifyPost200ResponseUser

User object with phone number details, null if no user is created or found

## Properties

| Name                    | Type        | Description                              | Notes                             |
| ----------------------- | ----------- | ---------------------------------------- | --------------------------------- |
| **id**                  | **string**  | Unique identifier of the user            | [default to undefined]            |
| **email**               | **string**  | User\&#39;s email address                | [optional] [default to undefined] |
| **emailVerified**       | **boolean** | Whether the email is verified            | [optional] [default to undefined] |
| **name**                | **string**  | User\&#39;s name                         | [optional] [default to undefined] |
| **image**               | **string**  | User\&#39;s profile image URL            | [optional] [default to undefined] |
| **phoneNumber**         | **string**  | User\&#39;s phone number                 | [default to undefined]            |
| **phoneNumberVerified** | **boolean** | Whether the phone number is verified     | [default to undefined]            |
| **createdAt**           | **string**  | Timestamp when the user was created      | [default to undefined]            |
| **updatedAt**           | **string**  | Timestamp when the user was last updated | [default to undefined]            |

## Example

```typescript
import { ApiAuthPhoneNumberVerifyPost200ResponseUser } from "./api";

const instance: ApiAuthPhoneNumberVerifyPost200ResponseUser = {
  id,
  email,
  emailVerified,
  name,
  image,
  phoneNumber,
  phoneNumberVerified,
  createdAt,
  updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
