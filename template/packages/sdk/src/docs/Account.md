# Account

## Properties

| Name                      | Type       | Description | Notes                             |
| ------------------------- | ---------- | ----------- | --------------------------------- |
| **id**                    | **string** |             | [optional] [default to undefined] |
| **accountId**             | **string** |             | [default to undefined]            |
| **providerId**            | **string** |             | [default to undefined]            |
| **userId**                | **string** |             | [default to undefined]            |
| **accessToken**           | **string** |             | [optional] [default to undefined] |
| **refreshToken**          | **string** |             | [optional] [default to undefined] |
| **idToken**               | **string** |             | [optional] [default to undefined] |
| **accessTokenExpiresAt**  | **string** |             | [optional] [default to undefined] |
| **refreshTokenExpiresAt** | **string** |             | [optional] [default to undefined] |
| **scope**                 | **string** |             | [optional] [default to undefined] |
| **password**              | **string** |             | [optional] [default to undefined] |
| **createdAt**             | **string** |             | [default to Generated at runtime] |
| **updatedAt**             | **string** |             | [default to undefined]            |

## Example

```typescript
import { Account } from "./api";

const instance: Account = {
  id,
  accountId,
  providerId,
  userId,
  accessToken,
  refreshToken,
  idToken,
  accessTokenExpiresAt,
  refreshTokenExpiresAt,
  scope,
  password,
  createdAt,
  updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
