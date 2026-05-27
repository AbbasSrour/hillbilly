# RbacApi

All URIs are relative to _http://localhost_

| Method                                                                            | HTTP request                                    | Description |
| --------------------------------------------------------------------------------- | ----------------------------------------------- | ----------- |
| [**apiAuthRbacCheckPermissionPost**](#apiauthrbaccheckpermissionpost)             | **POST** /api/auth/rbac/check-permission        |             |
| [**apiAuthRbacPermissionsGet**](#apiauthrbacpermissionsget)                       | **GET** /api/auth/rbac/permissions              |             |
| [**apiAuthRbacRoleDelete**](#apiauthrbacroledelete)                               | **DELETE** /api/auth/rbac/role                  |             |
| [**apiAuthRbacRoleGet**](#apiauthrbacroleget)                                     | **GET** /api/auth/rbac/role                     |             |
| [**apiAuthRbacRolePermissionsAssignPost**](#apiauthrbacrolepermissionsassignpost) | **POST** /api/auth/rbac/role-permissions/assign |             |
| [**apiAuthRbacRolePermissionsGet**](#apiauthrbacrolepermissionsget)               | **GET** /api/auth/rbac/role-permissions         |             |
| [**apiAuthRbacRolePermissionsRemovePost**](#apiauthrbacrolepermissionsremovepost) | **POST** /api/auth/rbac/role-permissions/remove |             |
| [**apiAuthRbacRolePut**](#apiauthrbacroleput)                                     | **PUT** /api/auth/rbac/role                     |             |
| [**apiAuthRbacRolesGet**](#apiauthrbacrolesget)                                   | **GET** /api/auth/rbac/roles                    |             |
| [**apiAuthRbacRolesPost**](#apiauthrbacrolespost)                                 | **POST** /api/auth/rbac/roles                   |             |
| [**apiAuthRbacSyncPost**](#apiauthrbacsyncpost)                                   | **POST** /api/auth/rbac/sync                    |             |
| [**apiAuthRbacUserPermissionsGet**](#apiauthrbacuserpermissionsget)               | **GET** /api/auth/rbac/user-permissions         |             |

# **apiAuthRbacCheckPermissionPost**

> ApiAuthRbacCheckPermissionPost200Response apiAuthRbacCheckPermissionPost()

### Example

```typescript
import { RbacApi, Configuration, ApiAuthRbacCheckPermissionPostRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

let apiAuthRbacCheckPermissionPostRequest: ApiAuthRbacCheckPermissionPostRequest; // (optional)

const { status, data } = await apiInstance.apiAuthRbacCheckPermissionPost(
  apiAuthRbacCheckPermissionPostRequest,
);
```

### Parameters

| Name                                      | Type                                      | Description | Notes |
| ----------------------------------------- | ----------------------------------------- | ----------- | ----- |
| **apiAuthRbacCheckPermissionPostRequest** | **ApiAuthRbacCheckPermissionPostRequest** |             |       |

### Return type

**ApiAuthRbacCheckPermissionPost200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Permission check result                                                                  | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthRbacPermissionsGet**

> ApiAuthRbacPermissionsGet200Response apiAuthRbacPermissionsGet()

### Example

```typescript
import { RbacApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

let limit: string; // (optional) (default to undefined)
let offset: string; // (optional) (default to undefined)
let sortBy: string; // (optional) (default to undefined)
let sortDirection: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiAuthRbacPermissionsGet(
  limit,
  offset,
  sortBy,
  sortDirection,
);
```

### Parameters

| Name              | Type         | Description | Notes                            |
| ----------------- | ------------ | ----------- | -------------------------------- |
| **limit**         | [**string**] |             | (optional) defaults to undefined |
| **offset**        | [**string**] |             | (optional) defaults to undefined |
| **sortBy**        | [**string**] |             | (optional) defaults to undefined |
| **sortDirection** | [**string**] |             | (optional) defaults to undefined |

### Return type

**ApiAuthRbacPermissionsGet200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Permissions list                                                                         | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthRbacRoleDelete**

> apiAuthRbacRoleDelete()

### Example

```typescript
import { RbacApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

const { status, data } = await apiInstance.apiAuthRbacRoleDelete();
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

# **apiAuthRbacRoleGet**

> apiAuthRbacRoleGet()

### Example

```typescript
import { RbacApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

let roleId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiAuthRbacRoleGet(roleId);
```

### Parameters

| Name       | Type         | Description | Notes                            |
| ---------- | ------------ | ----------- | -------------------------------- |
| **roleId** | [**string**] |             | (optional) defaults to undefined |

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

# **apiAuthRbacRolePermissionsAssignPost**

> apiAuthRbacRolePermissionsAssignPost(apiAuthRbacRolePermissionsAssignPostRequest)

### Example

```typescript
import { RbacApi, Configuration, ApiAuthRbacRolePermissionsAssignPostRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

let apiAuthRbacRolePermissionsAssignPostRequest: ApiAuthRbacRolePermissionsAssignPostRequest; //

const { status, data } = await apiInstance.apiAuthRbacRolePermissionsAssignPost(
  apiAuthRbacRolePermissionsAssignPostRequest,
);
```

### Parameters

| Name                                            | Type                                            | Description | Notes |
| ----------------------------------------------- | ----------------------------------------------- | ----------- | ----- |
| **apiAuthRbacRolePermissionsAssignPostRequest** | **ApiAuthRbacRolePermissionsAssignPostRequest** |             |       |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
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

# **apiAuthRbacRolePermissionsGet**

> ApiAuthRbacPermissionsGet200Response apiAuthRbacRolePermissionsGet()

### Example

```typescript
import { RbacApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

let roleId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiAuthRbacRolePermissionsGet(roleId);
```

### Parameters

| Name       | Type         | Description | Notes                            |
| ---------- | ------------ | ----------- | -------------------------------- |
| **roleId** | [**string**] |             | (optional) defaults to undefined |

### Return type

**ApiAuthRbacPermissionsGet200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Role permissions list                                                                    | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthRbacRolePermissionsRemovePost**

> apiAuthRbacRolePermissionsRemovePost(apiAuthRbacRolePermissionsAssignPostRequest)

### Example

```typescript
import { RbacApi, Configuration, ApiAuthRbacRolePermissionsAssignPostRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

let apiAuthRbacRolePermissionsAssignPostRequest: ApiAuthRbacRolePermissionsAssignPostRequest; //

const { status, data } = await apiInstance.apiAuthRbacRolePermissionsRemovePost(
  apiAuthRbacRolePermissionsAssignPostRequest,
);
```

### Parameters

| Name                                            | Type                                            | Description | Notes |
| ----------------------------------------------- | ----------------------------------------------- | ----------- | ----- |
| **apiAuthRbacRolePermissionsAssignPostRequest** | **ApiAuthRbacRolePermissionsAssignPostRequest** |             |       |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
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

# **apiAuthRbacRolePut**

> apiAuthRbacRolePut(apiAuthRbacRolePutRequest)

### Example

```typescript
import { RbacApi, Configuration, ApiAuthRbacRolePutRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

let apiAuthRbacRolePutRequest: ApiAuthRbacRolePutRequest; //

const { status, data } = await apiInstance.apiAuthRbacRolePut(apiAuthRbacRolePutRequest);
```

### Parameters

| Name                          | Type                          | Description | Notes |
| ----------------------------- | ----------------------------- | ----------- | ----- |
| **apiAuthRbacRolePutRequest** | **ApiAuthRbacRolePutRequest** |             |       |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
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

# **apiAuthRbacRolesGet**

> apiAuthRbacRolesGet()

### Example

```typescript
import { RbacApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

let limit: string; // (optional) (default to undefined)
let offset: string; // (optional) (default to undefined)
let sortBy: string; // (optional) (default to undefined)
let sortDirection: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.apiAuthRbacRolesGet(
  limit,
  offset,
  sortBy,
  sortDirection,
);
```

### Parameters

| Name              | Type         | Description | Notes                            |
| ----------------- | ------------ | ----------- | -------------------------------- |
| **limit**         | [**string**] |             | (optional) defaults to undefined |
| **offset**        | [**string**] |             | (optional) defaults to undefined |
| **sortBy**        | [**string**] |             | (optional) defaults to undefined |
| **sortDirection** | [**string**] |             | (optional) defaults to undefined |

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

# **apiAuthRbacRolesPost**

> apiAuthRbacRolesPost(apiAuthRbacRolesPostRequest)

### Example

```typescript
import { RbacApi, Configuration, ApiAuthRbacRolesPostRequest } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

let apiAuthRbacRolesPostRequest: ApiAuthRbacRolesPostRequest; //

const { status, data } = await apiInstance.apiAuthRbacRolesPost(apiAuthRbacRolesPostRequest);
```

### Parameters

| Name                            | Type                            | Description | Notes |
| ------------------------------- | ------------------------------- | ----------- | ----- |
| **apiAuthRbacRolesPostRequest** | **ApiAuthRbacRolesPostRequest** |             |       |

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
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

# **apiAuthRbacSyncPost**

> apiAuthRbacSyncPost()

### Example

```typescript
import { RbacApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

const { status, data } = await apiInstance.apiAuthRbacSyncPost();
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

# **apiAuthRbacUserPermissionsGet**

> ApiAuthRbacUserPermissionsGet200Response apiAuthRbacUserPermissionsGet()

### Example

```typescript
import { RbacApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new RbacApi(configuration);

const { status, data } = await apiInstance.apiAuthRbacUserPermissionsGet();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ApiAuthRbacUserPermissionsGet200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                              | Response headers |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------- |
| **200**     | User permissions                                                                         | -                |
| **400**     | Bad Request. Usually due to missing parameters, or invalid parameters.                   | -                |
| **401**     | Unauthorized. Due to missing or invalid authentication.                                  | -                |
| **403**     | Forbidden. You do not have permission to access this resource or to perform this action. | -                |
| **404**     | Not Found. The requested resource was not found.                                         | -                |
| **429**     | Too Many Requests. You have exceeded the rate limit. Try again later.                    | -                |
| **500**     | Internal Server Error. This is a problem with the server that you cannot fix.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
