# OrganizationApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**organizationControllerBanOrganizationV1**](#organizationcontrollerbanorganizationv1) | **PATCH** /api/v1/organizations/{id}/ban | |
|[**organizationControllerCreateOrganizationV1**](#organizationcontrollercreateorganizationv1) | **POST** /api/v1/organizations | |
|[**organizationControllerDeleteOrganizationV1**](#organizationcontrollerdeleteorganizationv1) | **DELETE** /api/v1/organizations/{id} | |
|[**organizationControllerGetMyOrganizationV1**](#organizationcontrollergetmyorganizationv1) | **GET** /api/v1/organizations/me | |
|[**organizationControllerGetOrganizationV1**](#organizationcontrollergetorganizationv1) | **GET** /api/v1/organizations/{id} | |
|[**organizationControllerGetOrganizationsV1**](#organizationcontrollergetorganizationsv1) | **GET** /api/v1/organizations | |
|[**organizationControllerUnbanOrganizationV1**](#organizationcontrollerunbanorganizationv1) | **PATCH** /api/v1/organizations/{id}/unban | |
|[**organizationControllerUpdateMyOrganizationV1**](#organizationcontrollerupdatemyorganizationv1) | **PATCH** /api/v1/organizations/me | |
|[**organizationControllerUpdateOrganizationV1**](#organizationcontrollerupdateorganizationv1) | **PATCH** /api/v1/organizations/{id} | |

# **organizationControllerBanOrganizationV1**
> organizationControllerBanOrganizationV1(organizationBanDto)


### Example

```typescript
import {
    OrganizationApi,
    Configuration,
    OrganizationBanDto
} from './api';

const configuration = new Configuration();
const apiInstance = new OrganizationApi(configuration);

let id: string; //Organization id (default to undefined)
let organizationBanDto: OrganizationBanDto; //

const { status, data } = await apiInstance.organizationControllerBanOrganizationV1(
    id,
    organizationBanDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **organizationBanDto** | **OrganizationBanDto**|  | |
| **id** | [**string**] | Organization id | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** |      Ban organization. (Admin only, requires organization.ban).     If the organization is already banned, this endpoint will throw an error.     Banning an organization will also ban all its members.      |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationControllerCreateOrganizationV1**
> OrganizationDto organizationControllerCreateOrganizationV1(createOrganizationDto)


### Example

```typescript
import {
    OrganizationApi,
    Configuration,
    CreateOrganizationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new OrganizationApi(configuration);

let createOrganizationDto: CreateOrganizationDto; //

const { status, data } = await apiInstance.organizationControllerCreateOrganizationV1(
    createOrganizationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createOrganizationDto** | **CreateOrganizationDto**|  | |


### Return type

**OrganizationDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Creates organization. (Admin only, requires organization.create) |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationControllerDeleteOrganizationV1**
> organizationControllerDeleteOrganizationV1()


### Example

```typescript
import {
    OrganizationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrganizationApi(configuration);

let id: string; //Organization id (default to undefined)

const { status, data } = await apiInstance.organizationControllerDeleteOrganizationV1(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Organization id | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Delete organization. (Admin only, requires organization.delete) |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationControllerGetMyOrganizationV1**
> OrganizationDto organizationControllerGetMyOrganizationV1()


### Example

```typescript
import {
    OrganizationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrganizationApi(configuration);

const { status, data } = await apiInstance.organizationControllerGetMyOrganizationV1();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**OrganizationDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get current member organization. (Member only) |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationControllerGetOrganizationV1**
> OrganizationDto organizationControllerGetOrganizationV1()


### Example

```typescript
import {
    OrganizationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrganizationApi(configuration);

let id: string; //Organization id (default to undefined)

const { status, data } = await apiInstance.organizationControllerGetOrganizationV1(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Organization id | defaults to undefined|


### Return type

**OrganizationDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get organization. (Admin only, requires organization.view) |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationControllerGetOrganizationsV1**
> OrganizationControllerGetOrganizationsV1200Response organizationControllerGetOrganizationsV1()


### Example

```typescript
import {
    OrganizationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrganizationApi(configuration);

let order: Order; // (optional) (default to undefined)
let sort: OrganizationSortField; //Sort field (optional) (default to undefined)
let page: number; // (optional) (default to 1)
let take: number; // (optional) (default to 10)
let q: string; // (optional) (default to undefined)
let name: string; //Filter by organization name (optional) (default to undefined)
let banned: boolean; //Filter by banned status (optional) (default to undefined)

const { status, data } = await apiInstance.organizationControllerGetOrganizationsV1(
    order,
    sort,
    page,
    take,
    q,
    name,
    banned
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **order** | **Order** |  | (optional) defaults to undefined|
| **sort** | **OrganizationSortField** | Sort field | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **take** | [**number**] |  | (optional) defaults to 10|
| **q** | [**string**] |  | (optional) defaults to undefined|
| **name** | [**string**] | Filter by organization name | (optional) defaults to undefined|
| **banned** | [**boolean**] | Filter by banned status | (optional) defaults to undefined|


### Return type

**OrganizationControllerGetOrganizationsV1200Response**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |      Get list of organizations. (Admin only, requires organization.view).     Search (\&#39;q\&#39;) matches name, email, phone, region, city, address.  |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationControllerUnbanOrganizationV1**
> organizationControllerUnbanOrganizationV1()


### Example

```typescript
import {
    OrganizationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrganizationApi(configuration);

let id: string; //Organization id (default to undefined)

const { status, data } = await apiInstance.organizationControllerUnbanOrganizationV1(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Organization id | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** |      Unban organization. (Admin only, requires organization.unban).     If the organization is not banned, this endpoint will throw an error.     Unbanning an organization will also unban all its members.      |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationControllerUpdateMyOrganizationV1**
> OrganizationDto organizationControllerUpdateMyOrganizationV1(updateMyOrganizationDto)


### Example

```typescript
import {
    OrganizationApi,
    Configuration,
    UpdateMyOrganizationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new OrganizationApi(configuration);

let updateMyOrganizationDto: UpdateMyOrganizationDto; //

const { status, data } = await apiInstance.organizationControllerUpdateMyOrganizationV1(
    updateMyOrganizationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateMyOrganizationDto** | **UpdateMyOrganizationDto**|  | |


### Return type

**OrganizationDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Update current member organization. (Member only, requires organization.update) |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **organizationControllerUpdateOrganizationV1**
> OrganizationDto organizationControllerUpdateOrganizationV1(updateOrganizationDto)


### Example

```typescript
import {
    OrganizationApi,
    Configuration,
    UpdateOrganizationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new OrganizationApi(configuration);

let id: string; //Organization id (default to undefined)
let updateOrganizationDto: UpdateOrganizationDto; //

const { status, data } = await apiInstance.organizationControllerUpdateOrganizationV1(
    id,
    updateOrganizationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateOrganizationDto** | **UpdateOrganizationDto**|  | |
| **id** | [**string**] | Organization id | defaults to undefined|


### Return type

**OrganizationDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Update organization. (Admin only, requires organization.update) |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

