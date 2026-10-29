import 'package:dio/dio.dart';

/// Client HTTP pour l'application Mobile Flutter
/// Réf: ADR-007
class ApiClient {
  final Dio dio;

  ApiClient({String baseUrl = 'http://10.0.2.2:3000/api/v1'})
      : dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 15),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, application/problem+json',
            },
          ),
        );
}
