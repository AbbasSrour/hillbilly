# UpdateMyOrganizationDto

## Properties

| Name        | Type       | Description                            | Notes                             |
| ----------- | ---------- | -------------------------------------- | --------------------------------- |
| **name**    | **string** | Name of the organization               | [optional] [default to undefined] |
| **image**   | **string** | URL or path to organization logo/image | [optional] [default to undefined] |
| **email**   | **string** | Contact email for the organization     | [optional] [default to undefined] |
| **phone**   | **string** | Contact phone number                   | [optional] [default to undefined] |
| **region**  | **string** | Region/State of the organization       | [optional] [default to undefined] |
| **city**    | **string** | City of the organization               | [optional] [default to undefined] |
| **address** | **string** | Full address of the organization       | [optional] [default to undefined] |

## Example

```typescript
import { UpdateMyOrganizationDto } from "./api";

const instance: UpdateMyOrganizationDto = {
  name,
  image,
  email,
  phone,
  region,
  city,
  address,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
