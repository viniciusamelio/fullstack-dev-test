/// Occasions the backend can generate gift-card messages for.
///
/// Kept as its own domain type (not the OpenAPI-generated enum) so the
/// domain layer stays framework/infra-free — see `CLAUDE.md`'s dependency
/// rule (domain ← data ← infra). Must be kept in sync with the backend's
/// `OCCASIONS` list (`api/src/domain/enums/occasion.ts`); the infra
/// repository maps between this and the generated wire enum.
enum Occasion {
  birthday,
  christmas,
  easter,
  valentines,
  anniversary,
  wedding,
  graduation,
  thankYou,
  getWell,
  congratulations,
  newBaby,
  retirement,
}

/// The wire value (snake_case, matches the backend contract) for an
/// [Occasion].
extension OccasionWireValue on Occasion {
  String get wireValue => switch (this) {
    Occasion.birthday => 'birthday',
    Occasion.christmas => 'christmas',
    Occasion.easter => 'easter',
    Occasion.valentines => 'valentines',
    Occasion.anniversary => 'anniversary',
    Occasion.wedding => 'wedding',
    Occasion.graduation => 'graduation',
    Occasion.thankYou => 'thank_you',
    Occasion.getWell => 'get_well',
    Occasion.congratulations => 'congratulations',
    Occasion.newBaby => 'new_baby',
    Occasion.retirement => 'retirement',
  };

  /// A short, human-readable label for display in the UI.
  String get label => switch (this) {
    Occasion.birthday => 'Birthday',
    Occasion.christmas => 'Christmas',
    Occasion.easter => 'Easter',
    Occasion.valentines => "Valentine's",
    Occasion.anniversary => 'Anniversary',
    Occasion.wedding => 'Wedding',
    Occasion.graduation => 'Graduation',
    Occasion.thankYou => 'Thank you',
    Occasion.getWell => 'Get well',
    Occasion.congratulations => 'Congratulations',
    Occasion.newBaby => 'New baby',
    Occasion.retirement => 'Retirement',
  };
}
