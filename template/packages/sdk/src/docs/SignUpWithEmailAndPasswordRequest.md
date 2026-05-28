# SignUpWithEmailAndPasswordRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | The name of the user | [default to undefined]
**email** | **string** | The email of the user | [default to undefined]
**password** | **string** | The password of the user | [default to undefined]
**image** | **string** | The profile image URL of the user | [optional] [default to undefined]
**callbackURL** | **string** | The URL to use for email verification callback | [optional] [default to undefined]
**rememberMe** | **boolean** | If this is false, the session will not be remembered. Default is &#x60;true&#x60;. | [optional] [default to undefined]

## Example

```typescript
import { SignUpWithEmailAndPasswordRequest } from './api';

const instance: SignUpWithEmailAndPasswordRequest = {
    name,
    email,
    password,
    image,
    callbackURL,
    rememberMe,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
