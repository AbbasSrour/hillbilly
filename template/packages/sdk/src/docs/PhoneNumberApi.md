# PhoneNumberApi

All URIs are relative to _http://localhost_

| Method                                                                                        | HTTP request                                           | Description |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------- |
| [**apiAuthPhoneNumberRequestPasswordResetPost**](#apiauthphonenumberrequestpasswordresetpost) | **POST** /api/auth/phone-number/request-password-reset |             |
| [**apiAuthPhoneNumberResetPasswordPost**](#apiauthphonenumberresetpasswordpost)               | **POST** /api/auth/phone-number/reset-password         |             |
| [**apiAuthPhoneNumberSendOtpPost**](#apiauthphonenumbersendotppost)                           | **POST** /api/auth/phone-number/send-otp               |             |
| [**apiAuthPhoneNumberVerifyPost**](#apiauthphonenumberverifypost)                             | **POST** /api/auth/phone-number/verify                 |             |
| [**apiAuthSignInPhoneNumberPost**](#apiauthsigninphonenumberpost)                             | **POST** /api/auth/sign-in/phone-number                |             |

# **apiAuthPhoneNumberRequestPasswordResetPost**

> ApiAuthPhoneNumberRequestPasswordResetPost200Response apiAuthPhoneNumberRequestPasswordResetPost(apiAuthPhoneNumberRequestPasswordResetPostRequest)

Request OTP for password reset via phone number

### Example

```typescript
import {
  PhoneNumberApi,
  Configuration,
  ApiAuthPhoneNumberRequestPasswordResetPostRequest,
} from "./api";

const configuration = new Configuration();
const apiInstance = new PhoneNumberApi(configuration);

let apiAuthPhoneNumberRequestPasswordResetPostRequest: ApiAuthPhoneNumberRequestPasswordResetPostRequest; //

const { status, data } = await apiInstance.apiAuthPhoneNumberRequestPasswordResetPost(
  apiAuthPhoneNumberRequestPasswordResetPostRequest,
);
```

### Parameters

| Name                                                  | Type                                                  | Description | Notes |
| ----------------------------------------------------- | ----------------------------------------------------- | ----------- | ----- |
| **apiAuthPhoneNumberRequestPasswordResetPostRequest** | **ApiAuthPhoneNumberRequestPasswordResetPostRequest** |             |       |

### Return type

**ApiAuthPhoneNumberRequestPasswordResetPost200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | OTP sent successfully for password reset                                                 | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthPhoneNumberResetPasswordPost**

> ApiAuthPhoneNumberResetPasswordPost200Response apiAuthPhoneNumberResetPasswordPost(apiAuthPhoneNumberResetPasswordPostRequest)

Reset password using phone number OTP

### Example

```typescript
import { PhoneNumberApi, Configuration, ApiAuthPhoneNumberResetPasswordPostRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new PhoneNumberApi(configuration);

let apiAuthPhoneNumberResetPasswordPostRequest: ApiAuthPhoneNumberResetPasswordPostRequest; //

const { status, data } = await apiInstance.apiAuthPhoneNumberResetPasswordPost(
  apiAuthPhoneNumberResetPasswordPostRequest,
);
```

### Parameters

| Name                                           | Type                                           | Description | Notes |
| ---------------------------------------------- | ---------------------------------------------- | ----------- | ----- |
| **apiAuthPhoneNumberResetPasswordPostRequest** | **ApiAuthPhoneNumberResetPasswordPostRequest** |             |       |

### Return type

**ApiAuthPhoneNumberResetPasswordPost200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Password reset successfully                                                              | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthPhoneNumberSendOtpPost**

> SocialSignIn403Response apiAuthPhoneNumberSendOtpPost(apiAuthPhoneNumberSendOtpPostRequest)

Use this endpoint to send OTP to phone number

### Example

```typescript
import { PhoneNumberApi, Configuration, ApiAuthPhoneNumberSendOtpPostRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new PhoneNumberApi(configuration);

let apiAuthPhoneNumberSendOtpPostRequest: ApiAuthPhoneNumberSendOtpPostRequest; //

const { status, data } = await apiInstance.apiAuthPhoneNumberSendOtpPost(
  apiAuthPhoneNumberSendOtpPostRequest,
);
```

### Parameters

| Name                                     | Type                                     | Description | Notes |
| ---------------------------------------- | ---------------------------------------- | ----------- | ----- |
| **apiAuthPhoneNumberSendOtpPostRequest** | **ApiAuthPhoneNumberSendOtpPostRequest** |             |       |

### Return type

**SocialSignIn403Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Success                                                                                  | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthPhoneNumberVerifyPost**

> ApiAuthPhoneNumberVerifyPost200Response apiAuthPhoneNumberVerifyPost(apiAuthPhoneNumberVerifyPostRequest)

Use this endpoint to verify phone number

### Example

```typescript
import { PhoneNumberApi, Configuration, ApiAuthPhoneNumberVerifyPostRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new PhoneNumberApi(configuration);

let apiAuthPhoneNumberVerifyPostRequest: ApiAuthPhoneNumberVerifyPostRequest; //

const { status, data } = await apiInstance.apiAuthPhoneNumberVerifyPost(
  apiAuthPhoneNumberVerifyPostRequest,
);
```

### Parameters

| Name                                    | Type                                    | Description | Notes |
| --------------------------------------- | --------------------------------------- | ----------- | ----- |
| **apiAuthPhoneNumberVerifyPostRequest** | **ApiAuthPhoneNumberVerifyPostRequest** |             |       |

### Return type

**ApiAuthPhoneNumberVerifyPost200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Phone number verified successfully                                                       | -                |
| **400**     | Invalid OTP                                                                              | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthSignInPhoneNumberPost**

> ImpersonateUser200Response apiAuthSignInPhoneNumberPost(apiAuthSignInPhoneNumberPostRequest)

Use this endpoint to sign in with phone number

### Example

```typescript
import { PhoneNumberApi, Configuration, ApiAuthSignInPhoneNumberPostRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new PhoneNumberApi(configuration);

let apiAuthSignInPhoneNumberPostRequest: ApiAuthSignInPhoneNumberPostRequest; //

const { status, data } = await apiInstance.apiAuthSignInPhoneNumberPost(
  apiAuthSignInPhoneNumberPostRequest,
);
```

### Parameters

| Name                                    | Type                                    | Description | Notes |
| --------------------------------------- | --------------------------------------- | ----------- | ----- |
| **apiAuthSignInPhoneNumberPostRequest** | **ApiAuthSignInPhoneNumberPostRequest** |             |       |

### Return type

**ImpersonateUser200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Success                                                                                  | -                |
| **400**     | Invalid phone number or password                                                         | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
