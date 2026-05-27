# ChangeEmailRequest

## Properties

| Name            | Type       | Description                                                | Notes                             |
| --------------- | ---------- | ---------------------------------------------------------- | --------------------------------- |
| **newEmail**    | **string** | The new email address to set must be a valid email address | [default to undefined]            |
| **callbackURL** | **string** | The URL to redirect to after email verification            | [optional] [default to undefined] |

## Example

```typescript
import { ChangeEmailRequest } from "./api";

const instance: ChangeEmailRequest = {
  newEmail,
  callbackURL,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
