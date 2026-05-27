# BanUserRequest

## Properties

| Name             | Type       | Description                                 | Notes                             |
| ---------------- | ---------- | ------------------------------------------- | --------------------------------- |
| **userId**       | **string** | The user id                                 | [default to undefined]            |
| **banReason**    | **string** | The reason for the ban                      | [optional] [default to undefined] |
| **banExpiresIn** | **number** | The number of seconds until the ban expires | [optional] [default to undefined] |

## Example

```typescript
import { BanUserRequest } from "./api";

const instance: BanUserRequest = {
  userId,
  banReason,
  banExpiresIn,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
