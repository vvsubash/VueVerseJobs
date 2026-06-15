<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-b from-green-50 to-white">

    <!-- Floating logos - Left and Right side only -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="mx-auto max-w-7xl px-6 h-full flex flex-col mt-52">
        <div class="flex justify-between">
          <!-- Left side icons -->
          <div class="flex flex-col gap-36">
            <div class="flex justify-center animate-pulse opacity-30">
              <Icon icon="logos:vue" class="h-20 w-20" />
            </div>
            <div class="flex justify-center animate-pulse opacity-30">
              <Icon icon="logos:typescript-icon" class="h-20 w-20" />
            </div>
            <div class="flex justify-center animate-pulse opacity-30">
              <Icon icon="logos:pinia" class="h-20 w-20" />
            </div>
          </div>

          <!-- Right side icons -->
          <div class="flex flex-col gap-36">
            <div class="flex justify-center animate-pulse opacity-30">
              <Icon icon="logos:vitejs" class="h-20 w-20" />
            </div>
            <div class="flex justify-center animate-pulse opacity-30">
              <Icon icon="logos:nuxt-icon" class="h-20 w-20" />
            </div>
            <div class="flex justify-center animate-pulse opacity-30">
              <Icon icon="logos:tailwindcss-icon" class="h-20 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header class="border-b border-green-100 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div class="flex items-center gap-3">
          <img src="../assets/images/vueverse_logo1.png" class="h-10" />

          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              VueJobs India
            </h2>
          </div>
        </div>

        <nav class="hidden gap-8 text-sm font-medium md:flex">
          <a class="hover:text-green-600" href="#">Jobs</a>
          <a class="hover:text-green-600" href="#">Companies</a>
          <a class="hover:text-green-600" href="#">Remote Jobs</a>
        </nav>

        <div>
          <div v-if="session.isPending" class="text-sm text-slate-500">Loading...</div>
          <div v-else-if="session.data" class="flex items-center gap-4">
            <span class="text-sm font-medium text-slate-700">Hello, {{ session.data.user.name }}</span>
            <button
              @click="handleSignOut"
              class="rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50 cursor-pointer"
            >
              Sign out
            </button>
          </div>
          <NuxtLink
            v-else
            to="/sign-in"
            class="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 font-semibold text-white transition hover:scale-105 inline-block cursor-pointer"
          >
            Sign in
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="mx-auto flex min-h-[85vh] max-w-7xl items-center px-6 pb-24 pt-16">

      <div class="mx-auto max-w-5xl text-center">

        <!-- badge -->
        <div
          class="mb-8 inline-flex items-center rounded-full border border-green-200 bg-white px-5 py-2 shadow-lg"
        >
          🔥 500+ Vue Jobs Available
        </div>

        <!-- Logo -->
        <div class="mb-10 flex justify-center">
          <img
            src="../assets/images/vue.svg"
            class="w-32 drop-shadow-[0_0_80px_rgba(34,197,94,0.7)]"
          />
        </div>

        <!-- Heading -->
        <h1
          class="mx-auto max-w-4xl text-6xl font-black leading-tight text-slate-900 md:text-8xl"
        >
          Find all the
          <span class="text-green-600">Vue.js Jobs</span>

          in

          <span class="text-green-600">
            India
          </span>

          with

          <span class="text-green-600">
            VueVerse
          </span>
        </h1>

        <!-- Subtitle -->
        <p
          class="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-600"
        >
          India's dedicated platform for Vue.js and Nuxt developers.
          Discover remote, hybrid and onsite opportunities from top companies
          and grow your career with the VueVerse community.
        </p>

        <!-- Search -->
        <div
          class="mx-auto mt-12 flex max-w-3xl rounded-2xl border border-green-100 bg-white p-3 shadow-2xl"
        >
          <input
            type="text"
            placeholder="Search Vue.js, Nuxt, TypeScript jobs..."
            class="flex-1 bg-transparent px-4 outline-none"
          />

          <button
            class="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 font-semibold text-white transition hover:scale-105"
          >
            Search Jobs
          </button>
        </div>

        <!-- Stats -->
        <div class="mt-16 flex justify-center gap-16">

          <div>
            <h2 class="text-4xl font-bold text-green-600">
              500+
            </h2>

            <p class="text-slate-500">
              Active Jobs
            </p>
          </div>

          <div>
            <h2 class="text-4xl font-bold text-green-600">
              100+
            </h2>

            <p class="text-slate-500">
              Companies
            </p>
          </div>

          <div>
            <h2 class="text-4xl font-bold text-green-600">
              5K+
            </h2>

            <p class="text-slate-500">
              Developers
            </p>
          </div>

        </div>

      </div>

    </section>

    <footer class="border-t border-green-100 bg-white">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row"
      >
        <p>© 2026 Jobs.VueVerse.in. Built with 💚 by VueVerse.</p>

        <div class="flex gap-6">
          <a href="#" class="hover:text-green-700">
            About
          </a>

          <a href="#" class="hover:text-green-700">
            Contact
          </a>

          <a href="#" class="hover:text-green-700">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { authClient } from "~/utils/auth-client";

const session = authClient.useSession();

const handleSignOut = async () => {
  await authClient.signOut({
    callbackURL: "/"
  });
};

useSeoMeta({
  title: 'Vue Jobs India | Find Vue.js & Nuxt Jobs in India - VueVerse',
  description:
    'Find the latest Vue.js and Nuxt jobs in India. Discover remote, hybrid, and onsite opportunities for Vue developers. Built by VueVerse for the Vue community.',
  keywords:
    'Vue jobs India, Vue.js jobs India, Nuxt jobs India, Frontend jobs India, Vue developer jobs, Remote Vue jobs, VueVerse jobs, JavaScript jobs India, TypeScript jobs India, Vue careers',
  ogTitle: 'Vue Jobs India | Find Vue.js & Nuxt Jobs in India',
  ogDescription:
    'Discover the best Vue.js and Nuxt opportunities in India. Built by VueVerse.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  htmlAttrs: {
    lang: 'en',
  },
  link: [
    {
      rel: 'canonical',
      href: 'https://jobs.vueverse.in',
    },
  ],
})
</script>