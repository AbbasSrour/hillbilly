# SignInEmailRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email** | **string** | Email of the user | [default to undefined]
**password** | **string** | Password of the user | [default to undefined]
**callbackURL** | **string** | Callback URL to use as a redirect for email verification | [optional] [default to undefined]
**rememberMe** | **boolean** | If this is false, the session will not be remembered. Default is &#x60;true&#x60;. | [optional] [default to true]

## Example

```typescript
import { SignInEmailRequest } from './api';

const instance: SignInEmailRequest = {
    email,
    password,
    callbackURL,
    rememberMe,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
