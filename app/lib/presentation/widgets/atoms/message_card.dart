import 'package:flutter/material.dart';
import 'package:mix/mix.dart';
import 'package:smash_app/presentation/theme/app_colors.dart';
import 'package:smash_app/presentation/theme/app_radii.dart';
import 'package:smash_app/presentation/theme/app_spacing.dart';
import 'package:smash_app/presentation/theme/app_text_styles.dart';

/// Atom: a single gift-card message suggestion. See `DESIGN.md` →
/// "Components" → "Card".
class MessageCard extends StatelessWidget {
  const MessageCard({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Box(
      style: Style(
        $box.color.ref(AppColors.surfaceBase),
        $box.borderRadius.all.ref(AppRadii.lg),
        $box.padding.all.ref(AppSpacing.lg),
        $box.border.color.ref(AppColors.border),
        $box.border.width(1),
      ),
      child: StyledText(
        message,
        style: Style(
          $text.style.ref(AppTextStyles.body),
          $text.color.ref(AppColors.textPrimary),
        ),
      ),
    );
  }
}
