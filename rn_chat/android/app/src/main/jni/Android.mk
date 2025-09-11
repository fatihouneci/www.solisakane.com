# Configuration complète pour l'alignement 16KB des bibliothèques natives
# Complete configuration for 16KB alignment of native libraries

LOCAL_PATH := $(call my-dir)

# Alignement 16KB pour la compatibilité Android 15+
# 16KB alignment for Android 15+ compatibility
LOCAL_CFLAGS += -D_PAGE_SIZE=16384
LOCAL_LDFLAGS += -Wl,-z,max-page-size=16384

# Configuration pour toutes les bibliothèques React Native
# Configuration for all React Native libraries
include $(CLEAR_VARS)
LOCAL_MODULE := libc++_shared
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libc++_shared.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libcrypto
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libcrypto.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libevent-2.1
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libevent-2.1.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libevent_core-2.1
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libevent_core-2.1.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libevent_extra-2.1
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libevent_extra-2.1.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

# Bibliothèques React Native principales
# Main React Native libraries
include $(CLEAR_VARS)
LOCAL_MODULE := libreactnativejni
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libreactnativejni.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libhermes
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libhermes.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libyoga
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libyoga.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libjsi
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libjsi.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libfolly_runtime
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libfolly_runtime.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := libglog
LOCAL_SRC_FILES := $(TARGET_ARCH_ABI)/libglog.so
LOCAL_EXPORT_CFLAGS := -D_PAGE_SIZE=16384
include $(PREBUILT_SHARED_LIBRARY)
