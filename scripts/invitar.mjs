#!/usr/bin/env node
// La invitación debe comprobar el plan revisado y la identidad del Coach.
// Crear tokens directamente en D1 eludiría esas garantías de la API v2.
console.error('Genera la invitación desde /admin → Clientes → ficha → Invitar. Revisa y publica el plan primero.')
process.exitCode = 1
