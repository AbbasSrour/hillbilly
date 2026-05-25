# OrganizationBanDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**banned** | **boolean** | Whether the organization is banned | [optional] [default to undefined]
**banReason** | **string** | Reason for the ban (if banned) | [optional] [default to undefined]
**banExpires** | **string** | Expiration date of the ban (if banned) | [optional] [default to undefined]

## Example

```typescript
import { OrganizationBanDto } from './api';

const instance: OrganizationBanDto = {
    banned,
    banReason,
    banExpires,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
