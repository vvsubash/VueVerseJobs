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

    <!-- Hero / Content Area based on Session & Role -->
    <div v-if="session.data" class="mx-auto max-w-7xl px-6 pb-24 pt-16 relative z-10">
      <!-- 1. ADMIN DASHBOARD -->
      <div v-if="session.data.user.role === 'admin'" class="space-y-8">
        <div class="rounded-2xl border border-green-100 bg-white p-8 shadow-xl">
          <h2 class="text-2xl font-bold text-slate-800">Admin Control Panel</h2>
          <p class="text-slate-500 mt-1">Review and verify new employer organizations on VueJobs India.</p>

          <div v-if="adminLoading" class="text-slate-500 mt-6 animate-pulse">Loading pending requests...</div>
          <div v-else-if="pendingOrgs.length === 0" class="mt-6 text-slate-600 bg-slate-50 rounded-xl p-6 text-center">
            🎉 No organizations pending verification.
          </div>
          <div v-else class="mt-6 space-y-4">
            <div
              v-for="org in pendingOrgs"
              :key="org.id"
              class="flex items-center justify-between border border-slate-100 bg-slate-50 rounded-xl p-5"
            >
              <div>
                <h3 class="font-bold text-slate-900 text-lg">{{ org.name }}</h3>
                <p class="text-sm text-slate-500">Slug: {{ org.slug }} | Created: {{ new Date(org.createdAt).toLocaleDateString() }}</p>
              </div>
              <div class="flex gap-3">
                <button
                  @click="verifyOrg(org.id, true)"
                  class="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer animate-none"
                >
                  Approve
                </button>
                <button
                  @click="verifyOrg(org.id, false)"
                  class="border border-red-200 hover:bg-red-50 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer animate-none"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. RECRUITER / EMPLOYER DASHBOARD -->
      <div v-else-if="session.data.user.role === 'recruiter'" class="space-y-8">
        <!-- 2A. No active organization -->
        <div v-if="!activeOrg.data" class="rounded-2xl border border-green-100 bg-white p-8 shadow-xl max-w-lg mx-auto">
          <h2 class="text-2xl font-bold text-slate-800 text-center">Create Company Profile</h2>
          <p class="text-slate-500 mt-2 text-center text-sm">Please register your company to post job listings.</p>

          <form @submit.prevent="createOrg" class="mt-6 space-y-4">
            <div v-if="orgError" class="rounded-md bg-red-50 p-4 text-sm text-red-700">{{ orgError }}</div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                v-model="orgName"
                type="text"
                required
                class="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                placeholder="Google India"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Company Slug</label>
              <input
                v-model="orgSlug"
                type="text"
                required
                class="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                placeholder="google-india"
              />
            </div>
            <button
              type="submit"
              :disabled="orgLoading"
              class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-xl transition hover:scale-[1.01] cursor-pointer"
            >
              {{ orgLoading ? "Creating..." : "Register Company" }}
            </button>
          </form>
        </div>

        <!-- 2B. Organization created, pending verification -->
        <div v-else-if="!activeOrg.data.verified" class="rounded-2xl border border-yellow-200 bg-yellow-50/50 p-8 shadow-xl max-w-lg mx-auto text-center space-y-4">
          <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 text-yellow-600 text-2xl">
            ⏳
          </div>
          <h2 class="text-2xl font-bold text-slate-800">Verification Pending</h2>
          <p class="text-slate-600 text-sm leading-relaxed">
            Your company profile <strong>{{ activeOrg.data.name }}</strong> has been successfully registered and is currently pending manual verification by VueVerse administrators.
          </p>
          <p class="text-slate-500 text-xs">
            We will verify your organization and send a confirmation email once approved.
          </p>
        </div>

        <!-- 2C. Organization verified, recruiter panel -->
        <div v-else class="space-y-6">
          <div class="rounded-2xl border border-green-100 bg-white p-8 shadow-xl">
            <div class="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Verified Partner</span>
                <h2 class="text-3xl font-extrabold text-slate-900 mt-2">{{ activeOrg.data.name }} Dashboard</h2>
              </div>
              <div class="text-sm text-slate-500">Slug: {{ activeOrg.data.slug }}</div>
            </div>

            <!-- Recruiter Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <!-- Invite teammates -->
              <div class="space-y-4">
                <h3 class="font-bold text-slate-800 text-lg">Invite Recruiting Team</h3>
                <p class="text-sm text-slate-500">Add other HR administrators, hiring managers, or recruiters to your company workspace.</p>

                <div v-if="inviteSuccess" class="rounded-md bg-green-50 p-4 text-sm text-green-700">
                  Invitation sent successfully!
                </div>
                <div v-if="inviteError" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {{ inviteError }}
                </div>

                <form @submit.prevent="inviteRecruiter" class="flex gap-3">
                  <input
                    v-model="inviteEmail"
                    type="email"
                    required
                    class="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                    placeholder="hiring.manager@company.com"
                  />
                  <button
                    type="submit"
                    :disabled="inviteLoading"
                    class="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    {{ inviteLoading ? "Sending..." : "Invite" }}
                  </button>
                </form>
              </div>

              <!-- General Employer info -->
              <div class="border-l border-slate-100 pl-0 md:pl-8 space-y-4">
                <h3 class="font-bold text-slate-800 text-lg">Quick Actions</h3>
                <div class="space-y-3">
                  <button class="w-full text-left rounded-xl bg-slate-50 p-4 font-semibold text-slate-800 border border-slate-100 hover:bg-slate-100 transition cursor-pointer">
                    📝 Post a New Job Listing
                  </button>
                  <button class="w-full text-left rounded-xl bg-slate-50 p-4 font-semibold text-slate-800 border border-slate-100 hover:bg-slate-100 transition cursor-pointer">
                    👥 View Candidate Applications
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. DEVELOPER DASHBOARD (LANDING/JOBS) -->
      <div v-else>
        <div class="mx-auto max-w-5xl text-center">
          <div class="mb-8 inline-flex items-center rounded-full border border-green-200 bg-white px-5 py-2 shadow-lg">
            🔥 500+ Vue Jobs Available
          </div>
          <div class="mb-10 flex justify-center">
            <img src="../assets/images/vue.svg" class="w-32 drop-shadow-[0_0_80px_rgba(34,197,94,0.7)]" />
          </div>
          <h1 class="mx-auto max-w-4xl text-6xl font-black leading-tight text-slate-900 md:text-8xl">
            Find all the <span class="text-green-600">Vue.js Jobs</span> in <span class="text-green-600">India</span>
          </h1>
          <p class="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-600">
            Welcome back, {{ session.data.user.name }}! Explore remote, hybrid and onsite opportunities from verified companies.
          </p>
          <!-- Search box -->
          <div class="mx-auto mt-12 flex max-w-3xl rounded-2xl border border-green-100 bg-white p-3 shadow-2xl">
            <input type="text" placeholder="Search Vue.js, Nuxt, TypeScript jobs..." class="flex-1 bg-transparent px-4 outline-none" />
            <button class="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 font-semibold text-white transition hover:scale-105 cursor-pointer">
              Search Jobs
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero for guest users -->
    <section v-else class="mx-auto flex min-h-[85vh] max-w-7xl items-center px-6 pb-24 pt-16 relative z-10">
      <div class="mx-auto max-w-5xl text-center">
        <!-- badge -->
        <div class="mb-8 inline-flex items-center rounded-full border border-green-200 bg-white px-5 py-2 shadow-lg">
          🔥 500+ Vue Jobs Available
        </div>
        <!-- Logo -->
        <div class="mb-10 flex justify-center">
          <img src="../assets/images/vue.svg" class="w-32 drop-shadow-[0_0_80px_rgba(34,197,94,0.7)]" />
        </div>
        <!-- Heading -->
        <h1 class="mx-auto max-w-4xl text-6xl font-black leading-tight text-slate-900 md:text-8xl">
          Find all the <span class="text-green-600">Vue.js Jobs</span> in <span class="text-green-600">India</span> with <span class="text-green-600">VueVerse</span>
        </h1>
        <!-- Subtitle -->
        <p class="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-600">
          India's dedicated platform for Vue.js and Nuxt developers. Discover remote, hybrid and onsite opportunities from top companies and grow your career with the VueVerse community.
        </p>
        <!-- Search -->
        <div class="mx-auto mt-12 flex max-w-3xl rounded-2xl border border-green-100 bg-white p-3 shadow-2xl">
          <input type="text" placeholder="Search Vue.js, Nuxt, TypeScript jobs..." class="flex-1 bg-transparent px-4 outline-none" />
          <button class="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 font-semibold text-white transition hover:scale-105 cursor-pointer">
            Search Jobs
          </button>
        </div>
        <!-- Stats -->
        <div class="mt-16 flex justify-center gap-16">
          <div>
            <h2 class="text-4xl font-bold text-green-600">500+</h2>
            <p class="text-slate-500">Active Jobs</p>
          </div>
          <div>
            <h2 class="text-4xl font-bold text-green-600">100+</h2>
            <p class="text-slate-500">Companies</p>
          </div>
          <div>
            <h2 class="text-4xl font-bold text-green-600">5K+</h2>
            <p class="text-slate-500">Developers</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="border-t border-green-100 bg-white relative z-10">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row"
      >
        <p>© 2026 Jobs.VueVerse.in. Built with 💚 by VueVerse.</p>

        <div class="flex gap-6">
          <a href="#" class="hover:text-green-700">About</a>
          <a href="#" class="hover:text-green-700">Contact</a>
          <a href="#" class="hover:text-green-700">Privacy Policy</a>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { authClient } from "~/utils/auth-client";
