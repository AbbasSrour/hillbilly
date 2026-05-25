# SocialSignInRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**callbackURL** | **string** | Callback URL to redirect to after the user has signed in | [optional] [default to undefined]
**newUserCallbackURL** | **string** |  | [optional] [default to undefined]
**errorCallbackURL** | **string** | Callback URL to redirect to if an error happens | [optional] [default to undefined]
**provider** | **string** |  | [default to undefined]
**disableRedirect** | **boolean** | Disable automatic redirection to the provider. Useful for handling the redirection yourself | [optional] [default to undefined]
**idToken** | [**SocialSignInRequestIdToken**](SocialSignInRequestIdToken.md) |  | [optional] [default to undefined]
**scopes** | **Array&lt;any&gt;** | Array of scopes to request from the provider. This will override the default scopes passed. | [optional] [default to undefined]
**requestSignUp** | **boolean** | Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider | [optional] [default to undefined]
**loginHint** | **string** | The login hint to use for the authorization code request | [optional] [default to undefined]
**additionalData** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { SocialSignInRequest } from './api';

const instance: SocialSignInRequest = {
    callbackURL,
    newUserCallbackURL,
    errorCallbackURL,
    provider,
    disableRedirect,
    idToken,
    scopes,
    requestSignUp,
    loginHint,
    additionalData,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
