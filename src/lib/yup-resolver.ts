import type { StandardSchemaV1 } from '@tanstack/form-core';
import type { AnyObjectSchema } from 'yup';

/**
 * Yup 1.7 implements Standard Schema, which TanStack Form can validate natively.
 * This adapter preserves the form input type when a Yup schema has nullable or
 * transformed output fields.
 */
export function yupResolver<TInput>(schema: AnyObjectSchema | (() => AnyObjectSchema)) {
  if (typeof schema !== 'function') return schema as unknown as StandardSchemaV1<TInput, unknown>;

  return {
    '~standard': {
      version: 1 as const,
      vendor: 'Yup',
      validate(value: unknown) {
        return schema()['~standard'].validate(value);
      },
    },
  } as unknown as StandardSchemaV1<TInput, unknown>;
}
