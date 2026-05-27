# ApiAuthRefreshTokenPostRequest

## Properties

| Name           | Type       | Description                                      | Notes                             |
| -------------- | ---------- | ------------------------------------------------ | --------------------------------- |
| **providerId** | **string** | The provider ID for the OAuth provider           | [default to undefined]            |
| **accountId**  | **string** | The account ID associated with the refresh token | [optional] [default to undefined] |
| **userId**     | **string** | The user ID associated with the account          | [optional] [default to undefined] |

## Example

```typescript
import { ApiAuthRefreshTokenPostRequest } from "./api";

const instance: ApiAuthRefreshTokenPostRequest = {
  providerId,
  accountId,
  userId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
