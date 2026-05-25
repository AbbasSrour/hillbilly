# ApiAuthPhoneNumberVerifyPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**phoneNumber** | **string** | Phone number to verify. Eg: \&quot;+1234567890\&quot; | [default to undefined]
**code** | **string** | OTP code. Eg: \&quot;123456\&quot; | [default to undefined]
**disableSession** | **boolean** | Disable session creation after verification. Eg: false | [optional] [default to undefined]
**updatePhoneNumber** | **boolean** | Check if there is a session and update the phone number. Eg: true | [optional] [default to undefined]

## Example

```typescript
import { ApiAuthPhoneNumberVerifyPostRequest } from './api';

const instance: ApiAuthPhoneNumberVerifyPostRequest = {
    phoneNumber,
    code,
    disableSession,
    updatePhoneNumber,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
