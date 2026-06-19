<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-b from-green-50 to-white flex flex-col justify-between">
    <!-- Header -->
    <header class="border-b border-green-100 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-3">
            <img src="../assets/images/vueverse_logo1.png" class="h-10" alt="Logo" />
            <h2 class="text-2xl font-bold text-slate-800">VueJobs India</h2>
          </NuxtLink>
        </div>

        <nav class="hidden gap-8 text-sm font-medium md:flex">
          <NuxtLink class="text-green-600 font-semibold" to="/jobs">Jobs</NuxtLink>
          <a class="hover:text-green-600 text-slate-600" href="#">Companies</a>
          <a class="hover:text-green-600 text-slate-600" href="#">Remote Jobs</a>
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

    <!-- Main Content Area -->
    <main class="flex-1 mx-auto max-w-7xl w-full px-6 py-12 relative z-10">
      <!-- Page Hero Header -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Filtered <span class="text-green-600">Vue.js & Nuxt</span> Jobs in India
        </h1>
        <p class="mt-4 text-lg text-slate-600">
          Discover hand-picked frontend and fullstack opportunities aggregated across major networks.
        </p>
      </div>

      <!-- Search and Filters Panel -->
      <div class="bg-white rounded-2xl border border-green-100 p-6 shadow-xl mb-8 space-y-6">
        <!-- Search bar -->
        <div class="relative flex items-center">
          <Icon icon="heroicons:magnifying-glass" class="absolute left-4 h-5 w-5 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by job title, company, or keyword..."
            class="block w-full rounded-xl border border-slate-200 pl-12 pr-4 py-4 text-slate-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm shadow-sm"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <!-- Platform Filter -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform</label>
            <div class="flex gap-2">
              <button
                @click="selectedPlatform = 'all'"
                :class="selectedPlatform === 'all' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'"
                class="flex-1 py-2 text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                All
              </button>
              <button
                @click="selectedPlatform = 'linkedin'"
                :class="selectedPlatform === 'linkedin' ? 'bg-sky-700 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'"
                class="flex-1 py-2 text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                LinkedIn
              </button>
              <button
                @click="selectedPlatform = 'indeed'"
                :class="selectedPlatform === 'indeed' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'"
                class="flex-1 py-2 text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Indeed
              </button>
            </div>
          </div>

          <!-- Location Selector -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location Type</label>
            <select
              v-model="selectedLocType"
              class="block w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm bg-white h-10"
            >
              <option value="all">All Types</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid / Onsite</option>
            </select>
          </div>

          <!-- State Selector -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">State</label>
            <select
              v-model="selectedState"
              class="block w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm bg-white h-10"
            >
              <option value="all">All States</option>
              <option v-for="state in availableStates" :key="state" :value="state">
                {{ state }}
              </option>
            </select>
          </div>

          <!-- City Selector -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">City</label>
            <select
              v-model="selectedCity"
              class="block w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm bg-white h-10"
            >
              <option value="all">All Cities</option>
              <option v-for="city in availableCities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
          </div>

          <!-- Sort Order -->
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sort By</label>
            <select
              v-model="sortBy"
              class="block w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm bg-white h-10"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="title">Job Title (A-Z)</option>
              <option value="company">Company (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p class="text-slate-500 font-medium">Aggregating job listings...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredJobs.length === 0" class="text-center bg-white border border-green-100 rounded-2xl p-16 shadow-xl">
        <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-50 text-slate-400 mb-6 text-3xl">
          🔍
        </div>
        <h3 class="text-xl font-bold text-slate-900">No jobs match your search</h3>
        <p class="text-slate-500 mt-2 max-w-md mx-auto">
          We couldn't find any listings matching your current search criteria. Try modifying your filters or entering a different query.
        </p>
        <button
          @click="resetFilters"
          class="mt-6 inline-flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>

      <!-- Job Cards List -->
      <div v-else class="space-y-4">
        <div class="flex justify-between items-center text-sm text-slate-500 mb-2 px-1">
          <span>Showing {{ filteredJobs.length }} relevant opportunities</span>
        </div>

        <div
          v-for="job in filteredJobs"
          :key="job.id || job.job_url"
          class="group bg-white rounded-2xl border border-green-50/70 p-6 shadow-sm hover:shadow-md hover:border-green-200 transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <!-- Left side: Job details -->
          <div class="flex items-start gap-4">
            <!-- Company Initial Avatar -->
            <div class="h-12 w-12 rounded-xl bg-gradient-to-tr from-green-100 to-emerald-50 text-green-700 font-bold text-lg flex items-center justify-center shrink-0 border border-green-200/40">
              {{ (job.company || "C").charAt(0).toUpperCase() }}
            </div>
            
            <div class="space-y-1.5">
              <h3 class="font-extrabold text-slate-900 group-hover:text-green-700 transition text-lg leading-snug">
                {{ job.title }}
              </h3>
              
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
                <!-- Company -->
                <span class="font-semibold text-slate-700 flex items-center gap-1">
                  <Icon icon="heroicons:building-office" class="h-4 w-4 shrink-0 text-slate-400" />
                  {{ job.company || 'Confidential' }}
                </span>

                <!-- Location -->
                <span class="flex items-center gap-1">
                  <Icon icon="heroicons:map-pin" class="h-4 w-4 shrink-0 text-slate-400" />
                  {{ job.location || 'India (Remote)' }}
                </span>

                <!-- Date -->
                <span class="flex items-center gap-1">
                  <Icon icon="heroicons:calendar" class="h-4 w-4 shrink-0 text-slate-400" />
                  {{ formatRelativeDate(job.date_posted) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right side: Actions and Platform badge -->
          <div class="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 shrink-0">
            <!-- Platform Badge -->
            <span
              :class="{
                'bg-sky-50 text-sky-800 border-sky-100': (job.site || '').toLowerCase() === 'linkedin',
                'bg-blue-50 text-blue-800 border-blue-100': (job.site || '').toLowerCase() === 'indeed'
              }"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
            >
              <Icon
                :icon="(job.site || '').toLowerCase() === 'linkedin' ? 'logos:linkedin-icon' : 'logos:indeed-icon'"
                class="h-3.5 w-3.5 shrink-0"
                v-if="['linkedin', 'indeed'].includes((job.site || '').toLowerCase())"
              />
              {{ (job.site || 'Aggregator').toUpperCase() }}
            </span>

            <!-- CTA -->
            <a
              :href="job.job_url || '#'"
              target="_blank"
              class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.03] shadow-sm hover:shadow cursor-pointer"
            >
              Apply Now
              <Icon icon="heroicons:arrow-top-right-on-square" class="h-4 w-4 ml-1.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-green-100 bg-white relative z-10 mt-12">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row">
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
import { ref, computed, watch } from "vue";
import { authClient } from "~/utils/auth-client";
import { Icon } from "@iconify/vue";

const session = authClient.useSession();

const handleSignOut = async () => {
  await authClient.signOut({
    callbackURL: "/"
  });
};

import { parseLocation } from "~/utils/location";
import { useRoute, useRouter } from "#imports";

// Fetch jobs from server API
const { data: rawJobs, pending } = await useFetch<any[]>("/api/jobs", {
  default: () => []
});

// Parsed jobs with computed state and city values
const parsedJobs = computed(() => {
  if (!rawJobs.value) return [];
  return rawJobs.value.map(job => {
    const { city, state } = parseLocation(job.location || "");
    return {
      ...job,
      parsedCity: city,
      parsedState: state
    };
  });
});

const route = useRoute();
const router = useRouter();

// Ref states for search and filters initialized from query parameters
const searchQuery = ref((route.query.search as string) || "");
const selectedPlatform = ref((route.query.platform as string) || "all");
const selectedLocType = ref((route.query.loc_type as string) || "all");
const selectedState = ref((route.query.state as string) || "all");
const selectedCity = ref((route.query.city as string) || "all");
const sortBy = ref((route.query.sort_by as string) || "date_desc");

// Watch state changes to reset city if it's not in the new state's cities
watch(selectedState, (newState) => {
  if (newState !== "all" && selectedCity.value !== "all") {
    // Check if currently selected city is in the new state's cities
    const citiesInNewState = parsedJobs.value
      .filter(j => j.parsedState === newState && j.parsedCity)
      .map(j => j.parsedCity);
    if (!citiesInNewState.includes(selectedCity.value)) {
      selectedCity.value = "all";
    }
  }
});

// Watch query parameter updates (e.g. from homepage search or routing)
watch(
  () => route.query,
  (newQuery) => {
    searchQuery.value = (newQuery.search as string) || "";
    selectedPlatform.value = (newQuery.platform as string) || "all";
    selectedLocType.value = (newQuery.loc_type as string) || "all";
    selectedState.value = (newQuery.state as string) || "all";
    selectedCity.value = (newQuery.city as string) || "all";
    sortBy.value = (newQuery.sort_by as string) || "date_desc";
  }
);

// Sync ref changes to URL query parameters
watch(
  [searchQuery, selectedPlatform, selectedLocType, selectedState, selectedCity, sortBy],
  () => {
    const query: Record<string, string> = {};
    if (searchQuery.value.trim()) query.search = searchQuery.value.trim();
    if (selectedPlatform.value !== "all") query.platform = selectedPlatform.value;
    if (selectedLocType.value !== "all") query.loc_type = selectedLocType.value;
    if (selectedState.value !== "all") query.state = selectedState.value;
    if (selectedCity.value !== "all") query.city = selectedCity.value;
    if (sortBy.value !== "date_desc") query.sort_by = sortBy.value;

    router.replace({ query });
  }
);

// Extract available unique states dynamically
const availableStates = computed(() => {
  const states = new Set<string>();
  parsedJobs.value.forEach(j => {
    if (j.parsedState) states.add(j.parsedState);
  });
  return Array.from(states).sort();
});

// Extract available unique cities dynamically
const availableCities = computed(() => {
  const cities = new Set<string>();
  parsedJobs.value.forEach(j => {
    // If state is selected, only show cities from that state
    if (selectedState.value !== "all" && j.parsedState !== selectedState.value) {
      return;
    }
    if (j.parsedCity) cities.add(j.parsedCity);
  });
  return Array.from(cities).sort();
});

// Reset helper
const resetFilters = () => {
  searchQuery.value = "";
  selectedPlatform.value = "all";
  selectedLocType.value = "all";
  selectedState.value = "all";
  selectedCity.value = "all";
  sortBy.value = "date_desc";
};

// Helper to calculate time ago relative to today
const formatRelativeDate = (dateStr: string) => {
  if (!dateStr || dateStr === "N/A" || dateStr === "nan") return "Recently";
  const dateVal = new Date(dateStr);
  if (isNaN(dateVal.getTime())) return "Recently";
  
  const today = new Date("2026-06-16");
  const diffTime = today.getTime() - dateVal.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};

// Filtered and sorted listings
const filteredJobs = computed(() => {
  let result = [...parsedJobs.value];
  
  // 1. Text Search Filter (Title, Company, Location)
  if (searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(j => 
      (j.title || "").toLowerCase().includes(query) ||
      (j.company || "").toLowerCase().includes(query) ||
      (j.location || "").toLowerCase().includes(query)
    );
  }
  
  // 2. Platform Filter
  if (selectedPlatform.value !== "all") {
    result = result.filter(j => (j.site || "").toLowerCase() === selectedPlatform.value);
  }
  
  // 3. Location Type Filter
  if (selectedLocType.value !== "all") {
    result = result.filter(j => {
      const loc = (j.location || "").toLowerCase();
      if (selectedLocType.value === "remote") {
        return loc.includes("remote") || loc.includes("home");
      }
      if (selectedLocType.value === "hybrid") {
        return !loc.includes("remote");
      }
      return true;
    });
  }
  
  // 4. State Filter
  if (selectedState.value !== "all") {
    result = result.filter(j => j.parsedState === selectedState.value);
  }
  
  // 5. City Filter
  if (selectedCity.value !== "all") {
    result = result.filter(j => j.parsedCity === selectedCity.value);
  }
  
  // 6. Sorting
  if (sortBy.value === "date_desc") {
    result.sort((a, b) => (b.date_posted || "").localeCompare(a.date_posted || ""));
  } else if (sortBy.value === "date_asc") {
    result.sort((a, b) => (a.date_posted || "").localeCompare(b.date_posted || ""));
  } else if (sortBy.value === "title") {
    result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (sortBy.value === "company") {
    result.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
  }
  
  return result;
});

useSeoMeta({
  title: 'Scraped Vue.js & Nuxt Jobs in India - VueJobs India',
  description: 'Browse scraped frontend and fullstack developer jobs aggregated from major job boards.',
});
</script>
