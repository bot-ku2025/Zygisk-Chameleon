#!/system/bin/sh
SKIPUNZIP=1

ui_print "**********************************************"
ui_print "          ZYGISK CHAMELEON                    "
ui_print "     Adaptive Root Cloaking Engine            "
ui_print "          Author: STNK                        "
ui_print "          Version: v1.1.0                     "
ui_print "**********************************************"

# Verify Root Environment
if [ -n "$KSU" ]; then
    ui_print "- Detected KernelSU (Kernel-level root)"
elif [ -n "$APATCH" ]; then
    ui_print "- Detected APatch (KernelPatch & SuperCall)"
elif [ -n "$MAGISK_VER" ]; then
    ui_print "- Detected Magisk ($MAGISK_VER)"
else
    ui_print "- Generic Root Environment Detected"
fi

# Verify Architecture
ui_print "- Device Architecture: $ARCH"
if [ "$ARCH" != "arm64" ] && [ "$ARCH" != "arm" ]; then
    abort "! Unsupported CPU Architecture: $ARCH. Only ARM/ARM64 devices supported."
fi

# Extract Files
ui_print "- Extracting module files to $MODPATH..."
unzip -o "$ZIPFILE" -x 'META-INF/*' -d "$MODPATH" >/dev/null 2>&1

# Setup Config Directory
CONF_DIR="/data/adb/zygisk_chameleon"
mkdir -p "$CONF_DIR"
mkdir -p "$CONF_DIR/profiles"
chmod 755 "$CONF_DIR"

if [ -f "$MODPATH/config.json" ] && [ ! -f "$CONF_DIR/config.json" ]; then
    cp "$MODPATH/config.json" "$CONF_DIR/config.json"
fi

# Permissions
set_perm_recursive "$MODPATH" 0 0 0755 0644
set_perm "$MODPATH/service.sh" 0 0 0755
set_perm "$MODPATH/post-fs-data.sh" 0 0 0755
set_perm "$MODPATH/action.sh" 0 0 0755

ui_print "- Configuring SELinux policies & shadow mounts..."
ui_print "- WebUI installed to $MODPATH/webroot"
ui_print "**********************************************"
ui_print " Installation Finished!                       "
ui_print " Please Reboot your phone to activate module. "
ui_print "**********************************************"
