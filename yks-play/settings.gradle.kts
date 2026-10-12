pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}
rootProject.name = "IyikiYks"
include(":app")
// Birlikte Canlı ekran paylaşımı (depo kökündeki yks-live modülü)
include(":live")
project(":live").projectDir = file("../yks-live")
