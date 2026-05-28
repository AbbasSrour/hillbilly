# AdminApi

All URIs are relative to _http://localhost_

| Method                                                                      | HTTP request                                  | Description |
| --------------------------------------------------------------------------- | --------------------------------------------- | ----------- |
| [**adminListUserSessions**](#adminlistusersessions)                         | **POST** /api/auth/admin/list-user-sessions   |             |
| [**adminUpdateUser**](#adminupdateuser)                                     | **POST** /api/auth/admin/update-user          |             |
| [**apiAuthAdminHasPermissionPost**](#apiauthadminhaspermissionpost)         | **POST** /api/auth/admin/has-permission       |             |
| [**apiAuthAdminStopImpersonatingPost**](#apiauthadminstopimpersonatingpost) | **POST** /api/auth/admin/stop-impersonating   |             |
| [**banUser**](#banuser)                                                     | **POST** /api/auth/admin/ban-user             |             |
| [**createUser**](#createuser)                                               | **POST** /api/auth/admin/create-user          |             |
| [**getUser**](#getuser)                                                     | **GET** /api/auth/admin/get-user              |             |
| [**impersonateUser**](#impersonateuser)                                     | **POST** /api/auth/admin/impersonate-user     |             |
| [**listUsers**](#listusers)                                                 | **GET** /api/auth/admin/list-users            |             |
| [**removeUser**](#removeuser)                                               | **POST** /api/auth/admin/remove-user          |             |
| [**revokeUserSession**](#revokeusersession)                                 | **POST** /api/auth/admin/revoke-user-session  |             |
| [**revokeUserSessions**](#revokeusersessions)                               | **POST** /api/auth/admin/revoke-user-sessions |             |
| [**setUserPassword**](#setuserpassword)                                     | **POST** /api/auth/admin/set-user-password    |             |
| [**setUserRole**](#setuserrole)                                             | **POST** /api/auth/admin/set-role             |             |
| [**unbanUser**](#unbanuser)                                                 | **POST** /api/auth/admin/unban-user           |             |

# **adminListUserSessions**

> AdminListUserSessions200Response adminListUserSessions(adminListUserSessionsRequest)

List user sessions

### Example

```typescript
import { AdminApi, Configuration, AdminListUserSessionsRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let adminListUserSessionsRequest: AdminListUserSessionsRequest; //

const { status, data } = await apiInstance.adminListUserSessions(adminListUserSessionsRequest);
```

### Parameters

| Name                             | Type                             | Description | Notes |
| -------------------------------- | -------------------------------- | ----------- | ----- |
| **adminListUserSessionsRequest** | **AdminListUserSessionsRequest** |             |       |

### Return type

**AdminListUserSessions200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | List of user sessions                                                                    | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUpdateUser**

> UpdateUser200Response adminUpdateUser(adminUpdateUserRequest)

Update a user\'s details

### Example

```typescript
import { AdminApi, Configuration, AdminUpdateUserRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let adminUpdateUserRequest: AdminUpdateUserRequest; //

const { status, data } = await apiInstance.adminUpdateUser(adminUpdateUserRequest);
```

### Parameters

| Name                       | Type                       | Description | Notes |
| -------------------------- | -------------------------- | ----------- | ----- |
| **adminUpdateUserRequest** | **AdminUpdateUserRequest** |             |       |

### Return type

**UpdateUser200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | User updated                                                                             | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthAdminHasPermissionPost**

> ApiAuthAdminHasPermissionPost200Response apiAuthAdminHasPermissionPost()

Check if the user has permission

### Example

```typescript
import { AdminApi, Configuration, ApiAuthAdminHasPermissionPostRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let apiAuthAdminHasPermissionPostRequest: ApiAuthAdminHasPermissionPostRequest; // (optional)

const { status, data } = await apiInstance.apiAuthAdminHasPermissionPost(
  apiAuthAdminHasPermissionPostRequest,
);
```

### Parameters

| Name                                     | Type                                     | Description | Notes |
| ---------------------------------------- | ---------------------------------------- | ----------- | ----- |
| **apiAuthAdminHasPermissionPostRequest** | **ApiAuthAdminHasPermissionPostRequest** |             |       |

### Return type

**ApiAuthAdminHasPermissionPost200Response**

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

# **apiAuthAdminStopImpersonatingPost**

> apiAuthAdminStopImpersonatingPost()

### Example

```typescript
import { AdminApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.apiAuthAdminStopImpersonatingPost();
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **banUser**

> UpdateUser200Response banUser(banUserRequest)

Ban a user

### Example

```typescript
import { AdminApi, Configuration, BanUserRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let banUserRequest: BanUserRequest; //

const { status, data } = await apiInstance.banUser(banUserRequest);
```

### Parameters

| Name               | Type               | Description | Notes |
| ------------------ | ------------------ | ----------- | ----- |
| **banUserRequest** | **BanUserRequest** |             |       |

### Return type

**UpdateUser200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | User banned                                                                              | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createUser**

> UpdateUser200Response createUser(createUserRequest)

Create a new user

### Example

```typescript
import { AdminApi, Configuration, CreateUserRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let createUserRequest: CreateUserRequest; //

const { status, data } = await apiInstance.createUser(createUserRequest);
```

### Parameters

| Name                  | Type                  | Description | Notes |
| --------------------- | --------------------- | ----------- | ----- |
| **createUserRequest** | **CreateUserRequest** |             |       |

### Return type

**UpdateUser200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | User created                                                                             | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUser**

> UpdateUser200Response getUser()

Get an existing user

### Example

```typescript
import { AdminApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let id: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getUser(id);
```

### Parameters

| Name   | Type         | Description | Notes                            |
| ------ | ------------ | ----------- | -------------------------------- |
| **id** | [**string**] |             | (optional) defaults to undefined |

### Return type

**UpdateUser200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | User                                                                                     | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **impersonateUser**

> ImpersonateUser200Response impersonateUser(adminListUserSessionsRequest)

Impersonate a user

### Example

```typescript
import { AdminApi, Configuration, AdminListUserSessionsRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let adminListUserSessionsRequest: AdminListUserSessionsRequest; //

const { status, data } = await apiInstance.impersonateUser(adminListUserSessionsRequest);
```

### Parameters

| Name                             | Type                             | Description | Notes |
| -------------------------------- | -------------------------------- | ----------- | ----- |
| **adminListUserSessionsRequest** | **AdminListUserSessionsRequest** |             |       |

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
| **200**     | Impersonation session created                                                            | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listUsers**

> ListUsers200Response listUsers()

List users

### Example

```typescript
import { AdminApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let searchValue: string; // (optional) (default to undefined)
let searchField: string; // (optional) (default to undefined)
let searchOperator: string; // (optional) (default to undefined)
let limit: string; // (optional) (default to undefined)
let offset: string; // (optional) (default to undefined)
let sortBy: string; // (optional) (default to undefined)
let sortDirection: string; // (optional) (default to undefined)
let filterField: string; // (optional) (default to undefined)
let filterValue: string; // (optional) (default to undefined)
let filterOperator: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.listUsers(
  searchValue,
  searchField,
  searchOperator,
  limit,
  offset,
  sortBy,
  sortDirection,
  filterField,
  filterValue,
  filterOperator,
);
```

### Parameters

| Name               | Type         | Description | Notes                            |
| ------------------ | ------------ | ----------- | -------------------------------- |
| **searchValue**    | [**string**] |             | (optional) defaults to undefined |
| **searchField**    | [**string**] |             | (optional) defaults to undefined |
| **searchOperator** | [**string**] |             | (optional) defaults to undefined |
| **limit**          | [**string**] |             | (optional) defaults to undefined |
| **offset**         | [**string**] |             | (optional) defaults to undefined |
| **sortBy**         | [**string**] |             | (optional) defaults to undefined |
| **sortDirection**  | [**string**] |             | (optional) defaults to undefined |
| **filterField**    | [**string**] |             | (optional) defaults to undefined |
| **filterValue**    | [**string**] |             | (optional) defaults to undefined |
| **filterOperator** | [**string**] |             | (optional) defaults to undefined |

### Return type

**ListUsers200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | List of users                                                                            | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **removeUser**

> SignOut200Response removeUser(adminListUserSessionsRequest)

Delete a user and all their sessions and accounts. Cannot be undone.

### Example

```typescript
import { AdminApi, Configuration, AdminListUserSessionsRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let adminListUserSessionsRequest: AdminListUserSessionsRequest; //

const { status, data } = await apiInstance.removeUser(adminListUserSessionsRequest);
```

### Parameters

| Name                             | Type                             | Description | Notes |
| -------------------------------- | -------------------------------- | ----------- | ----- |
| **adminListUserSessionsRequest** | **AdminListUserSessionsRequest** |             |       |

### Return type

**SignOut200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | User removed                                                                             | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **revokeUserSession**

> SignOut200Response revokeUserSession(revokeUserSessionRequest)

Revoke a user session

### Example

```typescript
import { AdminApi, Configuration, RevokeUserSessionRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let revokeUserSessionRequest: RevokeUserSessionRequest; //

const { status, data } = await apiInstance.revokeUserSession(revokeUserSessionRequest);
```

### Parameters

| Name                         | Type                         | Description | Notes |
| ---------------------------- | ---------------------------- | ----------- | ----- |
| **revokeUserSessionRequest** | **RevokeUserSessionRequest** |             |       |

### Return type

**SignOut200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Session revoked                                                                          | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **revokeUserSessions**

> SignOut200Response revokeUserSessions(adminListUserSessionsRequest)

Revoke all user sessions

### Example

```typescript
import { AdminApi, Configuration, AdminListUserSessionsRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let adminListUserSessionsRequest: AdminListUserSessionsRequest; //

const { status, data } = await apiInstance.revokeUserSessions(adminListUserSessionsRequest);
```

### Parameters

| Name                             | Type                             | Description | Notes |
| -------------------------------- | -------------------------------- | ----------- | ----- |
| **adminListUserSessionsRequest** | **AdminListUserSessionsRequest** |             |       |

### Return type

**SignOut200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Sessions revoked                                                                         | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setUserPassword**

> ResetPassword200Response setUserPassword(setUserPasswordRequest)

Set a user\'s password

### Example

```typescript
import { AdminApi, Configuration, SetUserPasswordRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let setUserPasswordRequest: SetUserPasswordRequest; //

const { status, data } = await apiInstance.setUserPassword(setUserPasswordRequest);
```

### Parameters

| Name                       | Type                       | Description | Notes |
| -------------------------- | -------------------------- | ----------- | ----- |
| **setUserPasswordRequest** | **SetUserPasswordRequest** |             |       |

### Return type

**ResetPassword200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Password set                                                                             | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setUserRole**

> UpdateUser200Response setUserRole(setUserRoleRequest)

Set the role of a user

### Example

```typescript
import { AdminApi, Configuration, SetUserRoleRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let setUserRoleRequest: SetUserRoleRequest; //

const { status, data } = await apiInstance.setUserRole(setUserRoleRequest);
```

### Parameters

| Name                   | Type                   | Description | Notes |
| ---------------------- | ---------------------- | ----------- | ----- |
| **setUserRoleRequest** | **SetUserRoleRequest** |             |       |

### Return type

**UpdateUser200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | User role updated                                                                        | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **unbanUser**

> UpdateUser200Response unbanUser(adminListUserSessionsRequest)

Unban a user

### Example

```typescript
import { AdminApi, Configuration, AdminListUserSessionsRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let adminListUserSessionsRequest: AdminListUserSessionsRequest; //

const { status, data } = await apiInstance.unbanUser(adminListUserSessionsRequest);
```

### Parameters

| Name                             | Type                             | Description | Notes |
| -------------------------------- | -------------------------------- | ----------- | ----- |
| **adminListUserSessionsRequest** | **AdminListUserSessionsRequest** |             |       |

### Return type

**UpdateUser200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | User unbanned                                                                            | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