import { ref, watch } from "vue";

const session = authClient.useSession();
const activeOrg = authClient.useActiveOrganization();
const listOrgs = authClient.useListOrganizations();

// Automatically set the active organization if none is active but the user has organizations
watch(
  [() => activeOrg.value?.data, () => listOrgs.value?.data],
  async ([active, list]) => {
    if (session.value.data && !active && list && list.length > 0) {
      try {
        await authClient.organization.setActive({
          organizationId: list[0].id,
        });
      } catch (err) {
        console.error("Failed to set active organization:", err);
      }
    }
  },
  { immediate: true }
);


const handleSignOut = async () => {
  await authClient.signOut({
    callbackURL: "/"
  });
};

// Organization registration form fields
const orgName = ref("");
const orgSlug = ref("");
const orgLoading = ref(false);
const orgError = ref("");

// Auto-generate slug from organization name
watch(orgName, (val) => {
  orgSlug.value = val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
});

const createOrg = async () => {
  orgLoading.value = true;
  orgError.value = "";
  try {
    await authClient.organization.create({
      name: orgName.value,
      slug: orgSlug.value,
    });
  } catch (err: any) {
    orgError.value = err.message || "Failed to create organization profile.";
  } finally {
    orgLoading.value = false;
  }
};

// Recruiter invite recruiter members
const inviteEmail = ref("");
const inviteLoading = ref(false);
const inviteError = ref("");
const inviteSuccess = ref(false);

