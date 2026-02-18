package com.frontend

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList = PackageList(this).packages,
      jsMainModulePath = "index",
      isHermesEnabled = true,
      useDevSupport = true,
      exceptionHandler = { exception: Exception -> 
        // Default exception handler
      }
    )
  }

  override val reactNativeHost: ReactNativeHost by lazy {
    object : ReactNativeHost(this) {
      override fun getPackages(): List<com.facebook.react.ReactPackage> {
        return PackageList(this@MainApplication).packages
      }

      override fun getUseDeveloperSupport(): Boolean {
        return BuildConfig.DEBUG
      }

      override fun getJSMainModuleName(): String {
        return "index"
      }
    }
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
