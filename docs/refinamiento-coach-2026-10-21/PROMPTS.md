# Prompts de las propuestas del coach

Generador integrado ImageGen, `ui-mockup`, fondo opaco. Tres llamadas independientes.
Cada llamada adjuntó los tres archivos listados en `REFERENCIAS.json`.
Los números se asignaron al orden efectivo de aparición en el chat, ya verificadas las tres salidas.
Cada prompt concatena el bloque común, un salto de línea y su dirección.

## Bloque común

```text
Use case: ui-mockup. Create realistic, production-quality UI designs with clear hierarchy, strong typography, intentional imagery, and purposeful spacing.
Design ONE focused mobile primary screen of Santiago Fitness Method COACH, not a feature inventory. This is a visual proposal for refining an EXISTING React PWA, not a new app.
TARGET DIMENSIONS: 390 x 844 CSS-pixel portrait mobile app content, rendered at a naturally proportional high resolution. One screen only. No device bezel, phone, OS status bar, clock, battery, browser chrome, home indicator, rounded phone mask, mockup shadow, title banner or option label.
INPUT REFERENCES attached: first screenshot is CURRENT coach Hoy with excess tall header and disconnected priorities; second is CURRENT coach clients list; third is the APPROVED client redesign. Borrow coherent visual language ONLY from third: compact system-font title, dark near-black #0b0c0d, subtle surfaces #141517 and #1b1c1f, red brand #e5352b, red action #db3027, white primary and readable gray text. Keep Barlow only in small SANTIAGO FM wordmark; SF Pro-like system text for all UI, NOT condensed large headings. Do not reproduce the photo hero from the client: the coach's task is people and their programs. Use initial avatars AR/MV/ND, no invented exercise images or decorative charts.
CURRENT DATE: Wednesday 21 October 2026, Puerto Rico. If date is visible use Spanish "Miércoles, 21 de octubre". Recent activity is Sunday 18 October 2026, label "18 oct". No future events.
FACTS FROM CURRENT SYNTHETIC DEMO (preserve all you show): 3 clients; 0 sessions THIS current week Oct19–25; 0 onboarding; 1 program pending review (Nora); 2 clients with pending payment. Alicia Rivera: published program 4 sessions, payment Al día, last activity Upper A completed18oct. Marcos Vega: published program4sessions, payment En gracia. Nora Díaz: Programa por revisar, Sin suscripción. Do not infer inactivity risk or injury, deadlines, unseen messages, appointments, readiness scores, new analytics, payment actions or notifications. Existing main tabs EXACTLY "Hoy", "Clientes", "Biblioteca". Do not add tab icons/pages for agenda, chat or trends. New client via small accessible plus in header; one main CTA for hero use case and only1–2 supporting areas. No equal-weight dashboard tile grid.
LAYOUT: base page surface first, differentiation by spacing/alignment/type, row separators second, subtle grouped surface only when helpful, borders sparing and elevation last. No cards inside cards; no standalone card for every normal client row. Strong legible typography, readable14–16px body, >=44px touch affordances,16px horizontal margins. No more than2fonts. Compact floating bottom tabbar from approved client with safe content separation. Everything in Spanish. Use realistic existing labels.
Presentation must feel like a restrained, native iOS coaching tool in the same product family as the approved client, professional and focused; avoid flashy dashboard decoration.
```

## Dirección mostrada 1

```text
DIRECTION NAME: "Hoy con prioridades".
Make the screen's header say "Hoy" at34px bold, small SANTIAGO FM · COACH wordmark and a subtle plus on right. Date beneath. Lead immediately with a small "Necesita revisión" eyebrow and Nora Díaz row with ND avatar, exact status "Programa por revisar" and one wide red button "Revisar programa". This single hero is compact, not huge and without photography. Then a quiet single-line grouped row "2 pagos pendientes" with chevron; payments are supporting. Small typographic inline summary "3 clientes · 0 sesiones esta semana", not oversized number tiles. Secondary lower region "Actividad reciente" with one row AR Alicia Rivera, "Upper A · Completado", "18 oct", chevron. A restrained "Ver clientes" link may end the section. Hoy selected in bottom tabbar. Bring the pending program into the top half, leave calm whitespace below the two supporting areas. Use polished native grouped-list composition with distinctly strong task hierarchy.
```

## Dirección mostrada 2

```text
DIRECTION NAME: "Personas primero".
Make a distinct contact-list-centered coach HOME, with title "Tus clientes" at34px and small SANTIAGO FM · COACH signature plus small accessible plus button. Current date may be one gray line. Immediately after the header show an inviting search bar "Buscar cliente"; this proposes exposing the EXISTING client search on the home entry, not a new service. The dominant content is ONE continuous grouped contact list:
Nora Díaz / Programa por revisar / Sin suscripción, ND avatar. Nora FIRST with a restrained red left accent/status and an in-row action text "Revisar programa" as the single main red action. Do not duplicate her in another hero.
Alicia Rivera / 4 sesiones · Publicado / Al día, AR.
Marcos Vega / 4 sesiones · Publicado / En gracia, MV.
Use three spacious rows with thin separators, round initial avatars and tasteful chevrons; no three separate cards. Above list a tiny "3 clientes" count. Below list, a quiet supporting grouped row "Pagos pendientes" with2 count. Tiny summary if useful "0 sesiones esta semana", no colorful statistics grid. On home Hoy remains selected, not Clientes; the list is the home work surface. Preserve main tabs Hoy,Clientes,Biblioteca. This direction should feel like iOS Contacts married to an Apple Fitness-quality dark app, contact-centric, compact but readable, warm and extremely direct. Not a dashboard of metrics.
```

## Dirección mostrada 3

```text
DIRECTION NAME: "Seguimiento en primer plano".
Distinct activity-first mobile coach HOME. Header "Seguimiento"34px bold with small SANTIAGO FM · COACH signature, a small plus button and Spanish current date21October. Main hero is NOT a numeric chart: a calm editorial block "Actividad reciente", large AR initial avatar beside "Alicia Rivera", "Upper A · Completado", exact date "18 oct". One clear red primary button "Ver actividad" opens the existing client's activity. A subtle divider follows. Supporting section "Por revisar" with a compact grouped Nora Díaz row ND, "Programa por revisar" and chevron. Another small row "Pagos pendientes" and2. Small inline summary "3 clientes · 0 sesiones esta semana" must not imply that18oct belongs to current week. No new live messaging, feed items, invented trends or social app elements. Only the one real recent activity item. Main tabs Hoy,Clientes,Biblioteca, Hoy selected. Arrange with a restrained editorial timeline-like hierarchy but no fake timeline events, no nested cards and no arbitrary exercise imagery. Let typography and spacing carry this direction, generous yet functional. Keep recent client work front and center rather than the task-first or directory-first hierarchy.
```
