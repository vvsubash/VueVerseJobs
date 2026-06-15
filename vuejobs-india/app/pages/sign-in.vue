<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 rounded-2xl border border-green-100 bg-white p-8 shadow-2xl">
      <!-- Title -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-slate-900">
          {{ isSignUp ? "Create your account" : "Sign in to VueJobs" }}
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          {{ isSignUp ? "Already have an account?" : "New to VueJobs?" }}
          <button @click="toggleMode" class="font-medium text-green-600 hover:text-green-500 transition-colors">
            {{ isSignUp ? "Sign in instead" : "Sign up now" }}
          </button>
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="rounded-md bg-green-50 p-4 text-sm text-green-700">
        {{ successMessage }}
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4 rounded-md shadow-sm">
          <div v-if="isSignUp">
            <!-- Role Toggle -->
            <div class="flex rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                @click="signUpRole = 'developer'"
                :class="signUpRole === 'developer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                class="w-1/2 rounded-lg py-2 text-center text-sm font-semibold transition"
              >
                Developer
              </button>
              <button
                type="button"
                @click="signUpRole = 'recruiter'"
                :class="signUpRole === 'recruiter' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                class="w-1/2 rounded-lg py-2 text-center text-sm font-semibold transition"
              >
                Employer / Company
              </button>
            </div>

            <label for="name" class="sr-only">Full Name</label>
            <input
              id="name"
              v-model="form.name"
              name="name"
              type="text"
              required
              class="relative block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="relative block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <div v-if="isSignUp || !useMagicLink">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              :required="isSignUp || !useMagicLink"
              class="relative block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="!isSignUp" class="flex items-center justify-end">
          <button
            type="button"
            id="toggle-magic-link"
            @click="toggleMagicLink"
            class="text-sm font-medium text-green-600 hover:text-green-500 transition-colors"
          >
            {{ useMagicLink ? "Sign in with password" : "Sign in with Magic Link" }}
          </button>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <span v-if="loading">Processing...</span>
            <span v-else>{{ isSignUp ? "Sign Up" : (useMagicLink ? "Send Magic Link" : "Sign In") }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { authClient } from "~/utils/auth-client";

const isSignUp = ref(false);
const useMagicLink = ref(false);
const signUpRole = ref("developer");
const loading = ref(false);
const error = ref("");
const successMessage = ref("");

const form = reactive({
  name: "",
  email: "",
  password: ""
});

const isPublicDomain = (email: string) => {
  const publicDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com", "aol.com", "icloud.com"];
  const domain = email.split("@")[1]?.toLowerCase();
  return publicDomains.includes(domain);
};

const toggleMode = () => {
  isSignUp.value = !isSignUp.value;
  useMagicLink.value = false;
  signUpRole.value = "developer";
  error.value = "";
  successMessage.value = "";
};

const toggleMagicLink = () => {
  useMagicLink.value = !useMagicLink.value;
  error.value = "";
  successMessage.value = "";
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    if (isSignUp.value) {
      if (signUpRole.value === "recruiter" && isPublicDomain(form.email)) {
        loading.value = false;
        error.value = "Employers must sign up using their official company email address (personal email domains are not allowed).";
        return;
      }

      await authClient.signUp.email({
        email: form.email,
        password: form.password,
        name: form.name,
        role: signUpRole.value,
        callbackURL: "/"
      }, {
        onRequest: () => {
          loading.value = true;
        },
        onSuccess: () => {
          loading.value = false;
          navigateTo("/");
        },
        onError: (ctx) => {
          loading.value = false;
          error.value = ctx.error.message || "Failed to sign up.";
        }
      });
    } else if (useMagicLink.value) {
      await authClient.signIn.magicLink({
        email: form.email,
        callbackURL: "/"
      }, {
        onRequest: () => {
          loading.value = true;
        },
        onSuccess: () => {
          loading.value = false;
          successMessage.value = "A magic link has been sent to your email address!";
        },
        onError: (ctx) => {
          loading.value = false;
          error.value = ctx.error.message || "Failed to send magic link.";
        }
      });
    } else {
      await authClient.signIn.email({
        email: form.email,
        password: form.password,
        callbackURL: "/"
      }, {
        onRequest: () => {
          loading.value = true;
        },
        onSuccess: () => {
          loading.value = false;
          navigateTo("/");
        },
        onError: (ctx) => {
          loading.value = false;
          error.value = ctx.error.message || "Failed to sign in.";
        }
      });
    }
  } catch (err: any) {
    loading.value = false;
    error.value = err.message || "An unexpected error occurred.";
  }
};
</script>
