import type { StandardSchemaV1 } from '@tanstack/form-core';
import type { AnyObjectSchema } from 'yup';

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
