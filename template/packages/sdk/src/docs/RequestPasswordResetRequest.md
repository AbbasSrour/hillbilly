# RequestPasswordResetRequest

## Properties

| Name           | Type       | Description                                                                                                                                                                                                                                                                                 | Notes                             |
| -------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **email**      | **string** | The email address of the user to send a password reset email to                                                                                                                                                                                                                             | [default to undefined]            |
| **redirectTo** | **string** | The URL to redirect the user to reset their password. If the token isn\&#39;t valid or expired, it\&#39;ll be redirected with a query parameter &#x60;?error&#x3D;INVALID_TOKEN&#x60;. If the token is valid, it\&#39;ll be redirected with a query parameter &#x60;?token&#x3D;VALID_TOKEN | [optional] [default to undefined] |

## Example

```typescript
import { RequestPasswordResetRequest } from "./api";

const instance: RequestPasswordResetRequest = {
  email,
  redirectTo,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
