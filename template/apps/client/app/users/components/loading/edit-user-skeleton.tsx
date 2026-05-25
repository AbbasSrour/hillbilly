import { ButtonSkeleton } from '@hillbilly/ui/components/skeleton/button-skeleton';
import { ComboboxSkeleton } from '@hillbilly/ui/components/skeleton/combobox-skeleton';
import { FormFieldSkeleton } from '@hillbilly/ui/components/skeleton/form-field-skeleton';
import { FormFooterSkeleton } from '@hillbilly/ui/components/skeleton/form-footer-skeleton';
import { InputSkeleton } from '@hillbilly/ui/components/skeleton/input-skeleton';
import { Skeleton } from '@hillbilly/ui/core/skeleton';
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

export function EditUserSkeleton() {
  return (
    <Main>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            Edit
            <Skeleton className="h-5 w-28" />
          </span>
        }
        description="Update the user details."
        withSeparator
      >
        <ButtonSkeleton className="h-8 w-32" />
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
