import 'package:flutter/material.dart';

/// Palette officielle de l'application mobile My Community (Charte Graphique v1.0)
abstract final class AppColors {
  // Couleurs de marque
  static const primary = Color(0xFF3730A3); // Indigo profond
  static const secondary = Color(0xFF7C3AED); // Violet lumineux
  static const accent = Color(0xFFF97373); // Corail
  static const deep = Color(0xFF171638); // Indigo nuit

  // Couleurs fonctionnelles
  static const success = Color(0xFF15803D);
  static const warning = Color(0xFFB45309);
  static const error = Color(0xFFB91C1C);

  // Neutres — Thème Clair
  static const canvas = Color(0xFFF5F5FA);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSubtle = Color(0xFFEEEDF5);
  static const textPrimary = Color(0xFF17172A);
  static const textSecondary = Color(0xFF55556B);
  static const border = Color(0xFFD9D8E5);
  static const disabled = Color(0xFF77778A);

  // Neutres — Thème Sombre
  static const darkCanvas = Color(0xFF11111B);
  static const darkSurface = Color(0xFF1B1B2B);
  static const darkSurfaceSubtle = Color(0xFF28283B);
  static const darkTextPrimary = Color(0xFFF4F4FA);
  static const darkTextSecondary = Color(0xFFC1C0D4);
  static const darkBorder = Color(0xFF414158);
}

/// Échelle d'espacements officielle (Grille 4px / 8px)
abstract final class AppSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const xxl = 32.0;
  static const xxxl = 48.0;
}

/// Rayons de courbure officiels
abstract final class AppRadius {
  static const sm = 6.0;
  static const md = 10.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const pill = 999.0;
}

/// Thème Material 3 officiel My Community (Clair et Sombre)
abstract final class AppTheme {
  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
    ).copyWith(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.surface,
      error: AppColors.error,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.canvas,
      dividerColor: AppColors.border,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.canvas,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: const BorderSide(color: AppColors.border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.border),
        ),
      ),
    );
  }

  static ThemeData get dark {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.dark,
    ).copyWith(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      surface: AppColors.darkSurface,
      error: AppColors.error,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.darkCanvas,
      dividerColor: AppColors.darkBorder,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkCanvas,
        foregroundColor: AppColors.darkTextPrimary,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: AppColors.darkSurface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          side: const BorderSide(color: AppColors.darkBorder),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.darkBorder),
        ),
      ),
    );
  }
}
