/** Report success only when a clipboard operation actually succeeds. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const previous = document.activeElement as HTMLElement | null;
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(field);
    try {
      field.focus();
      field.select();
      field.setSelectionRange(0, field.value.length);
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      field.remove();
      previous?.focus();
    }
  }
}
