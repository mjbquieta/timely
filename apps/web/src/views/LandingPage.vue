<template>
  <div class="min-h-screen bg-palette-off-white">
    <!-- Navigation -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 bg-palette-off-white/95 backdrop-blur-sm border-b border-palette-light-beige"
    >
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-palette-dark-blue rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span class="text-2xl font-bold text-palette-dark-blue">Timely</span>
          </div>
          <div class="flex items-center space-x-4">
            <a
              href="#contact"
              class="px-4 py-2 text-palette-dark-blue hover:text-palette-medium-blue font-medium transition-colors"
            >
              Contact Us
            </a>
            <div class="relative" ref="dropdownRef">
              <button
                @click="showLoginDropdown = !showLoginDropdown"
                class="px-6 py-2.5 bg-palette-dark-blue text-white rounded-lg hover:bg-palette-medium-blue font-medium transition-colors inline-flex items-center space-x-2"
              >
                <span>Sign In</span>
                <svg
                  class="w-4 h-4 transition-transform"
                  :class="{ 'rotate-180': showLoginDropdown }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                v-if="showLoginDropdown"
                class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-palette-light-beige overflow-hidden z-50"
              >
                <router-link
                  to="/company/login"
                  class="flex items-center space-x-3 px-4 py-3 hover:bg-palette-off-white transition-colors"
                  @click="showLoginDropdown = false"
                >
                  <div
                    class="w-10 h-10 bg-palette-dark-blue/10 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-palette-dark-blue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-palette-dark-blue">Company</p>
                    <p class="text-sm text-palette-medium-blue">Multi-branch management</p>
                  </div>
                </router-link>
                <router-link
                  to="/branch/login"
                  class="flex items-center space-x-3 px-4 py-3 hover:bg-palette-off-white transition-colors border-t border-palette-light-beige"
                  @click="showLoginDropdown = false"
                >
                  <div
                    class="w-10 h-10 bg-palette-dark-blue/10 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-palette-dark-blue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-palette-dark-blue">Branch</p>
                    <p class="text-sm text-palette-medium-blue">Single location admin</p>
                  </div>
                </router-link>
                <router-link
                  to="/employee/login"
                  class="flex items-center space-x-3 px-4 py-3 hover:bg-palette-off-white transition-colors border-t border-palette-light-beige"
                  @click="showLoginDropdown = false"
                >
                  <div
                    class="w-10 h-10 bg-palette-dark-blue/10 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-palette-dark-blue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-semibold text-palette-dark-blue">Employee</p>
                    <p class="text-sm text-palette-medium-blue">View your attendance</p>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-8">
            <div class="inline-flex items-center px-4 py-2 bg-palette-light-beige/50 rounded-full">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              <span class="text-sm text-palette-medium-blue font-medium"
                >Trusted by businesses everywhere</span
              >
            </div>
            <h1 class="text-5xl lg:text-6xl font-bold text-palette-dark-blue leading-tight">
              Track attendance,<br />
              <span class="text-palette-medium-blue">effortlessly.</span>
            </h1>
            <p class="text-xl text-palette-medium-blue leading-relaxed max-w-lg">
              Timely connects to your biometric devices — fingerprint scanners, face recognition,
              and RFID readers — to automatically track when employees clock in and out.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                class="inline-flex items-center justify-center px-8 py-4 bg-palette-dark-blue text-white rounded-xl hover:bg-palette-medium-blue font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Contact Us
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <a
                href="#features"
                class="inline-flex items-center justify-center px-8 py-4 border-2 border-palette-light-beige text-palette-dark-blue rounded-xl hover:border-palette-medium-blue font-semibold text-lg transition-all"
              >
                See How It Works
              </a>
            </div>
          </div>
          <div class="relative">
            <div
              class="absolute inset-0 bg-gradient-to-br from-palette-dark-blue/10 to-palette-medium-blue/10 rounded-3xl transform rotate-3"
            ></div>
            <div
              class="relative bg-white rounded-3xl shadow-2xl p-8 border border-palette-light-beige"
            >
              <!-- Mock Dashboard Preview -->
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-palette-medium-blue">Today's Overview</p>
                    <p class="text-2xl font-bold text-palette-dark-blue">Tuesday, Jan 21</p>
                  </div>
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      class="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <div class="bg-palette-off-white rounded-xl p-4 text-center">
                    <p class="text-3xl font-bold text-green-600">24</p>
                    <p class="text-sm text-palette-medium-blue">Present</p>
                  </div>
                  <div class="bg-palette-off-white rounded-xl p-4 text-center">
                    <p class="text-3xl font-bold text-yellow-600">3</p>
                    <p class="text-sm text-palette-medium-blue">Late</p>
                  </div>
                  <div class="bg-palette-off-white rounded-xl p-4 text-center">
                    <p class="text-3xl font-bold text-red-600">1</p>
                    <p class="text-sm text-palette-medium-blue">Absent</p>
                  </div>
                </div>
                <div class="space-y-3">
                  <div
                    class="flex items-center justify-between p-3 bg-palette-off-white rounded-lg"
                  >
                    <div class="flex items-center space-x-3">
                      <div
                        class="w-10 h-10 bg-palette-dark-blue rounded-full flex items-center justify-center text-white font-semibold"
                      >
                        JD
                      </div>
                      <div>
                        <p class="font-medium text-palette-dark-blue">John Doe</p>
                        <p class="text-sm text-palette-medium-blue">Clocked in at 8:45 AM</p>
                      </div>
                    </div>
                    <!-- <span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">On Time</span> -->
                  </div>
                  <div
                    class="flex items-center justify-between p-3 bg-palette-off-white rounded-lg"
                  >
                    <div class="flex items-center space-x-3">
                      <div
                        class="w-10 h-10 bg-palette-medium-blue rounded-full flex items-center justify-center text-white font-semibold"
                      >
                        AS
                      </div>
                      <div>
                        <p class="font-medium text-palette-dark-blue">Ana Santos</p>
                        <p class="text-sm text-palette-medium-blue">Clocked in at 9:15 AM</p>
                      </div>
                    </div>
                    <!-- <span
                      class="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full"
                      >Late</span
                    > -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 px-6 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl font-bold text-palette-dark-blue mb-4">
            Everything you need to manage attendance
          </h2>
          <p class="text-xl text-palette-medium-blue">
            From biometric devices to detailed reports, Timely handles it all.
          </p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div
            class="group p-8 bg-palette-off-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-palette-dark-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-palette-dark-blue mb-3">Fingerprint Scanner</h3>
            <p class="text-palette-medium-blue leading-relaxed">
              Secure biometric authentication ensures only the right person clocks in. No more buddy
              punching.
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="group p-8 bg-palette-off-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-palette-dark-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-palette-dark-blue mb-3">Face Recognition</h3>
            <p class="text-palette-medium-blue leading-relaxed">
              Just show your face and you're clocked in. Fast, contactless, and incredibly accurate.
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            class="group p-8 bg-palette-off-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-palette-dark-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-palette-dark-blue mb-3">RFID Card</h3>
            <p class="text-palette-medium-blue leading-relaxed">
              Tap your card and go. Simple, reliable, and perfect for high-traffic workplaces.
            </p>
          </div>

          <!-- Feature 4 -->
          <div
            class="group p-8 bg-palette-off-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-palette-dark-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-palette-dark-blue mb-3">Real-time Reports</h3>
            <p class="text-palette-medium-blue leading-relaxed">
              See who's at work right now. Track patterns, identify issues, and make informed
              decisions.
            </p>
          </div>

          <!-- Feature 5 -->
          <div
            class="group p-8 bg-palette-off-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-palette-dark-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-palette-dark-blue mb-3">Multi-Branch Support</h3>
            <p class="text-palette-medium-blue leading-relaxed">
              Managing multiple locations? No problem. Track attendance across all your branches
              from one dashboard.
            </p>
          </div>

          <!-- Feature 6 -->
          <div
            class="group p-8 bg-palette-off-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 bg-palette-dark-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
            >
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-palette-dark-blue mb-3">Shift Management</h3>
            <p class="text-palette-medium-blue leading-relaxed">
              Create and manage work schedules. Automatically track late arrivals and early
              departures.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-20 px-6 bg-palette-dark-blue">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">How it works</h2>
          <p class="text-xl text-palette-light-beige">Get started in minutes, not hours.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <span class="text-3xl font-bold text-white">1</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Connect Your Device</h3>
            <p class="text-palette-light-beige">
              Link your fingerprint scanner, face recognition camera, or RFID reader to Timely.
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <span class="text-3xl font-bold text-white">2</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Add Your Team</h3>
            <p class="text-palette-light-beige">
              Register employees and enroll their biometric data. Organize them into departments.
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <span class="text-3xl font-bold text-white">3</span>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Start Tracking</h3>
            <p class="text-palette-light-beige">
              Employees clock in and out. You get real-time attendance data and reports.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 px-6 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <p class="text-5xl font-bold text-palette-dark-blue mb-2">99.9%</p>
            <p class="text-palette-medium-blue">Uptime Reliability</p>
          </div>
          <div>
            <p class="text-5xl font-bold text-palette-dark-blue mb-2">&lt;1s</p>
            <p class="text-palette-medium-blue">Clock-in Time</p>
          </div>
          <div>
            <p class="text-5xl font-bold text-palette-dark-blue mb-2">24/7</p>
            <p class="text-palette-medium-blue">Real-time Sync</p>
          </div>
          <div>
            <p class="text-5xl font-bold text-palette-dark-blue mb-2">100%</p>
            <p class="text-palette-medium-blue">Accurate Records</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 px-6 bg-palette-off-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold text-palette-dark-blue mb-4">
          Ready to simplify your attendance tracking?
        </h2>
        <p class="text-xl text-palette-medium-blue mb-8">
          Get in touch with us and we'll set up Timely for your business.
        </p>
        <div class="bg-white rounded-2xl shadow-lg p-8 max-w-xl mx-auto">
          <div class="space-y-6">
            <div class="flex items-center space-x-4 p-4 bg-palette-off-white rounded-xl">
              <div
                class="w-12 h-12 bg-palette-dark-blue rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div class="text-left">
                <p class="text-sm text-palette-medium-blue">Email us at</p>
                <a
                  href="mailto:hello@timely.com"
                  class="text-lg font-semibold text-palette-dark-blue hover:text-palette-medium-blue transition-colors"
                >
                  hello@timely.com
                </a>
              </div>
            </div>
            <div class="flex items-center space-x-4 p-4 bg-palette-off-white rounded-xl">
              <div
                class="w-12 h-12 bg-palette-dark-blue rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div class="text-left">
                <p class="text-sm text-palette-medium-blue">Call us at</p>
                <a
                  href="tel:+639123456789"
                  class="text-lg font-semibold text-palette-dark-blue hover:text-palette-medium-blue transition-colors"
                >
                  +63 912 345 6789
                </a>
              </div>
            </div>
          </div>
          <div class="mt-8 pt-6 border-t border-palette-light-beige">
            <p class="text-palette-medium-blue text-sm mb-4">Already a customer?</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <router-link
                to="/company/login"
                class="px-4 py-2 text-sm font-medium text-palette-dark-blue hover:bg-palette-off-white rounded-lg transition-colors"
              >
                Company Login
              </router-link>
              <router-link
                to="/branch/login"
                class="px-4 py-2 text-sm font-medium text-palette-dark-blue hover:bg-palette-off-white rounded-lg transition-colors"
              >
                Branch Login
              </router-link>
              <router-link
                to="/employee/login"
                class="px-4 py-2 text-sm font-medium text-palette-dark-blue hover:bg-palette-off-white rounded-lg transition-colors"
              >
                Employee Login
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-6 bg-palette-dark-blue">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="flex items-center space-x-2 mb-4 md:mb-0">
            <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span class="text-2xl font-bold text-white">Timely</span>
          </div>
          <p class="text-palette-light-beige text-sm">
            &copy; {{ currentYear }} Timely. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
