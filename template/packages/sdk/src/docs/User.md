# User


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**name** | **string** |  | [default to undefined]
**email** | **string** |  | [default to undefined]
**emailVerified** | **boolean** |  | [optional] [readonly] [default to false]
**image** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to Generated at runtime]
**updatedAt** | **string** |  | [default to Generated at runtime]
**role** | **string** |  | [optional] [readonly] [default to undefined]
**banned** | **boolean** |  | [optional] [readonly] [default to false]
**banReason** | **string** |  | [optional] [readonly] [default to undefined]
**banExpires** | **string** |  | [optional] [readonly] [default to undefined]
**phoneNumber** | **string** |  | [optional] [default to undefined]
**phoneNumberVerified** | **boolean** |  | [optional] [readonly] [default to undefined]

## Example

```typescript
import { User } from './api';

const instance: User = {
    id,
    name,
    email,
    emailVerified,
    image,
    createdAt,
    updatedAt,
    role,
    banned,
    banReason,
    banExpires,
    phoneNumber,
    phoneNumberVerified,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
