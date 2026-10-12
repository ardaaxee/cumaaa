/**
 * Birlikte Canlı — İyi ki YKS uygulamasının içindeki Android ekran paylaşımı (kütüphane modülü).
 * Web'deki canlı odayla aynı uçtan uca şifreli Supabase/WebRTC protokolünü kullanır; doğrudan bağlantı
 * kurulamazsa ekranı şifreli JPEG karelerle aynı odadan gönderir (yedek yol).
 * yks-play bu modülü `:live` olarak içerir.
 */
plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization")
}

fun quoted(value: String): String =
    "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""

android {
    namespace = "com.ardaaxee.ykslive"
    compileSdk = 36

    defaultConfig {
        minSdk = 26
        consumerProguardFiles("consumer-rules.pro")

        buildConfigField("String", "SUPABASE_URL", quoted("https://wvtkcjutgcigxyenwkfs.supabase.co"))
        buildConfigField("String", "SUPABASE_PUBLISHABLE_KEY", quoted("sb_publishable_mDx9F5vv4aUuRjrGbP1vkQ_LzdiYAJi"))
        buildConfigField("String", "TURN_URL", quoted(providers.gradleProperty("TURN_URL").orNull ?: ""))
        buildConfigField("String", "TURN_USERNAME", quoted(providers.gradleProperty("TURN_USERNAME").orNull ?: ""))
        buildConfigField("String", "TURN_PASSWORD", quoted(providers.gradleProperty("TURN_PASSWORD").orNull ?: ""))
    }

    buildFeatures { buildConfig = true }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(platform("io.github.jan-tennert.supabase:bom:3.5.0"))
    implementation("io.github.jan-tennert.supabase:realtime-kt")
    implementation("io.ktor:ktor-client-okhttp:3.4.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    implementation("io.github.webrtc-sdk:android:150.7871.01")
    implementation("com.google.zxing:core:3.5.3")
    testImplementation("junit:junit:4.13.2")
}
