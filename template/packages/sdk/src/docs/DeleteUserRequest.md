# DeleteUserRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**callbackURL** | **string** | The callback URL to redirect to after the user is deleted | [optional] [default to undefined]
**password** | **string** | The user\&#39;s password. Required if session is not fresh | [optional] [default to undefined]
**token** | **string** | The deletion verification token | [optional] [default to undefined]

## Example

```typescript
import { DeleteUserRequest } from './api';

const instance: DeleteUserRequest = {
    callbackURL,
    password,
    token,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
