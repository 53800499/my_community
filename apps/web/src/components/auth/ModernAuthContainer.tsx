"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useAuth } from "@/features/auth";
import {
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
  BuildingIcon,
  UsersIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@/components/icons";
import { ArrowLeft, X, Flag } from "lucide-react";

interface AuthProps {
  initialMode?: "login" | "register";
}

export const ModernAuthContainer: React.FC<AuthProps> = ({ initialMode = "login" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const { login, register, isLoading: loading, error, setError } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [targetSpace, setTargetSpace] = useState<"dashboard" | "feed">("dashboard");

  // Registration fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // UI state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber) {
      setError("Veuillez renseigner un numéro de téléphone valide.");
      return;
    }

    try {
      if (mode === "login") {
        await login(phoneNumber, password);
        const destination = redirectUrl || (targetSpace === "dashboard" ? "/dashboard" : "/feed");
        router.push(destination);
      } else {
        const parts = fullName.trim().split(" ");
        const firstName = parts[0] || "Citoyen";
        const lastName = parts.slice(1).join(" ") || "Actif";

        await register({
          phoneNumber,
          password,
          email: email.trim() || undefined,
          firstName,
          lastName,
        });

        const destination = targetSpace === "dashboard" ? "/dashboard" : "/feed";
        router.push(destination);
      }
    } catch {
      // Error is handled and formatted inside useAuth hook
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-12">
      {/* ========================================================================= */}
      {/* LEFT COLUMN: Serene, Soft, Clean Auth Form */}
      {/* ========================================================================= */}
      <div className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-10 lg:col-span-6 lg:px-14 xl:col-span-5 xl:px-18">
        {/* Top Bar: Return Link + Theme Toggle */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Retour à l&apos;accueil</span>
          </Link>
          <ThemeToggleButton />
        </div>

        {/* Center: Auth Form Container */}
        <div className="mx-auto w-full max-w-[400px] py-8">
          {/* Brand & Republic Tag */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-white shadow-sm">
              <span className="font-extrabold text-sm tracking-wide">MC</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Flag className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>République du Bénin</span>
            </div>
          </div>

          <div className="mt-5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {mode === "login" ? "Bienvenue" : "Créer un compte"}
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {mode === "login"
                ? "Connectez-vous pour accéder à vos services locaux"
                : "Rejoignez l'écosystème citoyen & territorial"}
            </p>
          </div>

          {/* Soft Tabs Switcher */}
          <div className="mt-6 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800/80">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                mode === "login"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                mode === "register"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              S&apos;inscrire
            </button>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Nom & Prénoms (Register mode) */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Jean Dossou"
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 text-xs text-gray-900 transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}

            {/* Standard Phone Input Library with Country Flag Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Numéro de Téléphone *
              </label>
              <div className="mc-phone-container mt-1">
                <PhoneInput
                  defaultCountry="BJ"
                  international
                  withCountryCallingCode
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  placeholder="97 12 34 56"
                />
              </div>
            </div>

            {/* Email (Optional, Register mode) */}
            {mode === "register" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Adresse Email
                  </label>
                  <span className="text-[10px] text-gray-400">Optionnelle</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citoyen@domaine.bj"
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 text-xs text-gray-900 transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Mot de Passe *
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Oublié ?
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-3.5 pr-10 text-xs text-gray-900 transition focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            {/* Destination Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Espace souhaité
              </label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetSpace("dashboard")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition ${
                    targetSpace === "dashboard"
                      ? "border-brand-600 bg-brand-50/80 text-brand-700 dark:border-brand-500 dark:bg-brand-950/60 dark:text-brand-300"
                      : "border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100/60 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400"
                  }`}
                >
                  <BuildingIcon className="size-3.5" />
                  <span>Console Gestion</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetSpace("feed")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition ${
                    targetSpace === "feed"
                      ? "border-brand-600 bg-brand-50/80 text-brand-700 dark:border-brand-500 dark:bg-brand-950/60 dark:text-brand-300"
                      : "border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100/60 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400"
                  }`}
                >
                  <UsersIcon className="size-3.5" />
                  <span>Espace Citoyen</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>
                    {mode === "login"
                      ? targetSpace === "dashboard"
                        ? "Accéder à la Console"
                        : "Accéder à l'Espace Citoyen"
                      : "Créer mon Compte Citoyen"}
                  </span>
                  <ArrowRightIcon className="size-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Security Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <ShieldCheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Authentification sécurisée &bull; Conforme APDP Bénin</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Serene, Clean Architectural & Community Imagery (lg+) */}
      {/* ========================================================================= */}
      <div className="hidden p-4 lg:col-span-6 lg:flex lg:p-6 lg:pl-0 xl:col-span-7">
        <div className="relative flex h-full min-h-[640px] w-full flex-col justify-between overflow-hidden rounded-3xl shadow-xl">
          {/* Serene Architectural Image */}
          <Image
            src="/images/auth-serene.jpg"
            alt="Pavillon communautaire serein et architectural - Bénin"
            fill
            priority
            className="object-cover object-center"
          />

          {/* Soft Gradient Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Top Tag */}
          <div className="relative z-10 p-8 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span>Plateforme Territoriale Officielle</span>
            </div>
          </div>

          {/* Bottom Serene Caption */}
          <div className="relative z-10 p-8 sm:p-10 text-white space-y-3">
            <blockquote className="text-xl font-medium leading-relaxed tracking-tight text-white/95 sm:text-2xl">
              « Bâtissons ensemble des communautés vivantes, solidaires et transparentes. »
            </blockquote>
            <div className="flex items-center justify-between border-t border-white/20 pt-3 text-xs text-white/80">
              <span>77 Communes &amp; Espaces Citoyens</span>
              <span className="font-semibold text-emerald-300">Données Souveraines</span>
            </div>
          </div>
        </div>
      </div>

      {/* Discreet Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Récupérer mon mot de passe
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-3 text-center text-xs space-y-3">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckIcon className="size-5" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Un code de réinitialisation temporaire a été envoyé par SMS/WhatsApp au numéro{" "}
                  <strong>{forgotPhone}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="w-full rounded-xl bg-brand-600 py-2 font-medium text-white hover:bg-brand-700"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="py-2 text-xs space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                  Indiquez votre numéro de téléphone pour recevoir un code OTP de réinitialisation :
                </p>
                <div className="mc-phone-container">
                  <PhoneInput
                    defaultCountry="BJ"
                    international
                    withCountryCallingCode
                    value={forgotPhone}
                    onChange={(val) => setForgotPhone(val || "")}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2 font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="flex-1 rounded-xl bg-brand-600 py-2 font-medium text-white hover:bg-brand-700"
                  >
                    Envoyer le code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