const inviteRecruiter = async () => {
  inviteLoading.value = true;
  inviteError.value = "";
  inviteSuccess.value = false;
  try {
    await authClient.organization.inviteMember({
      email: inviteEmail.value,
      role: "admin", // recruit team members get admin permission inside company organization workspace
    });
    inviteEmail.value = "";
    inviteSuccess.value = true;
  } catch (err: any) {
    inviteError.value = err.message || "Failed to send invitation.";
  } finally {
    inviteLoading.value = false;
  }
};

// VueVerse Super-admin pending orgs verification panel
const pendingOrgs = ref<any[]>([]);
const adminLoading = ref(false);

const fetchPendingOrgs = async () => {
  if (session.value.data?.user.role !== "admin") return;
  adminLoading.value = true;
  try {
    const data = await $fetch<any[]>("/api/admin/pending-orgs");
    pendingOrgs.value = data;
  } catch (err) {
    console.error("Failed to load pending organizations:", err);
  } finally {
    adminLoading.value = false;
  }
};

const verifyOrg = async (organizationId: string, verified: boolean) => {
  try {
    await $fetch("/api/admin/verify-org", {
      method: "POST",
      body: { organizationId, verified }
    });
    // Reload list
    await fetchPendingOrgs();
  } catch (err) {
    console.error("Failed to update organization status:", err);
  }
};

// Watch session state to load admin panel data
watch(
  () => session.value.data?.user.role,
  (role) => {
    if (role === "admin") {
      fetchPendingOrgs();
    }
  },
  { immediate: true }
);

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