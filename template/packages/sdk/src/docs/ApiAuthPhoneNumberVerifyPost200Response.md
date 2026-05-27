# ApiAuthPhoneNumberVerifyPost200Response

## Properties

| Name       | Type                                                                                              | Description                                                                                  | Notes                             |
| ---------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------- |
| **status** | **boolean**                                                                                       | Indicates if the verification was successful                                                 | [default to undefined]            |
| **token**  | **string**                                                                                        | Session token if session is created, null if disableSession is true or no session is created | [optional] [default to undefined] |
| **user**   | [**ApiAuthPhoneNumberVerifyPost200ResponseUser**](ApiAuthPhoneNumberVerifyPost200ResponseUser.md) |                                                                                              | [optional] [default to undefined] |

## Example

```typescript
import { ApiAuthPhoneNumberVerifyPost200Response } from "./api";

const instance: ApiAuthPhoneNumberVerifyPost200Response = {
  status,
  token,
  user,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
