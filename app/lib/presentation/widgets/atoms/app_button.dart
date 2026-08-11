import 'package:flutter/material.dart';
import 'package:mix/mix.dart';
import 'package:smash_app/presentation/theme/app_colors.dart';
import 'package:smash_app/presentation/theme/app_radii.dart';
import 'package:smash_app/presentation/theme/app_spacing.dart';
import 'package:smash_app/presentation/theme/app_text_styles.dart';

/// See `DESIGN.md` → "Components" → "Button".
enum AppButtonVariant { primary, secondary }

/// Atom: a single labeled button, optionally disabled while busy.
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.busy = false,
    this.variant = AppButtonVariant.primary,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool busy;
  final AppButtonVariant variant;

  @override
  Widget build(BuildContext context) {
    final isPrimary = variant == AppButtonVariant.primary;
    final fill = isPrimary ? AppColors.accent : AppColors.surfaceRaised;
    final fillHover = isPrimary
        ? AppColors.accentHover
        : AppColors.surfaceRaisedHover;

    final style = Style(
      $box.color.ref(fill),
      $box.padding.horizontal.ref(AppSpacing.lg),
      $box.padding.vertical.ref(AppSpacing.sm),
      $box.borderRadius.all.ref(AppRadii.md),
      $box.alignment.center(),
      $on.hover($box.color.ref(fillHover)),
      $on.disabled($box.color.ref(AppColors.surfaceRaised)),
    );

    return PressableBox(
      enabled: !busy && onPressed != null,
      onPress: onPressed,
      style: style,
      child: busy
          ? const SizedBox(
              height: 16,
              width: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : StyledText(
              label,
              style: Style(
                $text.style.ref(AppTextStyles.label),
                $text.color.ref(AppColors.textPrimary),
              ),
            ),
    );
  }
}
