import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:smash_app/infra/network/api_config.dart';

/// Builds the [Dio] instance used by [SuggestionsRepositoryImpl].
/// Short timeouts on purpose: the LLM call itself is the backend's problem
/// (it already has its own fallback chain, see `api/CLAUDE.md`), the app
/// just needs to not hang if the backend is unreachable.
Dio buildDioClient() {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      sendTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
    ),
  );

  if (kDebugMode) {
    dio.interceptors.add(
      LogInterceptor(requestBody: true, responseBody: true),
    );
  }

  return dio;
}
