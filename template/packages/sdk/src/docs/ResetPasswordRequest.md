# ResetPasswordRequest

## Properties

| Name            | Type       | Description                     | Notes                             |
| --------------- | ---------- | ------------------------------- | --------------------------------- |
| **newPassword** | **string** | The new password to set         | [default to undefined]            |
| **token**       | **string** | The token to reset the password | [optional] [default to undefined] |

## Example

```typescript
import { ResetPasswordRequest } from "./api";

const instance: ResetPasswordRequest = {
  newPassword,
  token,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
