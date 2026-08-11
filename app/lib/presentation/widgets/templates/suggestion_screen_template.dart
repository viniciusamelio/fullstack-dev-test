import 'package:flutter/material.dart';
import 'package:mix/mix.dart';
import 'package:smash_app/presentation/theme/app_colors.dart';
import 'package:smash_app/presentation/theme/app_radii.dart';
import 'package:smash_app/presentation/theme/app_spacing.dart';
import 'package:smash_app/presentation/theme/app_text_styles.dart';

/// Template: page chrome + layout only, no state, no domain knowledge — a
/// single `body` slot the page (`SuggestionScreen`) fills in based on the
/// current bloc state. See `DESIGN.md` → "Components" → "Card" for the
/// panel treatment wrapping [body].
class SuggestionScreenTemplate extends StatelessWidget {
  const SuggestionScreenTemplate({super.key, required this.body});

  final Widget body;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: StyledText(
          'Gift Card Message Suggester',
          style: Style(
            $text.style.ref(AppTextStyles.heading),
            $text.color.ref(AppColors.textPrimary),
          ),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Box(
                style: Style(
                  $box.color.ref(AppColors.surfaceBase),
                  $box.borderRadius.all.ref(AppRadii.lg),
                  $box.padding.all.ref(AppSpacing.xl),
                  $box.border.color.ref(AppColors.border),
                  $box.border.width(1),
                ),
                child: body,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
