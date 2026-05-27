# ChangePasswordRequest

## Properties

| Name                    | Type        | Description                      | Notes                             |
| ----------------------- | ----------- | -------------------------------- | --------------------------------- |
| **newPassword**         | **string**  | The new password to set          | [default to undefined]            |
| **currentPassword**     | **string**  | The current password is required | [default to undefined]            |
| **revokeOtherSessions** | **boolean** | Must be a boolean value          | [optional] [default to undefined] |

## Example

```typescript
import { ChangePasswordRequest } from "./api";

const instance: ChangePasswordRequest = {
  newPassword,
  currentPassword,
  revokeOtherSessions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
