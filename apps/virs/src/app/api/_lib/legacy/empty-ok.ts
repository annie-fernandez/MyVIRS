/** Empty 200 response. The Angular services treat this as success via their error handler. */
export function emptyOk(): Response {
  return new Response(null, { status: 200 });
}
