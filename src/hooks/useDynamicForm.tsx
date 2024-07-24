'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InputField from '@/components/elements/InputField';

type ValidationRule = {
  type: string;
  params?: any;
  message: string;
};

type FormField = {
  fieldname?: string;
  label?: string;
  fieldtype: string;
  reqd?: number;
  options?: string[] | string;
  validations?: ValidationRule[];
  collapsible?: number;
  collapsible_depends_on?: string;
  depends_on?: string;
  non_negative?: number;
  default?: string;
};

type FormSchema = {
  fields: FormField[];
};

const createZodSchema = (formSchema: FormSchema) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  formSchema.fields.forEach((field) => {
    if (field.fieldname) {
      let fieldSchema: z.ZodTypeAny;

      switch (field.fieldtype) {
        case 'Select':
        case 'Link':
          fieldSchema = z.enum(field.options as [string, ...string[]], {
            required_error: `${field.label} is required`,
          });
          break;
        case 'Date':
          fieldSchema = z.string().refine((date) => {
            const parsed = new Date(date);
            return !isNaN(parsed.getTime());
          }, { message: `Invalid date for ${field.label}` });
          break;
        case 'Currency':
          let currencySchema = z.number({
            required_error: `${field.label} is required`,
            invalid_type_error: `${field.label} must be a number`,
          });
          if (field.non_negative) {
            currencySchema = currencySchema.min(0, `${field.label} must be non-negative`);
          }
          fieldSchema = currencySchema;
          break;
        case 'Text Editor':
          fieldSchema = z.string();
          break;
        default:
          fieldSchema = z.string();
      }

      if (field.reqd) {
        if (fieldSchema instanceof z.ZodString || fieldSchema instanceof z.ZodNumber) {
          fieldSchema = fieldSchema.min(1, `${field.label} is required`);
        } else if (!(fieldSchema instanceof z.ZodEnum)) {
          fieldSchema = fieldSchema.nullish().refine((val) => val !== null && val !== undefined, {
            message: `${field.label} is required`,
          });
        }
      } else {
        fieldSchema = fieldSchema.optional();
      }

      if (field.validations) {
        field.validations.forEach((rule) => {
          switch (rule.type) {
            case 'max':
              if (fieldSchema instanceof z.ZodString || fieldSchema instanceof z.ZodNumber) {
                fieldSchema = fieldSchema.max(rule.params, rule.message);
              }
              break;
            case 'min':
              if (fieldSchema instanceof z.ZodString || fieldSchema instanceof z.ZodNumber) {
                fieldSchema = fieldSchema.min(rule.params, rule.message);
              }
              break;
            case 'email':
              if (fieldSchema instanceof z.ZodString) {
                fieldSchema = fieldSchema.email(rule.message);
              }
              break;
            case 'regex':
              if (fieldSchema instanceof z.ZodString) {
                fieldSchema = fieldSchema.regex(new RegExp(rule.params), rule.message);
              }
              break;
            case 'custom':
              fieldSchema = fieldSchema.refine(
                new Function('value', `return (${rule.params})(value)`) as (value: any) => boolean,
                { message: rule.message }
              );
              break;
          }
        });
      }

      schemaFields[field.fieldname] = fieldSchema;
    }
  });

  return z.object(schemaFields);
};

const useDynamicForm = (formSchema: FormSchema) => {
  const zodSchema = createZodSchema(formSchema);
  const [isDirtyState, setIsDirtyState] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty, isValid }, watch } = useForm({
    resolver: zodResolver(zodSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldUnregister: false,
  });

  useEffect(() => {
    const subscription = watch(() => {
      setIsDirtyState(isDirty);
    });

    return () => subscription.unsubscribe();
  }, [isDirty, watch]);

  const renderFields = useCallback(() => {
    let columnCount = 0;
    let currentRow: React.ReactNode[] = [];
    const rows: React.ReactNode[] = [];

    const flushRow = () => {
      if (currentRow.length > 0) {
        rows.push(
          <div key={`row-${rows.length}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {currentRow}
          </div>
        );
        currentRow = [];
        columnCount = 0;
      }
    };

    const getOptions = (field: FormField) => {
      if (field.fieldtype === 'Select' || field.fieldtype === 'Link') {
        if (Array.isArray(field.options)) {
          return field.options.map(opt => ({ value: opt, label: opt }));
        } else if (typeof field.options === 'string') {
          return field.options.split('\n').filter(Boolean).map(opt => ({ value: opt, label: opt }));
        }
      }
      return undefined;
    };

    formSchema.fields.forEach((field, index) => {
      switch (field.fieldtype) {
        case 'Section Break':
          flushRow();
          rows.push(
            <div key={`section-${index}`} className="col-span-3 mt-6 mb-4">
              <h3 className="text-lg font-semibold">{field.label}</h3>
              <hr className="my-2" />
            </div>
          );
          break;
        case 'Column Break':
          columnCount++;
          if (columnCount >= 3) {
            flushRow();
          }
          break;
        default:
          const renderedField = (
            <div key={field.fieldname || `field-${index}`} className="col-span-1">
              <InputField
                control={control}
                name={field.fieldname!}
                label={field.label!}
                type={
                  field.fieldtype === 'Date' ? 'date' :
                  field.fieldtype === 'Text Editor' ? 'textarea' :
                  field.fieldtype === 'Currency' ? 'number' :
                  field.fieldtype === 'Select' || field.fieldtype === 'Link' ? 'select' :
                  'text'
                }
                required={!!field.reqd}
                options={getOptions(field)}
                errors={errors}
              />
            </div>
          );
          currentRow.push(renderedField);
          columnCount++;
          if (columnCount >= 3) {
            flushRow();
          }
      }
    });

    flushRow();

    return <div className="w-full">{rows}</div>;
  }, [formSchema, control, errors]);

  return {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty: isDirtyState, isValid },
    renderFields,
  };
};

export default useDynamicForm;
