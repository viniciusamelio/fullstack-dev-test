import 'package:equatable/equatable.dart';

/// Which stage of the backend's fallback chain produced the messages.
/// Mirrors the backend's `source: "llm" | "cache" | "static"` field
/// (`api/CLAUDE.md` → "The fallback chain").
enum SuggestionSource { llm, cache, staticFallback }

/// The 3 gift-card message suggestions returned by the backend, plus which
/// fallback stage produced them.
class SuggestionResult extends Equatable {
  const SuggestionResult({required this.messages, required this.source});

  final List<String> messages;
  final SuggestionSource source;

  @override
  List<Object?> get props => [messages, source];
}
