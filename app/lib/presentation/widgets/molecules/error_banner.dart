import 'package:flutter/material.dart';
import 'package:mix/mix.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/presentation/theme/app_colors.dart';
import 'package:smash_app/presentation/theme/app_spacing.dart';
import 'package:smash_app/presentation/theme/app_text_styles.dart';
import 'package:smash_app/presentation/widgets/atoms/app_button.dart';

/// Molecule: turns a [SuggestionsFailure] into a user-facing message +
/// retry action. The one place in the UI that knows how to word each
/// failure case.
class ErrorBanner extends StatelessWidget {
  const ErrorBanner({super.key, required this.failure, required this.onRetry});

  final SuggestionsFailure failure;
  final VoidCallback onRetry;

  String get _message => switch (failure) {
    NetworkFailure() =>
      "Can't reach the server. Check your connection and try again.",
    TimeoutFailure() => 'The request took too long. Please try again.',
    RateLimitedFailure(:final retryAfterSeconds) => retryAfterSeconds != null
        ? "You've made too many requests — try again in ${retryAfterSeconds}s."
        : "You've made too many requests — please wait a moment and try again.",
    ServerFailure() => 'Something went wrong on our end. Please try again.',
    ValidationFailure() => 'That combination is not supported.',
    UnexpectedFailure() => 'Something unexpected happened. Please try again.',
  };

  @override
  Widget build(BuildContext context) {
    final gap = AppSpacing.md.resolve(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.error_outline,
          color: AppColors.danger.resolve(context),
          size: 40,
        ),
        SizedBox(height: gap),
        StyledText(
          _message,
          style: Style(
            $text.style.ref(AppTextStyles.body),
            $text.color.ref(AppColors.textSecondary),
            $text.textAlign.center(),
          ),
        ),
        SizedBox(height: gap),
        AppButton(
          label: 'Retry',
          onPressed: onRetry,
          variant: AppButtonVariant.secondary,
        ),
      ],
    );
  }
}
