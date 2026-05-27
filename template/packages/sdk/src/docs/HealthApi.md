# HealthApi

All URIs are relative to _http://localhost_

| Method                                                            | HTTP request        | Description |
| ----------------------------------------------------------------- | ------------------- | ----------- |
| [**healthCheckerControllerCheck**](#healthcheckercontrollercheck) | **GET** /api/health |             |

# **healthCheckerControllerCheck**

> HealthCheckerControllerCheck200Response healthCheckerControllerCheck()

### Example

```typescript
import { HealthApi, Configuration } from "./api";

const configuration = new Configuration();
const apiInstance = new HealthApi(configuration);

const { status, data } = await apiInstance.healthCheckerControllerCheck();
```

### Parameters

This endpoint does not have any parameters.

### Return type

**HealthCheckerControllerCheck200Response**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                        | Response headers |
| ----------- | ---------------------------------- | ---------------- |
| **200**     | The Health Check is successful     | -                |
| **503**     | The Health Check is not successful | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
