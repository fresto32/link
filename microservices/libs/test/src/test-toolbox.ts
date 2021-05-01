/**
 * Pauses on the current line for `milliseconds`.
 */
export async function waitFor(milliseconds: number) {
  await new Promise<void>(r => setTimeout(() => r(), milliseconds));
}
