// Openapi Generator last run: : 2026-08-11T16:55:25.475934
// Drives the OpenAPI client codegen for the smash-api backend contract.
//
// Regenerate whenever `api/`'s contract changes:
//   1. `bun run dev` in `api/`, `curl localhost:3000/spec.json -o app/openapi/spec.json`
//   2. In the resulting `spec.json`, replace the `messages` response field's
//      `"prefixItems": [...]` (a JSON Schema 2020-12 tuple, how zod's
//      `z.tuple([string,string,string])` maps under OpenAPI 3.1) with
//      `"items": {"type": "string"}, "minItems": 3, "maxItems": 3` — the
//      bundled openapi-generator-cli (6.1.0) doesn't understand
//      `prefixItems` and silently degrades the field to
//      `BuiltList<JsonObject?>` instead of `BuiltList<String>` otherwise.
//      Equivalent contract (still exactly 3 strings), just expressed in a
//      form this generator version can type.
//   3. `flutter pub run build_runner build --delete-conflicting-outputs`
//
// This produces a standalone Dart package at `app/suggestions_api_client`
// (dio-based client + models), wired in as a path dependency in
// `pubspec.yaml`. The generated package is gitignored; this annotation
// file is the only thing committed.
import 'package:openapi_generator_annotations/openapi_generator_annotations.dart';

@Openapi(
  additionalProperties: DioProperties(
    pubName: 'suggestions_api_client',
    pubAuthor: 'smash',
  ),
  inputSpec: InputSpec(path: 'openapi/spec.json'),
  generatorName: Generator.dio,
  outputDirectory: 'suggestions_api_client',
  runSourceGenOnOutput: true,
)
class OpenapiCodegen {}