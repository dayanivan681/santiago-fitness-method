import { api } from "../../lib/v2/api";
import type { EntornoV2 } from "../../lib/v2/seguridad";
export const onRequest: PagesFunction<EntornoV2> = ({ request, env }) =>
  api(request, env);
