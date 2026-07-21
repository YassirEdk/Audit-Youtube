/**
 * How deep an audit goes without an account.
 *
 * Mirrored by FREE_VIDEOS in api/server.py, which is where the limit is
 * actually enforced. This copy exists so the UI can be honest about it up
 * front rather than letting someone pick 100 and quietly receive 20.
 */
export const FREE_VIDEOS = 20
