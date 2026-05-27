# ChangePassword200Response

## Properties

| Name      | Type                                                                                          | Description                                      | Notes                             |
| --------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------- |
| **token** | **string**                                                                                    | New session token if other sessions were revoked | [optional] [default to undefined] |
| **user**  | [**SignUpWithEmailAndPassword200ResponseUser**](SignUpWithEmailAndPassword200ResponseUser.md) |                                                  | [default to undefined]            |

## Example

```typescript
import { ChangePassword200Response } from "./api";

const instance: ChangePassword200Response = {
  token,
  user,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
