'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CustomField } from '@/lib/clerk/content-schemas'
import { useTranslations } from '@/i18n/provider'

type CustomFieldInputProps = {
  field: CustomField
  value: unknown
  error?: string
  onChange: (value: unknown) => void
}

const emptySelectValue = '__empty__'

export function CustomFieldInput({
  field,
  value,
  error,
  onChange,
}: CustomFieldInputProps) {
  const t = useTranslations()

  return (
    <Field>
      <FieldLabel>{field.label}</FieldLabel>
      {field.helpText && <FieldDescription>{field.helpText}</FieldDescription>}
      {field.type === 'text' && (
        <>
          <Input
            name={field.key}
            onChange={event => onChange(event.target.value)}
            placeholder={field.key}
            required={field.required}
            type="text"
            value={String(value ?? '')}
          />
          {error && <FieldError>{error}</FieldError>}
        </>
      )}
      {field.type === 'number' && (
        <>
          <Input
            name={field.key}
            onChange={event => onChange(event.target.value)}
            placeholder={field.key}
            required={field.required}
            type="number"
            value={String(value ?? '')}
          />
          {error && <FieldError>{error}</FieldError>}
        </>
      )}
      {field.type === 'date' && (
        <>
          <Input
            name={field.key}
            onChange={event => onChange(event.target.value)}
            required={field.required}
            type="date"
            value={String(value ?? '')}
          />
          {error && <FieldError>{error}</FieldError>}
        </>
      )}
      {field.type === 'boolean' && (
        <>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={nextValue => onChange(Boolean(nextValue))}
            />
            <span className="text-sm">{t('common.actions.enable')}</span>
          </div>
          {error && <FieldError>{error}</FieldError>}
        </>
      )}
      {field.type === 'select' && (
        <>
          <Select
            onValueChange={nextValue =>
              onChange(nextValue === emptySelectValue ? '' : nextValue)
            }
            value={String(value ?? '') === '' ? emptySelectValue : String(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('common.placeholders.selectOption')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={emptySelectValue}>
                {t('common.placeholders.selectOptionShort')}
              </SelectItem>
              {(field.options ?? []).map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <FieldError>{error}</FieldError>}
        </>
      )}
    </Field>
  )
}
