# CreateUserDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email** | **string** |  | [optional] [default to undefined]
**phoneNumber** | **string** |  | [optional] [default to undefined]
**password** | **string** |  | [optional] [default to undefined]
**role** | **string** |  | [default to undefined]
**profile** | [**CreateProfileDto**](CreateProfileDto.md) |  | [default to undefined]

## Example

```typescript
import { CreateUserDto } from './api';

const instance: CreateUserDto = {
    email,
    phoneNumber,
    password,
    role,
    profile,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
