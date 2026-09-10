#!/system/bin/sh
MODDIR=${0%/*}
CONF_DIR="/data/adb/zygisk_chameleon"

until [ "$(getprop sys.boot_completed)" = "1" ]; do
    sleep 2
done

echo "[Zygisk Chameleon] Background service running at $(date)" >> "$CONF_DIR/daemon.log"

if [ -d "$MODDIR/webroot" ]; then
    chmod -R 755 "$MODDIR/webroot"
fi
