/// Relationships the backend can tailor gift-card messages for.
///
/// See `occasion.dart` for why this duplicates (rather than imports) the
/// generated wire enum, and note the same "keep in sync with the backend"
/// caveat applies (`api/src/domain/enums/relationship.ts`).
enum Relationship {
  mother,
  father,
  sibling,
  husband,
  wife,
  friend,
  colleague,
  grandparent,
  child,
  partner,
}

/// The wire value (matches the backend contract) for a [Relationship].
extension RelationshipWireValue on Relationship {
  String get wireValue => switch (this) {
    Relationship.mother => 'mother',
    Relationship.father => 'father',
    Relationship.sibling => 'sibling',
    Relationship.husband => 'husband',
    Relationship.wife => 'wife',
    Relationship.friend => 'friend',
    Relationship.colleague => 'colleague',
    Relationship.grandparent => 'grandparent',
    Relationship.child => 'child',
    Relationship.partner => 'partner',
  };

  /// A short, human-readable label for display in the UI.
  String get label => switch (this) {
    Relationship.mother => 'Mother',
    Relationship.father => 'Father',
    Relationship.sibling => 'Sibling',
    Relationship.husband => 'Husband',
    Relationship.wife => 'Wife',
    Relationship.friend => 'Friend',
    Relationship.colleague => 'Colleague',
    Relationship.grandparent => 'Grandparent',
    Relationship.child => 'Child',
    Relationship.partner => 'Partner',
  };
}
