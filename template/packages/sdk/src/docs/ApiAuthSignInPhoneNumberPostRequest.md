# ApiAuthSignInPhoneNumberPostRequest

## Properties

| Name            | Type        | Description                                            | Notes                             |
| --------------- | ----------- | ------------------------------------------------------ | --------------------------------- |
| **phoneNumber** | **string**  | Phone number to sign in. Eg: \&quot;+1234567890\&quot; | [default to undefined]            |
| **password**    | **string**  | Password to use for sign in.                           | [default to undefined]            |
| **rememberMe**  | **boolean** | Remember the session. Eg: true                         | [optional] [default to undefined] |

## Example

```typescript
import { ApiAuthSignInPhoneNumberPostRequest } from "./api";

const instance: ApiAuthSignInPhoneNumberPostRequest = {
  phoneNumber,
  password,
  rememberMe,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
