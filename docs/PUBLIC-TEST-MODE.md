# Modo de prueba abierta

El modo de prueba abierta fue retirado del producto y no está disponible en el
despliegue actual. No existe ninguna variable que pueda saltarse la autenticación
del participante ni la protección del panel del coach.

## Acceso vigente

- El participante entra mediante un enlace privado de un solo uso en
  `/access?t=…`. El enlace crea una sesión de siete días en D1 y la cookie se
  valida en cada petición.
- El coach entra en `/admin/` mediante Cloudflare Access. La función de Pages
  exige además la cabecera que Access inyecta.
- No existe una segunda entrada como `/consola/`.

La separación permite que el participante abra su enlace sin pasar por
Cloudflare Access, mientras el panel administrativo sigue detrás de la puerta
del coach.

## Verificación

Sin cookie, `/`, `/api/cliente`, los assets de la app y las imágenes devuelven
`401 Acceso requerido`. `/access?t=…` sigue siendo público para mostrar la
pantalla **Entrar**; sólo su POST consume la invitación. `/admin/` queda bajo
Cloudflare Access y una petición directa sin la cabecera secundaria devuelve
`403` cuando llega a la función.

No se modifican las invitaciones, sesiones, datos de clientes ni el esquema de
D1 al retirar este modo.
