/// The backend base URL, configurable at build/run time:
///
///   flutter run --dart-define=API_BASE_URL=https://example.com
///
/// Defaults to the local backend (`api/`'s default `PORT=3000`, see
/// `api/CLAUDE.md` → "Environment").
class ApiConfig {
  const ApiConfig._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );
}
