# SocialSignIn200Response

Returns session details when idToken is provided, or an authorize URL otherwise

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token** | **string** |  | [optional] [default to undefined]
**user** | [**User**](.md) |  | [optional] [default to undefined]
**url** | **string** |  | [optional] [default to undefined]
**redirect** | **boolean** |  | [default to undefined]

## Example

```typescript
import { SocialSignIn200Response } from './api';

const instance: SocialSignIn200Response = {
    token,
    user,
    url,
    redirect,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
