# Configuration CMake pour la compatibilité 16KB
# CMake configuration for 16KB compatibility

cmake_minimum_required(VERSION 3.18.1)

# Configuration pour l'alignement 16KB
# Configuration for 16KB alignment
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -D_PAGE_SIZE=16384")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -D_PAGE_SIZE=16384")

# Options de liaison pour l'alignement 16KB
# Link options for 16KB alignment
set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,-z,max-page-size=16384")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,-z,max-page-size=16384")

# Configuration pour la compatibilité Android 15+
# Configuration for Android 15+ compatibility
set(CMAKE_ANDROID_PAGE_SIZE_AGNOSTIC ON)

# Définir les propriétés pour toutes les bibliothèques
# Set properties for all libraries
set_property(GLOBAL PROPERTY TARGET_SUPPORTS_SHARED_LIBS TRUE)

# Configuration des bibliothèques natives React Native
# React Native native libraries configuration
find_library(log-lib log)
find_library(reactnativejni-lib reactnativejni)
find_library(fbjni-lib fbjni)
find_library(folly_runtime-lib folly_runtime)
find_library(glog-lib glog)
find_library(yoga-lib yoga)
find_library(hermes-lib hermes)
find_library(jsi-lib jsi)

# Configuration pour l'alignement des bibliothèques
# Configuration for library alignment
target_link_libraries(${CMAKE_PROJECT_NAME}
    ${log-lib}
    ${reactnativejni-lib}
    ${fbjni-lib}
    ${folly_runtime-lib}
    ${glog-lib}
    ${yoga-lib}
    ${hermes-lib}
    ${jsi-lib}
)
