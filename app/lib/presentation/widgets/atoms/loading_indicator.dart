import 'package:flutter/material.dart';

/// Atom: centered spinner, used while a suggestions request is in flight.
class LoadingIndicator extends StatelessWidget {
  const LoadingIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}
