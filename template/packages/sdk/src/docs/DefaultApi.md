# DefaultApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiAuthAccountInfoGet**](#apiauthaccountinfoget) | **GET** /api/auth/account-info | |
|[**apiAuthDeleteUserCallbackGet**](#apiauthdeleteusercallbackget) | **GET** /api/auth/delete-user/callback | |
|[**apiAuthErrorGet**](#apiautherrorget) | **GET** /api/auth/error | |
|[**apiAuthGetAccessTokenPost**](#apiauthgetaccesstokenpost) | **POST** /api/auth/get-access-token | |
|[**apiAuthOkGet**](#apiauthokget) | **GET** /api/auth/ok | |
|[**apiAuthRefreshTokenPost**](#apiauthrefreshtokenpost) | **POST** /api/auth/refresh-token | |
|[**apiAuthRevokeOtherSessionsPost**](#apiauthrevokeothersessionspost) | **POST** /api/auth/revoke-other-sessions | |
|[**apiAuthRevokeSessionPost**](#apiauthrevokesessionpost) | **POST** /api/auth/revoke-session | |
|[**apiAuthRevokeSessionsPost**](#apiauthrevokesessionspost) | **POST** /api/auth/revoke-sessions | |
|[**apiAuthUnlinkAccountPost**](#apiauthunlinkaccountpost) | **POST** /api/auth/unlink-account | |
|[**apiAuthVerifyEmailGet**](#apiauthverifyemailget) | **GET** /api/auth/verify-email | |
|[**changeEmail**](#changeemail) | **POST** /api/auth/change-email | |
|[**changePassword**](#changepassword) | **POST** /api/auth/change-password | |
|[**deleteUser**](#deleteuser) | **POST** /api/auth/delete-user | |
|[**getSession**](#getsession) | **GET** /api/auth/get-session | |
|[**linkSocialAccount**](#linksocialaccount) | **POST** /api/auth/link-social | |
|[**listUserAccounts**](#listuseraccounts) | **GET** /api/auth/list-accounts | |
|[**listUserSessions**](#listusersessions) | **GET** /api/auth/list-sessions | |
|[**requestPasswordReset**](#requestpasswordreset) | **POST** /api/auth/request-password-reset | |
|[**resetPassword**](#resetpassword) | **POST** /api/auth/reset-password | |
|[**resetPasswordCallback**](#resetpasswordcallback) | **GET** /api/auth/reset-password/{token} | |
|[**sendVerificationEmail**](#sendverificationemail) | **POST** /api/auth/send-verification-email | |
|[**signInEmail**](#signinemail) | **POST** /api/auth/sign-in/email | |
|[**signOut**](#signout) | **POST** /api/auth/sign-out | |
|[**signUpWithEmailAndPassword**](#signupwithemailandpassword) | **POST** /api/auth/sign-up/email | |
|[**socialSignIn**](#socialsignin) | **POST** /api/auth/sign-in/social | |
|[**updateUser**](#updateuser) | **POST** /api/auth/update-user | |
|[**verifyPassword**](#verifypassword) | **POST** /api/auth/verify-password | |

# **apiAuthAccountInfoGet**
> ApiAuthAccountInfoGet200Response apiAuthAccountInfoGet()

Get the account info provided by the provider

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.apiAuthAccountInfoGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiAuthAccountInfoGet200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthDeleteUserCallbackGet**
> ApiAuthDeleteUserCallbackGet200Response apiAuthDeleteUserCallbackGet()

Callback to complete user deletion with verification token

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let token: string; // (optional) (default to undefined)
let callbackURL: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiAuthDeleteUserCallbackGet(
    token,
    callbackURL
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **token** | [**string**] |  | (optional) defaults to undefined|
| **callbackURL** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ApiAuthDeleteUserCallbackGet200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User successfully deleted |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthErrorGet**
> string apiAuthErrorGet()

Displays an error page

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.apiAuthErrorGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/html, application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthGetAccessTokenPost**
> ApiAuthGetAccessTokenPost200Response apiAuthGetAccessTokenPost(apiAuthRefreshTokenPostRequest)

Get a valid access token, doing a refresh if needed

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ApiAuthRefreshTokenPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let apiAuthRefreshTokenPostRequest: ApiAuthRefreshTokenPostRequest; //

const { status, data } = await apiInstance.apiAuthGetAccessTokenPost(
    apiAuthRefreshTokenPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **apiAuthRefreshTokenPostRequest** | **ApiAuthRefreshTokenPostRequest**|  | |


### Return type

**ApiAuthGetAccessTokenPost200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A Valid access token |  -  |
|**400** | Invalid refresh token or provider configuration |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthOkGet**
> ApiAuthOkGet200Response apiAuthOkGet()

Check if the API is working

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.apiAuthOkGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiAuthOkGet200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | API is working |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthRefreshTokenPost**
> ApiAuthRefreshTokenPost200Response apiAuthRefreshTokenPost(apiAuthRefreshTokenPostRequest)

Refresh the access token using a refresh token

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ApiAuthRefreshTokenPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let apiAuthRefreshTokenPostRequest: ApiAuthRefreshTokenPostRequest; //

const { status, data } = await apiInstance.apiAuthRefreshTokenPost(
    apiAuthRefreshTokenPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **apiAuthRefreshTokenPostRequest** | **ApiAuthRefreshTokenPostRequest**|  | |


### Return type

**ApiAuthRefreshTokenPost200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Access token refreshed successfully |  -  |
|**400** | Invalid refresh token or provider configuration |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthRevokeOtherSessionsPost**
> ApiAuthRevokeOtherSessionsPost200Response apiAuthRevokeOtherSessionsPost()

Revoke all other sessions for the user except the current one

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let body: object; // (optional)

const { status, data } = await apiInstance.apiAuthRevokeOtherSessionsPost(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |


### Return type

**ApiAuthRevokeOtherSessionsPost200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthRevokeSessionPost**
> ApiAuthRevokeSessionPost200Response apiAuthRevokeSessionPost()

Revoke a single session

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ApiAuthRevokeSessionPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let apiAuthRevokeSessionPostRequest: ApiAuthRevokeSessionPostRequest; // (optional)

const { status, data } = await apiInstance.apiAuthRevokeSessionPost(
    apiAuthRevokeSessionPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **apiAuthRevokeSessionPostRequest** | **ApiAuthRevokeSessionPostRequest**|  | |


### Return type

**ApiAuthRevokeSessionPost200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthRevokeSessionsPost**
> ApiAuthRevokeSessionsPost200Response apiAuthRevokeSessionsPost()

Revoke all sessions for the user

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let body: object; // (optional)

const { status, data } = await apiInstance.apiAuthRevokeSessionsPost(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |


### Return type

**ApiAuthRevokeSessionsPost200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthUnlinkAccountPost**
> ResetPassword200Response apiAuthUnlinkAccountPost(apiAuthUnlinkAccountPostRequest)

Unlink an account

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ApiAuthUnlinkAccountPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let apiAuthUnlinkAccountPostRequest: ApiAuthUnlinkAccountPostRequest; //

const { status, data } = await apiInstance.apiAuthUnlinkAccountPost(
    apiAuthUnlinkAccountPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **apiAuthUnlinkAccountPostRequest** | **ApiAuthUnlinkAccountPostRequest**|  | |


### Return type

**ResetPassword200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthVerifyEmailGet**
> ApiAuthVerifyEmailGet200Response apiAuthVerifyEmailGet()

Verify the email of the user

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let token: string; //The token to verify the email (default to undefined)
let callbackURL: string; //The URL to redirect to after email verification (optional) (default to undefined)

const { status, data } = await apiInstance.apiAuthVerifyEmailGet(
    token,
    callbackURL
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **token** | [**string**] | The token to verify the email | defaults to undefined|
| **callbackURL** | [**string**] | The URL to redirect to after email verification | (optional) defaults to undefined|


### Return type

**ApiAuthVerifyEmailGet200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **changeEmail**
> ChangeEmail200Response changeEmail(changeEmailRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ChangeEmailRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let changeEmailRequest: ChangeEmailRequest; //

const { status, data } = await apiInstance.changeEmail(
    changeEmailRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **changeEmailRequest** | **ChangeEmailRequest**|  | |


### Return type

**ChangeEmail200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Email change request processed successfully |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**422** | Unprocessable Entity. Email already exists |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **changePassword**
> ChangePassword200Response changePassword(changePasswordRequest)

Change the password of the user

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ChangePasswordRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let changePasswordRequest: ChangePasswordRequest; //

const { status, data } = await apiInstance.changePassword(
    changePasswordRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **changePasswordRequest** | **ChangePasswordRequest**|  | |


### Return type

**ChangePassword200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Password successfully changed |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteUser**
> DeleteUser200Response deleteUser()

Delete the user

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    DeleteUserRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let deleteUserRequest: DeleteUserRequest; // (optional)

const { status, data } = await apiInstance.deleteUser(
    deleteUserRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deleteUserRequest** | **DeleteUserRequest**|  | |


### Return type

**DeleteUser200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User deletion processed successfully |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSession**
> GetSession200Response getSession()

Get the current session

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.getSession();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetSession200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **linkSocialAccount**
> LinkSocialAccount200Response linkSocialAccount(linkSocialAccountRequest)

Link a social account to the user

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    LinkSocialAccountRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let linkSocialAccountRequest: LinkSocialAccountRequest; //

const { status, data } = await apiInstance.linkSocialAccount(
    linkSocialAccountRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **linkSocialAccountRequest** | **LinkSocialAccountRequest**|  | |


### Return type

**LinkSocialAccount200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listUserAccounts**
> Array<ListUserAccounts200ResponseInner> listUserAccounts()

List all accounts linked to the user

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.listUserAccounts();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ListUserAccounts200ResponseInner>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listUserSessions**
> Array<Session> listUserSessions()

List all active sessions for the user

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.listUserSessions();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Session>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestPasswordReset**
> RequestPasswordReset200Response requestPasswordReset(requestPasswordResetRequest)

Send a password reset email to the user

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    RequestPasswordResetRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let requestPasswordResetRequest: RequestPasswordResetRequest; //

const { status, data } = await apiInstance.requestPasswordReset(
    requestPasswordResetRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestPasswordResetRequest** | **RequestPasswordResetRequest**|  | |


### Return type

**RequestPasswordReset200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **resetPassword**
> ResetPassword200Response resetPassword(resetPasswordRequest)

Reset the password for a user

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    ResetPasswordRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let resetPasswordRequest: ResetPasswordRequest; //

const { status, data } = await apiInstance.resetPassword(
    resetPasswordRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resetPasswordRequest** | **ResetPasswordRequest**|  | |


### Return type

**ResetPassword200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **resetPasswordCallback**
> ResetPasswordCallback200Response resetPasswordCallback()

Redirects the user to the callback URL with the token

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let token: string; //The token to reset the password (default to undefined)
let callbackURL: string; //The URL to redirect the user to reset their password (default to undefined)

const { status, data } = await apiInstance.resetPasswordCallback(
    token,
    callbackURL
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **token** | [**string**] | The token to reset the password | defaults to undefined|
| **callbackURL** | [**string**] | The URL to redirect the user to reset their password | defaults to undefined|


### Return type

**ResetPasswordCallback200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sendVerificationEmail**
> SendVerificationEmail200Response sendVerificationEmail()

Send a verification email to the user

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    SendVerificationEmailRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let sendVerificationEmailRequest: SendVerificationEmailRequest; // (optional)

const { status, data } = await apiInstance.sendVerificationEmail(
    sendVerificationEmailRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendVerificationEmailRequest** | **SendVerificationEmailRequest**|  | |


### Return type

**SendVerificationEmail200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **signInEmail**
> SignInEmail200Response signInEmail(signInEmailRequest)

Sign in with email and password

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    SignInEmailRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let signInEmailRequest: SignInEmailRequest; //

const { status, data } = await apiInstance.signInEmail(
    signInEmailRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **signInEmailRequest** | **SignInEmailRequest**|  | |


### Return type

**SignInEmail200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success - Returns either session details or redirect URL |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **signOut**
> SignOut200Response signOut()

Sign out the current user

### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let body: object; // (optional)

const { status, data } = await apiInstance.signOut(
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **object**|  | |


### Return type

**SignOut200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **signUpWithEmailAndPassword**
> SignUpWithEmailAndPassword200Response signUpWithEmailAndPassword()

Sign up a user using email and password

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    SignUpWithEmailAndPasswordRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let signUpWithEmailAndPasswordRequest: SignUpWithEmailAndPasswordRequest; // (optional)

const { status, data } = await apiInstance.signUpWithEmailAndPassword(
    signUpWithEmailAndPasswordRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **signUpWithEmailAndPasswordRequest** | **SignUpWithEmailAndPasswordRequest**|  | |


### Return type

**SignUpWithEmailAndPassword200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully created user |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**422** | Unprocessable Entity. User already exists or failed to create user. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **socialSignIn**
> SocialSignIn200Response socialSignIn(socialSignInRequest)

Sign in with a social provider

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    SocialSignInRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let socialSignInRequest: SocialSignInRequest; //

const { status, data } = await apiInstance.socialSignIn(
    socialSignInRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **socialSignInRequest** | **SocialSignInRequest**|  | |


### Return type

**SocialSignIn200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success - Returns either session details or redirect URL |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateUser**
> UpdateUser200Response updateUser()

Update the current user

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    UpdateUserRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let updateUserRequest: UpdateUserRequest; // (optional)

const { status, data } = await apiInstance.updateUser(
    updateUserRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateUserRequest** | **UpdateUserRequest**|  | |


### Return type

**UpdateUser200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyPassword**
> ResetPassword200Response verifyPassword(verifyPasswordRequest)

Verify the current user\'s password

### Example

```typescript
import {
    DefaultApi,
    Configuration,
    VerifyPasswordRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let verifyPasswordRequest: VerifyPasswordRequest; //

const { status, data } = await apiInstance.verifyPassword(
    verifyPasswordRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **verifyPasswordRequest** | **VerifyPasswordRequest**|  | |


### Return type

**ResetPassword200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Success |  -  |
|**400** | Bad Request. Usually due to missing parameters, or invalid parameters. |  -  |
|**401** | Unauthorized. Due to missing or invalid authentication. |  -  |
|**403** | Forbidden. You do not have permission to access this resource or to perform this action. |  -  |
|**404** | Not Found. The requested resource was not found. |  -  |
|**429** | Too Many Requests. You have exceeded the rate limit. Try again later. |  -  |
|**500** | Internal Server Error. This is a problem with the server that you cannot fix. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

