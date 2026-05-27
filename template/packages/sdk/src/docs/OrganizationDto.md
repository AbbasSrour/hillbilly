# OrganizationDto

## Properties

| Name                 | Type                                                                 | Description                                                                 | Notes                             |
| -------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------- |
| **id**               | **string**                                                           |                                                                             | [default to undefined]            |
| **createdAt**        | **string**                                                           |                                                                             | [default to undefined]            |
| **updatedAt**        | **string**                                                           |                                                                             | [default to undefined]            |
| **name**             | **string**                                                           | Name of the organization                                                    | [default to undefined]            |
| **image**            | **string**                                                           | URL or path to organization logo/image                                      | [optional] [default to undefined] |
| **email**            | **string**                                                           | Contact email for the organization                                          | [optional] [default to undefined] |
| **phone**            | **string**                                                           | Contact phone number                                                        | [optional] [default to undefined] |
| **region**           | **string**                                                           | Region/State of the organization                                            | [optional] [default to undefined] |
| **city**             | **string**                                                           | City of the organization                                                    | [optional] [default to undefined] |
| **address**          | **string**                                                           | Full address of the organization                                            | [optional] [default to undefined] |
| **banned**           | **boolean**                                                          | Whether the organization is banned                                          | [default to undefined]            |
| **banReason**        | **string**                                                           | Reason for the ban (if banned)                                              | [optional] [default to undefined] |
| **banExpires**       | **string**                                                           | Expiration date of the ban (if banned)                                      | [optional] [default to undefined] |
| **requiresApproval** | **boolean**                                                          | Whether orders require manual approval. If false, orders are auto-accepted. | [default to undefined]            |
| **translations**     | [**Array&lt;AbstractTranslationDto&gt;**](AbstractTranslationDto.md) |                                                                             | [optional] [default to undefined] |

## Example

```typescript
import { OrganizationDto } from "./api";

const instance: OrganizationDto = {
  id,
  createdAt,
  updatedAt,
  name,
  image,
  email,
  phone,
  region,
  city,
  address,
  banned,
  banReason,
  banExpires,
  requiresApproval,
  translations,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
