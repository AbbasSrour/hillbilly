# LinkSocialAccountRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**callbackURL** | **string** | The URL to redirect to after the user has signed in | [optional] [default to undefined]
**provider** | **string** |  | [default to undefined]
**idToken** | [**LinkSocialAccountRequestIdToken**](LinkSocialAccountRequestIdToken.md) |  | [optional] [default to undefined]
**requestSignUp** | **boolean** |  | [optional] [default to undefined]
**scopes** | **Array&lt;any&gt;** | Additional scopes to request from the provider | [optional] [default to undefined]
**errorCallbackURL** | **string** | The URL to redirect to if there is an error during the link process | [optional] [default to undefined]
**disableRedirect** | **boolean** | Disable automatic redirection to the provider. Useful for handling the redirection yourself | [optional] [default to undefined]
**additionalData** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { LinkSocialAccountRequest } from './api';

const instance: LinkSocialAccountRequest = {
    callbackURL,
    provider,
    idToken,
    requestSignUp,
    scopes,
    errorCallbackURL,
    disableRedirect,
    additionalData,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
