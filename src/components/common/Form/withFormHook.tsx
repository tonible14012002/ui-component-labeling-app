import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ElementRef, forwardRef } from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
  useFormContext,
} from "react-hook-form";

export interface BaseFormControlProps {
  disabled?: boolean;
  errMsg?: string;
  value?: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
}

export interface FormState<T, P> {
  getDisabled?: (val?: boolean) => Partial<P>;
  getValue?: (val?: T) => Partial<P>;
  getOnValueChange?: (onChange: (val: T) => void) => Partial<P>;
  getOnBlur?: (onBlur: () => void) => Partial<P>;
}

/* ts-doc
 * A higher-order component that wraps a form control component with form state management.
 * @returns A new component that integrates with React Hook Form.
 */

export const DefaultFormMapper = {
  getIsInvalid(isInvalid?: boolean) {
    return { isInvalid };
  },
  getDisabled(disabled?: boolean) {
    return { disabled };
  },
  getValue(value?: string) {
    return { value };
  },
  getOnValueChange(onChange: (val: any) => void) {
    return { onChange };
  },
  getOnBlur(onBlur: () => void) {
    return { onBlur };
  },
};

export type NonNativeOnChange<
  T,
  TFieldValues extends FieldValues = FieldValues
> = (
  setValue: UseFormReturn<TFieldValues>["setValue"],
  field: string
) => (value: T) => void;

export const withForm = <
  T = any,
  P extends object = object,
  TFieldValues extends FieldValues = FieldValues
>(
  Component: React.ComponentType<P>,
  Mapper?: FormState<T, P>,
  noneNativeOnValueChange?: NonNativeOnChange<T, TFieldValues>
) => {
  const {
    getDisabled = DefaultFormMapper.getDisabled,
    getValue = DefaultFormMapper.getValue,
    getOnValueChange = DefaultFormMapper.getOnValueChange,
    getOnBlur,
  } = Mapper ?? {};
  const Comp = forwardRef(
    // @ts-expect-error -- Ignore type mismatch
    <Value extends TFieldValues>(
      props: P & {
        name: FieldPath<Value>;
        disabled?: boolean;
        label?: string;
        description?: string;
      },
      ref: ElementRef<any>
    ) => {
      const { label, description, name, disabled, ...restProps } = props;
      const { setValue } = useFormContext<TFieldValues>();

      return (
        <Controller<Value>
          name={name}
          render={({
            field: { value, onChange, onBlur },
          }) => {
            return (
              <FormItem>
                {label ? <FormLabel>{label}</FormLabel> : null}
                <FormControl>
                  {/*  @ts-expect-error allow miss match of props*/}
                  <Component
                    ref={ref}
                    {...getDisabled(disabled ?? false)}
                    {...getValue(value)}
                    {...getOnValueChange(
                      noneNativeOnValueChange
                        ? noneNativeOnValueChange(setValue, name)
                        : onChange
                    )}
                    {...getOnBlur?.(onBlur)}
                    {...restProps}
                  />
                </FormControl>
                {description ? (
                  <FormDescription>{description}</FormDescription>
                ) : null}
                <FormMessage />
              </FormItem>
            );
          }}
        />
      );
    }
  );
  Comp.displayName = `withForm(${Component.displayName || Component.name})`;
  return Comp;
};
