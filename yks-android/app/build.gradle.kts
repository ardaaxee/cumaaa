plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization")
}

fun quoted(value: String): String =
    "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""

android {
    namespace = "com.ardaaxee.ykslive"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.ardaaxee.ykslive"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        buildConfigField("String", "SUPABASE_URL", quoted("https://wvtkcjutgcigxyenwkfs.supabase.co"))
        buildConfigField("String", "SUPABASE_PUBLISHABLE_KEY", quoted("sb_publishable_mDx9F5vv4aUuRjrGbP1vkQ_LzdiYAJi"))
        buildConfigField("String", "TURN_URL", quoted(providers.gradleProperty("TURN_URL").orNull ?: ""))
        buildConfigField("String", "TURN_USERNAME", quoted(providers.gradleProperty("TURN_USERNAME").orNull ?: ""))
        buildConfigField("String", "TURN_PASSWORD", quoted(providers.gradleProperty("TURN_PASSWORD").orNull ?: ""))
    }

    buildFeatures { buildConfig = true }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
        }
    }
}

dependencies {
    implementation(platform("io.github.jan-tennert.supabase:bom:3.5.0"))
    implementation("io.github.jan-tennert.supabase:realtime-kt")
    implementation("io.ktor:ktor-client-okhttp:3.4.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    implementation("io.github.webrtc-sdk:android:150.7871.01")
}
