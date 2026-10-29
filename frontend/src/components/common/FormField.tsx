import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps extends React.ComponentProps<typeof Input> {
  label: string;
  error?: string;
}

/** Label + Input + thông báo lỗi — dùng với react-hook-form `register()` */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, name, ...props }, ref) => {
    const inputId = id ?? name;
    const errorId = error ? `${inputId}-error` : undefined;
    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          id={inputId}
          name={name}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FormField.displayName = 'FormField';
