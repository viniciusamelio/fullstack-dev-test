import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fpdart/fpdart.dart';
import 'package:mocktail/mocktail.dart';
import 'package:smash_app/domain/enums/occasion.dart';
import 'package:smash_app/domain/enums/relationship.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/domain/models/suggestion_request.dart';
import 'package:smash_app/domain/models/suggestion_result.dart';
import 'package:smash_app/infra/repositories/suggestions_repository_impl.dart';
import 'package:suggestions_api_client/suggestions_api_client.dart';

class _MockDefaultApi extends Mock implements DefaultApi {}

RequestOptions _requestOptions() => RequestOptions(path: '/suggestions');

void main() {
  late _MockDefaultApi api;
  late SuggestionsRepositoryImpl repository;

  const request = SuggestionRequest(
    occasion: Occasion.birthday,
    relationship: Relationship.friend,
  );

  setUpAll(() {
    registerFallbackValue(GenerateRequest((b) => b
      ..occasion = GenerateRequestOccasionEnum.birthday
      ..relationship = GenerateRequestRelationshipEnum.friend));
  });

  setUp(() {
    api = _MockDefaultApi();
    repository = SuggestionsRepositoryImpl(api);
  });

  test('maps a successful response to a Right(SuggestionResult)', () async {
    when(() => api.generate(generateRequest: any(named: 'generateRequest')))
        .thenAnswer(
      (_) async => Response(
        requestOptions: _requestOptions(),
        statusCode: 200,
        data: Generate200Response((b) => b
          ..messages.addAll(['a', 'b', 'c'])
          ..source_ = Generate200ResponseSource_Enum.cache),
      ),
    );

    final either = await repository.getSuggestions(request).run();

    expect(
      either,
      const Right<SuggestionsFailure, SuggestionResult>(
        SuggestionResult(
          messages: ['a', 'b', 'c'],
          source: SuggestionSource.cache,
        ),
      ),
    );
  });

  test('maps a connection timeout to TimeoutFailure', () async {
    when(() => api.generate(generateRequest: any(named: 'generateRequest')))
        .thenThrow(
      DioException(
        requestOptions: _requestOptions(),
        type: DioExceptionType.connectionTimeout,
      ),
    );

    final either = await repository.getSuggestions(request).run();

    expect(
      either,
      const Left<SuggestionsFailure, SuggestionResult>(TimeoutFailure()),
    );
  });

  test('maps a connection error to NetworkFailure', () async {
    when(() => api.generate(generateRequest: any(named: 'generateRequest')))
        .thenThrow(
      DioException(
        requestOptions: _requestOptions(),
        type: DioExceptionType.connectionError,
      ),
    );

    final either = await repository.getSuggestions(request).run();

    expect(
      either,
      const Left<SuggestionsFailure, SuggestionResult>(NetworkFailure()),
    );
  });

  test('maps a 429 with Retry-After to RateLimitedFailure', () async {
    when(() => api.generate(generateRequest: any(named: 'generateRequest')))
        .thenThrow(
      DioException(
        requestOptions: _requestOptions(),
        type: DioExceptionType.badResponse,
        response: Response(
          requestOptions: _requestOptions(),
          statusCode: 429,
          headers: Headers.fromMap({
            'retry-after': ['30'],
          }),
        ),
      ),
    );

    final either = await repository.getSuggestions(request).run();

    expect(
      either,
      const Left<SuggestionsFailure, SuggestionResult>(
        RateLimitedFailure(retryAfterSeconds: 30),
      ),
    );
  });

  test('maps a 500 to ServerFailure', () async {
    when(() => api.generate(generateRequest: any(named: 'generateRequest')))
        .thenThrow(
      DioException(
        requestOptions: _requestOptions(),
        type: DioExceptionType.badResponse,
        response: Response(requestOptions: _requestOptions(), statusCode: 500),
      ),
    );

    final either = await repository.getSuggestions(request).run();

    expect(
      either,
      const Left<SuggestionsFailure, SuggestionResult>(
        ServerFailure(statusCode: 500),
      ),
    );
  });

  test('maps a non-Dio error to UnexpectedFailure', () async {
    when(() => api.generate(generateRequest: any(named: 'generateRequest')))
        .thenThrow(StateError('boom'));

    final either = await repository.getSuggestions(request).run();

    expect(either.isLeft(), isTrue);
    either.match(
      (failure) => expect(failure, isA<UnexpectedFailure>()),
      (_) => fail('expected a Left'),
    );
  });
}
