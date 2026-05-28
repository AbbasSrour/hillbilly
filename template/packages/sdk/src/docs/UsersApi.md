# UsersApi

All URIs are relative to _http://localhost_

| Method                                                                      | HTTP request                        | Description |
| --------------------------------------------------------------------------- | ----------------------------------- | ----------- |
| [**userControllerAdminV1**](#usercontrolleradminv1)                         | **GET** /api/v1/users/admin         |             |
| [**userControllerBlockUserV1**](#usercontrollerblockuserv1)                 | **POST** /api/v1/users/{id}/block   |             |
| [**userControllerCreateUserV1**](#usercontrollercreateuserv1)               | **POST** /api/v1/users              |             |
| [**userControllerDeleteUserV1**](#usercontrollerdeleteuserv1)               | **DELETE** /api/v1/users/{id}       |             |
| [**userControllerGetCurrentUserV1**](#usercontrollergetcurrentuserv1)       | **GET** /api/v1/users/me            |             |
| [**userControllerGetUserV1**](#usercontrollergetuserv1)                     | **GET** /api/v1/users/{id}          |             |
| [**userControllerGetUsersV1**](#usercontrollergetusersv1)                   | **GET** /api/v1/users               |             |
| [**userControllerUnblockUserV1**](#usercontrollerunblockuserv1)             | **POST** /api/v1/users/{id}/unblock |             |
| [**userControllerUpdateCurrentUserV1**](#usercontrollerupdatecurrentuserv1) | **PATCH** /api/v1/users/me          |             |
| [**userControllerUpdateUserV1**](#usercontrollerupdateuserv1)               | **PATCH** /api/v1/users/{id}        |             |

# **userControllerAdminV1**

> userControllerAdminV1()

### Example

```typescript
import { UsersApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.userControllerAdminV1();
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **401**     | Unauthorized | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerBlockUserV1**

> userControllerBlockUserV1()

### Example

```typescript
import { UsersApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let id: string; //User id (default to undefined)

const { status, data } = await apiInstance.userControllerBlockUserV1(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] | User id     | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **204**     | Block user   | -                |
| **401**     | Unauthorized | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerCreateUserV1**

> UserDto userControllerCreateUserV1(createUserDto)

### Example

```typescript
import { UsersApi, Configuration, CreateUserDto } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let createUserDto: CreateUserDto; //

const { status, data } = await apiInstance.userControllerCreateUserV1(createUserDto);
```

### Parameters

| Name              | Type              | Description | Notes |
| ----------------- | ----------------- | ----------- | ----- |
| **createUserDto** | **CreateUserDto** |             |       |

### Return type

**UserDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **201**     | Create user  | -                |
| **401**     | Unauthorized | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerDeleteUserV1**

> userControllerDeleteUserV1()

### Example

```typescript
import { UsersApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let id: string; //User id (default to undefined)

const { status, data } = await apiInstance.userControllerDeleteUserV1(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] | User id     | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **204**     | Delete user  | -                |
| **401**     | Unauthorized | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerGetCurrentUserV1**

> UserDto userControllerGetCurrentUserV1()

### Example

```typescript
import { UsersApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.userControllerGetCurrentUserV1();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**UserDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description              | Response headers |
| ----------- | ------------------------ | ---------------- |
| **200**     | Get current user profile | -                |
| **401**     | Unauthorized             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerGetUserV1**

> UserDto userControllerGetUserV1()

### Example

```typescript
import { UsersApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let id: string; //User id (default to undefined)

const { status, data } = await apiInstance.userControllerGetUserV1(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] | User id     | defaults to undefined |

### Return type

**UserDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description    | Response headers |
| ----------- | -------------- | ---------------- |
| **200**     | Get user by id | -                |
| **401**     | Unauthorized   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerGetUsersV1**

> UserControllerGetUsersV1200Response userControllerGetUsersV1()

### Example

```typescript
import { UsersApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let order: Order; // (optional) (default to undefined)
let sort: UserSort; // (optional) (default to undefined)
let page: number; // (optional) (default to 1)
let take: number; // (optional) (default to 10)
let q: string; // (optional) (default to undefined)
let role: string; // (optional) (default to undefined)
let isBlocked: boolean; // (optional) (default to undefined)
let isEmailVerified: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.userControllerGetUsersV1(
  order,
  sort,
  page,
  take,
  q,
  role,
  isBlocked,
  isEmailVerified,
);
```

### Parameters

| Name                | Type          | Description | Notes                            |
| ------------------- | ------------- | ----------- | -------------------------------- |
| **order**           | **Order**     |             | (optional) defaults to undefined |
| **sort**            | **UserSort**  |             | (optional) defaults to undefined |
| **page**            | [**number**]  |             | (optional) defaults to 1         |
| **take**            | [**number**]  |             | (optional) defaults to 10        |
| **q**               | [**string**]  |             | (optional) defaults to undefined |
| **role**            | [**string**]  |             | (optional) defaults to undefined |
| **isBlocked**       | [**boolean**] |             | (optional) defaults to undefined |
| **isEmailVerified** | [**boolean**] |             | (optional) defaults to undefined |

### Return type

**UserControllerGetUsersV1200Response**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description    | Response headers |
| ----------- | -------------- | ---------------- |
| **200**     | Get users list | -                |
| **401**     | Unauthorized   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUnblockUserV1**

> userControllerUnblockUserV1()

### Example

```typescript
import { UsersApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let id: string; //User id (default to undefined)

const { status, data } = await apiInstance.userControllerUnblockUserV1(id);
```

### Parameters

| Name   | Type         | Description | Notes                 |
| ------ | ------------ | ----------- | --------------------- |
| **id** | [**string**] | User id     | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **204**     | Unblock user | -                |
| **401**     | Unauthorized | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUpdateCurrentUserV1**

> UserDto userControllerUpdateCurrentUserV1(updateCurrentUserDto)

### Example

```typescript
import { UsersApi, Configuration, UpdateCurrentUserDto } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let updateCurrentUserDto: UpdateCurrentUserDto; //

const { status, data } = await apiInstance.userControllerUpdateCurrentUserV1(updateCurrentUserDto);
```

### Parameters

| Name                     | Type                     | Description | Notes |
| ------------------------ | ------------------------ | ----------- | ----- |
| **updateCurrentUserDto** | **UpdateCurrentUserDto** |             |       |

### Return type

**UserDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                 | Response headers |
| ----------- | --------------------------- | ---------------- |
| **200**     | Update current user profile | -                |
| **401**     | Unauthorized                | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUpdateUserV1**

> UserDto userControllerUpdateUserV1(updateUserDto)

### Example

```typescript
import { UsersApi, Configuration, UpdateUserDto } from "./api";

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let id: string; //User id (default to undefined)
let updateUserDto: UpdateUserDto; //

const { status, data } = await apiInstance.userControllerUpdateUserV1(id, updateUserDto);
```

### Parameters

| Name              | Type              | Description | Notes                 |
| ----------------- | ----------------- | ----------- | --------------------- |
| **updateUserDto** | **UpdateUserDto** |             |                       |
| **id**            | [**string**]      | User id     | defaults to undefined |

### Return type

**UserDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | Update user  | -                |
| **401**     | Unauthorized | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
