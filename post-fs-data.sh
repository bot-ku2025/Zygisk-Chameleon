#!/system/bin/sh
MODDIR=${0%/*}
CONF_DIR="/data/adb/zygisk_chameleon"

mkdir -p "$CONF_DIR/run"
chmod 700 "$CONF_DIR/run"

if [ -f "$CONF_DIR/config.json" ]; then
    echo "1" > "$CONF_DIR/run/active"
fi
