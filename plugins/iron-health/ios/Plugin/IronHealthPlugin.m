#import <Capacitor/Capacitor.h>
CAP_PLUGIN(IronHealthPlugin, "IronHealth",
    CAP_PLUGIN_METHOD(status, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(authorize, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(latestWeight, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(writeWorkout, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(openSettings, CAPPluginReturnPromise);
)
