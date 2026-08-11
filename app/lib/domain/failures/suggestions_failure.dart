import 'package:equatable/equatable.dart';

/// Everything that can go wrong requesting suggestions from the backend,
/// mapped once at the infra boundary
/// (`infra/repositories/suggestions_repository_impl.dart`) from
/// `DioException`/HTTP status codes into one of these. One hierarchy per
/// bounded context (this app only has the one — "suggestions"); a future
/// feature would get its own `<feature>_failure.dart` rather than cases
/// added here.
sealed class SuggestionsFailure extends Equatable {
  const SuggestionsFailure();

  @override
  List<Object?> get props => [];
}

/// No connectivity, or the request never reached the server (DNS failure,
/// connection refused, etc).
final class NetworkFailure extends SuggestionsFailure {
  const NetworkFailure();
}

/// The request timed out (connect/send/receive).
final class TimeoutFailure extends SuggestionsFailure {
  const TimeoutFailure();
}

/// `429` — the backend's per-IP rate limit was hit.
final class RateLimitedFailure extends SuggestionsFailure {
  const RateLimitedFailure({this.retryAfterSeconds});

  final int? retryAfterSeconds;

  @override
  List<Object?> get props => [retryAfterSeconds];
}

/// `5xx` — the backend itself failed. Note this is distinct from an LLM
/// failure: per `api/CLAUDE.md`, the backend's own LLM-failure fallback
/// chain always resolves to a `200`, so a `5xx` here means the backend
/// process itself broke, not that the LLM was unavailable.
final class ServerFailure extends SuggestionsFailure {
  const ServerFailure({required this.statusCode});

  final int statusCode;

  @override
  List<Object?> get props => [statusCode];
}

/// `400` — the request itself was rejected (shouldn't happen if the UI only
/// offers valid occasion/relationship values, but the backend is the
/// source of truth).
final class ValidationFailure extends SuggestionsFailure {
  const ValidationFailure({this.message});

  final String? message;

  @override
  List<Object?> get props => [message];
}

/// Anything else: unexpected response shape, decode error, or an
/// unrecognized `DioException`.
final class UnexpectedFailure extends SuggestionsFailure {
  const UnexpectedFailure({this.message});

  final String? message;

  @override
  List<Object?> get props => [message];
}
