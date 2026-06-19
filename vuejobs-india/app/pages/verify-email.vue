<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 rounded-2xl border border-green-100 bg-white p-8 shadow-2xl text-center">
      
      <!-- Logo header -->
      <div class="flex justify-center">
        <NuxtLink to="/">
          <img src="../assets/images/vueverse_logo1.png" class="h-12" alt="VueJobs India Logo" />
        </NuxtLink>
      </div>

      <!-- State 1: Verification Pending -->
      <div v-if="isPending && !isVerified" class="space-y-6">
        <div class="flex justify-center">
          <div class="rounded-full bg-green-50 p-4 text-green-600 animate-pulse">
            <Icon icon="heroicons:envelope-open" class="h-12 w-12" />
          </div>
        </div>
        
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">Verify your email</h2>
          <p class="mt-3 text-sm text-slate-600 leading-relaxed">
            We sent a verification link to <br />
            <strong class="text-slate-800 font-semibold">{{ email }}</strong>
          </p>
          <p class="mt-2 text-xs text-slate-500">
            Please click the link in the email to activate your account.
          </p>
        </div>

        <div v-if="successMessage" class="rounded-xl bg-green-50 p-4 text-sm text-green-700 text-left">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="rounded-xl bg-red-50 p-4 text-sm text-red-700 text-left">
          {{ errorMessage }}
        </div>

        <div class="space-y-4">
          <button
            @click="handleResend"
            :disabled="loading"
            class="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {{ loading ? "Resending..." : "Resend Verification Email" }}
          </button>

          <NuxtLink
            to="/sign-in"
            class="inline-block text-sm font-medium text-slate-500 hover:text-green-600 transition"
          >
            Back to Sign In
          </NuxtLink>
        </div>
      </div>

      <!-- State 2: Verification Success -->
      <div v-else-if="isVerified" class="space-y-6">
        <div class="flex justify-center">
          <div class="rounded-full bg-green-100 p-4 text-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <Icon icon="heroicons:check-circle" class="h-16 w-16" />
          </div>
        </div>

        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">Email Verified!</h2>
          <p v-if="session.data" class="mt-3 text-sm text-slate-600">
            Welcome, <strong class="text-slate-800 font-semibold">{{ session.data.user.name }}</strong>! Your email address has been successfully verified.
          </p>
          <p v-else class="mt-3 text-sm text-slate-600">
            Your email address has been successfully verified.
          </p>
        </div>

        <div class="pt-4">
          <NuxtLink
            to="/"
            class="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
          >
            Go to Homepage / Dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Fallback / Error State -->
      <div v-else class="space-y-6">
        <div class="flex justify-center">
          <div class="rounded-full bg-red-50 p-4 text-red-600">
            <Icon icon="heroicons:exclamation-triangle" class="h-12 w-12" />
          </div>
        </div>

        <div>
          <h2 class="text-3xl font-extrabold text-slate-900">Invalid Request</h2>
          <p class="mt-3 text-sm text-slate-600">
            It looks like this page was accessed directly or the verification request is invalid.
          </p>
        </div>

        <div class="pt-4">
          <NuxtLink
            to="/sign-in"
            class="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] focus:outline-none"
          >
            Go to Sign In
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { authClient } from "~/utils/auth-client";
import { Icon } from "@iconify/vue";

const route = useRoute();
const email = computed(() => (route.query.email as string) || "");
const isPending = computed(() => route.query.pending === "true" || !!email.value);
const isVerified = computed(() => route.query.verified === "true");

const session = authClient.useSession();

const loading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const handleResend = async () => {
  if (!email.value) return;
  loading.value = true;
  successMessage.value = "";
  errorMessage.value = "";
  
  try {
    await authClient.sendVerificationEmail({
      email: email.value,
      callbackURL: "/verify-email?verified=true",
    });
    successMessage.value = "A new verification link has been sent to your email address.";
  } catch (err: any) {
    errorMessage.value = err.message || "Failed to resend verification email.";
  } finally {
    loading.value = false;
  }
};

useSeoMeta({
  title: 'Verify Your Email - VueJobs India',
  description: 'Verify your email address to access your VueJobs India developer or recruiter profile.',
});
</script>
