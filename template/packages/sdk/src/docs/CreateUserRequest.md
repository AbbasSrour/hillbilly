# CreateUserRequest

## Properties

| Name         | Type       | Description           | Notes                             |
| ------------ | ---------- | --------------------- | --------------------------------- |
| **email**    | **string** | The email of the user | [default to undefined]            |
| **password** | **string** |                       | [optional] [default to undefined] |
| **name**     | **string** | The name of the user  | [default to undefined]            |
| **role**     | **string** |                       | [optional] [default to undefined] |
| **data**     | **string** |                       | [optional] [default to undefined] |

## Example

```typescript
import { CreateUserRequest } from "./api";

const instance: CreateUserRequest = {
  email,
  password,
  name,
  role,
  data,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
