<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
    <!-- Animated Background Gradient -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-teal-500/10 via-transparent to-transparent dark:from-teal-500/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-palette-dark-blue/10 via-transparent to-transparent dark:from-palette-dark-blue/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img src="/logo.png" alt="Timely PH Logo" class="w-10 h-10 rounded-xl shadow-lg" />
            <span class="text-2xl font-bold">
              <span class="text-palette-dark-blue dark:text-white">Timely</span>
              <span class="text-teal-500">PH</span>
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="toggleTheme"
              class="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="isDark" class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <div class="relative" ref="dropdownRef">
              <button
                @click="showLoginDropdown = !showLoginDropdown"
                class="px-5 py-2.5 bg-palette-dark-blue dark:bg-teal-500 text-white rounded-xl hover:opacity-90 font-medium transition-all duration-200 inline-flex items-center space-x-2 shadow-lg shadow-palette-dark-blue/25 dark:shadow-teal-500/25"
              >
                <span>Sign In</span>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showLoginDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div v-if="showLoginDropdown" class="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <router-link to="/company/login" class="flex items-center space-x-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="showLoginDropdown = false">
                    <div class="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">Company</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Multi-branch management</p>
                    </div>
                  </router-link>
                  <router-link to="/branch/login" class="flex items-center space-x-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800" @click="showLoginDropdown = false">
                    <div class="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">Branch</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Single location admin</p>
                    </div>
                  </router-link>
                  <router-link to="/employee/login" class="flex items-center space-x-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800" @click="showLoginDropdown = false">
                    <div class="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">Employee</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">View your attendance</p>
                    </div>
                  </router-link>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-12 lg:pt-40 lg:pb-20 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-4xl mx-auto mb-16">
          <div class="inline-flex items-center px-4 py-2 bg-teal-500/10 dark:bg-teal-500/20 rounded-full mb-8">
            <span class="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></span>
            <span class="text-sm text-teal-600 dark:text-teal-400 font-medium">Biometric Attendance System</span>
          </div>
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span class="text-palette-dark-blue dark:text-white">Timely</span>
            <span class="text-teal-500">PH</span>
          </h1>
          <p class="text-2xl sm:text-3xl font-medium text-gray-600 dark:text-gray-300 mb-4">
            Accurate Time. Seamless Work.
          </p>
          <p class="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Connect your biometric devices and track attendance in real-time. Fingerprint, face recognition, and RFID — all in one platform.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" class="inline-flex items-center justify-center px-8 py-4 bg-palette-dark-blue dark:bg-teal-500 text-white rounded-2xl hover:opacity-90 font-semibold text-lg transition-all duration-200 shadow-xl shadow-palette-dark-blue/25 dark:shadow-teal-500/25 hover:-translate-y-0.5">
              Get Started
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a href="#features" class="inline-flex items-center justify-center px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold text-lg transition-all duration-200">
              Learn More
            </a>
          </div>
        </div>

        <!-- Hero Image with Floating Stats -->
        <div class="relative max-w-5xl mx-auto">
          <div class="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src="/device.png" alt="Biometric Device" class="w-full h-auto" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <!-- Floating Stats Cards -->
          <div class="absolute -left-4 lg:-left-12 top-1/4 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-800 hidden sm:block">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">&lt;1s</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Clock-in Time</p>
              </div>
            </div>
          </div>

          <div class="absolute -right-4 lg:-right-12 top-1/3 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-800 hidden sm:block">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">99.9%</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Uptime</p>
              </div>
            </div>
          </div>

          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 rounded-2xl px-6 py-4 shadow-xl border border-gray-100 dark:border-gray-800">
            <div class="flex items-center space-x-6">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Face Recognition</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Fingerprint</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">RFID</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bento Grid Features -->
    <section id="features" class="py-20 lg:py-32 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need
          </h2>
          <p class="text-xl text-gray-500 dark:text-gray-400">
            A complete attendance management solution for modern businesses.
          </p>
        </div>

        <!-- Bento Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <!-- Large Feature Card -->
          <div class="lg:col-span-2 bg-gradient-to-br from-palette-dark-blue to-palette-dark-blue/80 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div class="relative">
              <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-2xl lg:text-3xl font-bold mb-3">Real-time Analytics</h3>
              <p class="text-white/80 text-lg leading-relaxed max-w-md">
                See who's at work right now. Track patterns, identify issues, and make data-driven decisions with live dashboards.
              </p>
            </div>
          </div>

          <!-- Fingerprint Card -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
            <div class="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Fingerprint Scanner</h3>
            <p class="text-gray-500 dark:text-gray-400">Secure biometric authentication. No more buddy punching.</p>
          </div>

          <!-- Face Recognition Card -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
            <div class="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Face Recognition</h3>
            <p class="text-gray-500 dark:text-gray-400">Fast, contactless, and incredibly accurate verification.</p>
          </div>

          <!-- RFID Card -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
            <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">RFID Card</h3>
            <p class="text-gray-500 dark:text-gray-400">Tap and go. Perfect for high-traffic workplaces.</p>
          </div>

          <!-- Multi-Branch Card -->
          <div class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 text-white relative overflow-hidden group lg:col-span-2">
            <div class="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div class="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold mb-3">Multi-Branch Support</h3>
                <p class="text-white/80 text-lg max-w-md">
                  Managing multiple locations? Track attendance across all your branches from one unified dashboard.
                </p>
              </div>
              <div class="mt-6 lg:mt-0 flex -space-x-4">
                <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  <span class="text-2xl font-bold">1</span>
                </div>
                <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  <span class="text-2xl font-bold">2</span>
                </div>
                <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  <span class="text-2xl font-bold">3+</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Shift Management Card -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 group hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Shift Management</h3>
            <p class="text-gray-500 dark:text-gray-400">Create schedules. Track late arrivals and early departures.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works - Timeline Style -->
    <section class="py-20 lg:py-32 px-6 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How it works
          </h2>
          <p class="text-xl text-gray-500 dark:text-gray-400">
            Get started in three simple steps.
          </p>
        </div>

        <div class="relative">
          <!-- Timeline Line -->
          <div class="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-palette-dark-blue via-teal-500 to-purple-500 -translate-y-1/2 rounded-full"></div>

          <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div class="relative text-center">
              <div class="relative z-10 w-20 h-20 bg-gradient-to-br from-palette-dark-blue to-palette-dark-blue/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-palette-dark-blue/25">
                <span class="text-3xl font-bold text-white">1</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Connect Your Device</h3>
              <p class="text-gray-500 dark:text-gray-400">
                Link your fingerprint scanner, face recognition camera, or RFID reader to Timely PH.
              </p>
            </div>

            <div class="relative text-center">
              <div class="relative z-10 w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/25">
                <span class="text-3xl font-bold text-white">2</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Add Your Team</h3>
              <p class="text-gray-500 dark:text-gray-400">
                Register employees and enroll their biometric data. Organize them into departments.
              </p>
            </div>

            <div class="relative text-center">
              <div class="relative z-10 w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25">
                <span class="text-3xl font-bold text-white">3</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Start Tracking</h3>
              <p class="text-gray-500 dark:text-gray-400">
                Employees clock in and out. You get real-time attendance data and reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 lg:py-32 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="bg-gradient-to-br from-palette-dark-blue to-palette-dark-blue/90 rounded-[2.5rem] p-8 lg:p-16 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div class="relative text-center">
            <h2 class="text-4xl lg:text-5xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p class="text-xl text-white/80 mb-10 max-w-xl mx-auto">
              Get in touch with us and we'll set up Timely PH for your business.
            </p>

            <div class="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
              <a href="mailto:hello@timely.com" class="flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="font-medium">hello@timely.com</span>
              </a>
              <a href="tel:+639123456789" class="flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="font-medium">+63 912 345 6789</span>
              </a>
            </div>

            <div class="pt-8 border-t border-white/20">
              <p class="text-white/60 text-sm mb-4">Already a customer?</p>
              <div class="flex flex-wrap gap-3 justify-center">
                <router-link to="/company/login" class="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors">
                  Company Login
                </router-link>
                <router-link to="/branch/login" class="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors">
                  Branch Login
                </router-link>
                <router-link to="/employee/login" class="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors">
                  Employee Login
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-6 border-t border-gray-100 dark:border-gray-800">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="flex items-center space-x-3 mb-4 md:mb-0">
            <img src="/logo.png" alt="Timely PH Logo" class="w-10 h-10 rounded-xl" />
            <span class="text-2xl font-bold">
              <span class="text-palette-dark-blue dark:text-white">Timely</span>
              <span class="text-teal-500">PH</span>
            </span>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {{ currentYear }} Timely PH. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()

const currentYear = new Date().getFullYear()
const showLoginDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showLoginDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
