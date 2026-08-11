import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mix/mix.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_bloc.dart';
import 'package:smash_app/presentation/di/injector.dart';
import 'package:smash_app/presentation/screens/suggestion_screen.dart';
import 'package:smash_app/presentation/theme/app_theme.dart';

void main() {
  runApp(const SmashApp());
}

class SmashApp extends StatelessWidget {
  const SmashApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smash Gift Messages',
      theme: buildMaterialThemeData(),
      // Wraps every route in the `mix` design tokens (DESIGN.md) so
      // `$box`/`$text`-based atoms can resolve them anywhere in the tree.
      builder: (context, child) =>
          MixTheme(data: buildMixThemeData(), child: child!),
      home: BlocProvider<SuggestionsBloc>(
        create: (_) => makeSuggestionsBloc(),
        child: const SuggestionScreen(),
      ),
    );
  }
}
