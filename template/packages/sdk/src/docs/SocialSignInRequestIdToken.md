# SocialSignInRequestIdToken

## Properties

| Name             | Type                                                                    | Description                      | Notes                             |
| ---------------- | ----------------------------------------------------------------------- | -------------------------------- | --------------------------------- |
| **token**        | **string**                                                              | ID token from the provider       | [default to undefined]            |
| **nonce**        | **string**                                                              | Nonce used to generate the token | [optional] [default to undefined] |
| **accessToken**  | **string**                                                              | Access token from the provider   | [optional] [default to undefined] |
| **refreshToken** | **string**                                                              | Refresh token from the provider  | [optional] [default to undefined] |
| **expiresAt**    | **number**                                                              | Expiry date of the token         | [optional] [default to undefined] |
| **user**         | [**SocialSignInRequestIdTokenUser**](SocialSignInRequestIdTokenUser.md) |                                  | [optional] [default to undefined] |

## Example

```typescript
import { SocialSignInRequestIdToken } from "./api";

const instance: SocialSignInRequestIdToken = {
  token,
  nonce,
  accessToken,
  refreshToken,
  expiresAt,
  user,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
