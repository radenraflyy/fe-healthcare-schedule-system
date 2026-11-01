export function setFormSubmissionError<TErrorMap>(
  form: { setErrorMap: (errors: TErrorMap) => void },
  message: string,
) {
  form.setErrorMap({ onSubmit: { form: message, fields: {} } } as TErrorMap);
}

export function getFormSubmissionError(error: unknown): string | undefined {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object') return undefined;

  const formError = 'form' in error ? error.form : undefined;
  if (typeof formError === 'string') return formError;
  if (formError && typeof formError === 'object') {
    const messages = Object.values(formError)
      .flatMap((issues) =>
        Array.isArray(issues)
          ? issues.map((issue) =>
              typeof issue === 'object' && issue && 'message' in issue ? String(issue.message) : '',
            )
          : [],
      )
      .filter(Boolean);
    if (messages.length) return messages.join(' ');
  }
  return undefined;
}
