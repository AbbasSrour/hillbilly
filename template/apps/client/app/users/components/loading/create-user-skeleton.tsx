import { ButtonSkeleton } from '@hillbilly/ui/components/skeleton/button-skeleton';
import { ComboboxSkeleton } from '@hillbilly/ui/components/skeleton/combobox-skeleton';
import { FormFieldSkeleton } from '@hillbilly/ui/components/skeleton/form-field-skeleton';
import { FormFooterSkeleton } from '@hillbilly/ui/components/skeleton/form-footer-skeleton';
import { InputSkeleton } from '@hillbilly/ui/components/skeleton/input-skeleton';
import { Main } from '@hillbilly/ui/components/layout/main';
import { PageHeader } from '@hillbilly/ui/components/layout/page-header';
import {
  FormContent,
  FormSection,
  FormSectionContent,
  FormSectionDescription,
  FormSectionHeader,
  FormSectionTitle,
  FormRow,
} from '@hillbilly/ui/core/form';

export function CreateUserSkeleton() {
  return (
    <Main>
      <PageHeader
        title="Create User"
        description="Create a new user account."
        withSeparator
      >
        <ButtonSkeleton className="h-8 w-28" />
      </PageHeader>

      <FormContent>
        <FormSection layout="vertical">
          <FormSectionHeader>
            <FormSectionTitle>Personal Information</FormSectionTitle>
            <FormSectionDescription>
              Enter the user's basic personal information including their name,
              email address, and contact details.
            </FormSectionDescription>
          </FormSectionHeader>

          <FormSectionContent cols={1} spacing="lg">
            <FormRow cols={3}>
              <FormFieldSkeleton>
                <FormFieldSkeleton.Label />
                <InputSkeleton />
              </FormFieldSkeleton>
              <FormFieldSkeleton>
                <FormFieldSkeleton.Label />
                <InputSkeleton />
              </FormFieldSkeleton>
            </FormRow>

            <FormRow cols={3}>
              <FormFieldSkeleton>
                <FormFieldSkeleton.Label />
                <InputSkeleton />
              </FormFieldSkeleton>
            </FormRow>

            <FormRow cols={3}>
              <FormFieldSkeleton>
                <FormFieldSkeleton.Label />
                <InputSkeleton />
              </FormFieldSkeleton>
            </FormRow>
          </FormSectionContent>
        </FormSection>

        <FormSection layout="vertical">
          <FormSectionHeader>
            <FormSectionTitle>Account Information</FormSectionTitle>
            <FormSectionDescription>
              Set up user access credentials and permissions by selecting a
              role and creating a secure password.
            </FormSectionDescription>
          </FormSectionHeader>

          <FormSectionContent layout="flex" direction="column" spacing="lg">
            <FormRow className="w-1/4">
              <FormFieldSkeleton>
                <FormFieldSkeleton.Label />
                <ComboboxSkeleton />
              </FormFieldSkeleton>
            </FormRow>

            <FormRow cols={2} className="w-3/4">
              <FormFieldSkeleton>
                <FormFieldSkeleton.Label />
                <InputSkeleton />
              </FormFieldSkeleton>
              <FormFieldSkeleton>
                <FormFieldSkeleton.Label />
                <InputSkeleton />
                <FormFieldSkeleton.Description />
              </FormFieldSkeleton>
            </FormRow>
          </FormSectionContent>
        </FormSection>
      </FormContent>

      <FormFooterSkeleton>
        <ButtonSkeleton className="h-9 w-40" />
        <ButtonSkeleton className="h-9 w-40" />
      </FormFooterSkeleton>
    </Main>
  );
}
