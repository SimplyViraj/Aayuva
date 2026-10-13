// Every handler is individually inventoried; an annotation alone never grants
// a public exception. Pending operations still require their bound capability.
export const REGISTRATION_OPERATIONS = [
  'registration:begin', 'registration:status', 'registration:profile',
  'registration:phone:send', 'registration:phone:check', 'registration:phone:restart',
  'registration:email:send', 'registration:email:check', 'registration:complete', 'registration:cancel',
] as const;
