# Despliegue y migración v2

Este procedimiento sustituye las instrucciones del piloto local. La aplicación
usa Pages Functions, D1 y R2 privado; mover sólo los archivos estáticos no mueve
cuentas ni datos. El estado real del rollout se registra en HANDOFF.

## Recursos separados

| Entorno | D1 | Identificador |
|---|---|---|
| Producción | santiago-acceso | 7cb38489-4054-45e9-94d9-aad9c9f533f5 |
| Staging | santiago-staging | 747a9348-369c-462d-83ba-37ae9bdaad48 |
| Local | sfm-local | 00000000-0000-4000-8000-000000000001 |

`wrangler.toml` declara producción y preview; `wrangler.local.toml` sólo local.
No intercambiar bindings. Los buckets R2 de staging y producción deben ser
privados y distintos. Su activación requiere que el dueño acepte las condiciones
si Cloudflare solicita facturación; no está delegada esa aceptación.

## Validar y publicar preview

1. Ejecutar `npm test`, `npm run lint`, `npm run build` y el QA v2.
2. Guardar un commit local para identificar exactamente el artefacto revisado.
3. Publicar explícitamente una rama preview, nunca `main`:

```sh
npx --no-install wrangler pages deploy dist --project-name santiago-fitness-method --branch codex-premium-v2 --commit-hash <commit-verificado>
```

4. Comprobar el URL devuelto, su commit, los bindings de staging y el acceso
   real de Cloudflare. Un preview protegido no equivale a una demo pública del
   dominio canónico. No usar un JWT local contra el entorno remoto.
5. Probar con personas sintéticas. R2 requiere upload, recuperación y permisos
   en staging antes de afirmar que está listo para producción.

## Respaldo y migraciones aditivas

El comando por defecto es de sólo lectura remota: exporta D1, restaura la copia
en SQLite aislado, ejecuta `0008`, `0009` y `0010` dos veces y comprueba integridad y
conservación exacta de clientes, rutinas, invitaciones y sesiones. Guarda SQL,
base de ensayo y manifiesto en `.recovery/`, fuera de Git y con permisos privados.

```sh
npm run d1:v2 -- --staging
npm run d1:v2 -- --produccion
```

Revisar el manifiesto antes del rollout. Para aplicar, el comando vuelve a tomar
un respaldo y repetir el ensayo; no reutiliza una copia obsoleta:

```sh
npm run d1:v2 -- --staging --aplicar
npm run d1:v2 -- --produccion --aplicar
```

`--aplicar` es una mutación real. Sólo usar producción después de aprobar staging
y preparar una versión privada de recuperación compatible. El comando fija el
UUID esperado, verifica el marcador de entorno y ejecuta exclusivamente las tres
migraciones revisadas. Nunca recorrer todas las migraciones antiguas: contienen
semillas y cambios del piloto que no deben repetirse. Una diferencia posterior
puede ser actividad concurrente; se investiga, nunca se restaura automáticamente.

Las tablas originales se conservan. `0009` añade primeras versiones sin reemplazar
versiones existentes. Si falla una parte, conservar el respaldo y repetir tras
investigar; ambas migraciones son repetibles. Time Travel puede complementar la
copia exportada según la retención de la cuenta, pero no sustituye el ensayo.

## Producción y rollback

El proyecto está conectado a Git: publicar el turno con `handoff:publish` hace
push a `main` y dispara el deployment canónico. `npm run deploy` ya no publica
producción por accidente. Tras el push, comprobar el commit realmente servido,
las fronteras anónimas y las lecturas autorizadas. QA de escritura sólo en staging.

No volver al Admin abierto ni a un código que crea semillas en peticiones. No
restaurar una base antigua descartando actividad posterior. El rollback cambia
el código a una versión privada compatible con D1 aditiva y mantiene los datos.
Si requiere restauración de datos, preparar primero un plan explícito que conserve
las operaciones posteriores y ensayarlo en otro recurso.

Cambiar de dominio mantiene los datos ya confirmados en D1, pero la cola pendiente
sigue perteneciendo al origen anterior: sincronizar o recuperar antes de retirar
ese origen. Mantener enlaces antiguos con sus adaptadores durante la transición.
