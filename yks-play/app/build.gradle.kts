/**
 * İyi ki YKS — Google Play paketi (Trusted Web Activity).
 * Uygulama, yayındaki web uygulamasını (https://ardaaxee.github.io/cumaaa/yks/) Chrome altyapısıyla
 * tam ekran açar; web sürümü güncellendiğinde Play'deki uygulama da güncel içeriği gösterir.
 *
 * İmzalama anahtarı depoda DEĞİLDİR. Yayın derlemesi şu ortam değişkenleriyle imzalanır:
 *   YKS_KEYSTORE_FILE, YKS_KEYSTORE_PASSWORD, YKS_KEY_ALIAS, YKS_KEY_PASSWORD
 */
plugins {
    id("com.android.application")
}

val siteHost = "ardaaxee.github.io"
val startUrl = "https://ardaaxee.github.io/cumaaa/yks/"

android {
    namespace = "io.github.ardaaxee.iyikiyks"
    compileSdk = 36

    defaultConfig {
        applicationId = "io.github.ardaaxee.iyikiyks"
        minSdk = 23
        targetSdk = 36
        versionCode = (System.getenv("YKS_VERSION_CODE") ?: "1").toInt()
        versionName = System.getenv("YKS_VERSION_NAME") ?: "1.0.0"

        manifestPlaceholders["hostName"] = siteHost
        manifestPlaceholders["defaultUrl"] = startUrl
        manifestPlaceholders["launcherName"] = "İyi ki YKS"
        manifestPlaceholders["themeColor"] = "#5B3FA0"
        manifestPlaceholders["navigationColor"] = "#F7F5FB"
        manifestPlaceholders["backgroundColor"] = "#F7F5FB"
    }

    val keystorePath = System.getenv("YKS_KEYSTORE_FILE")
    signingConfigs {
        if (keystorePath != null) {
            create("upload") {
                storeFile = file(keystorePath)
                storePassword = System.getenv("YKS_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("YKS_KEY_ALIAS") ?: "upload"
                keyPassword = System.getenv("YKS_KEY_PASSWORD") ?: System.getenv("YKS_KEYSTORE_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            if (keystorePath != null) signingConfig = signingConfigs.getByName("upload")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.5.0")
}
