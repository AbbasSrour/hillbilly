# SendVerificationEmailRequest

## Properties

| Name            | Type       | Description                                    | Notes                             |
| --------------- | ---------- | ---------------------------------------------- | --------------------------------- |
| **email**       | **string** | The email to send the verification email to    | [default to undefined]            |
| **callbackURL** | **string** | The URL to use for email verification callback | [optional] [default to undefined] |

## Example

```typescript
import { SendVerificationEmailRequest } from "./api";

const instance: SendVerificationEmailRequest = {
  email,
  callbackURL,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
