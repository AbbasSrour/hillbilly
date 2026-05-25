# ApiAuthPhoneNumberResetPasswordPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**otp** | **string** | The one time password to reset the password. Eg: \&quot;123456\&quot; | [default to undefined]
**phoneNumber** | **string** | The phone number to the account which intends to reset the password for. Eg: \&quot;+1234567890\&quot; | [default to undefined]
**newPassword** | **string** | The new password. Eg: \&quot;new-and-secure-password\&quot; | [default to undefined]

## Example

```typescript
import { ApiAuthPhoneNumberResetPasswordPostRequest } from './api';

const instance: ApiAuthPhoneNumberResetPasswordPostRequest = {
    otp,
    phoneNumber,
    newPassword,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
